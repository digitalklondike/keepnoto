import type { SupabaseClient } from "@supabase/supabase-js";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const rateLimitEntries = new Map<string, RateLimitEntry>();
const MAX_TRACKED_KEYS = 5_000;

function removeExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitEntries) {
    if (entry.resetAt <= now) {
      rateLimitEntries.delete(key);
    }
  }
}

export function consumeRateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const current = rateLimitEntries.get(key);

  if (!current || current.resetAt <= now) {
    if (rateLimitEntries.size >= MAX_TRACKED_KEYS) {
      removeExpiredEntries(now);
    }

    const resetAt = now + windowMs;
    rateLimitEntries.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

function isMissingRateLimitRpc(error: { code?: string; message: string } | null) {
  return error?.code === "PGRST202" || Boolean(error?.message.toLowerCase().includes("consume_api_rate_limit"));
}

export async function consumeApiRateLimit(
  supabase: SupabaseClient,
  userId: string,
  scope: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("consume_api_rate_limit", {
    p_scope: scope,
    p_limit: options.limit,
    p_window_seconds: Math.max(1, Math.ceil(options.windowMs / 1_000)),
  });

  if (!error) {
    const row = Array.isArray(data) ? data[0] : data;

    if (row && typeof row.allowed === "boolean") {
      return {
        allowed: row.allowed,
        remaining: Number(row.remaining ?? 0),
        resetAt: new Date(row.reset_at).getTime(),
      };
    }
  }

  if (error && !isMissingRateLimitRpc(error)) {
    console.error("Distributed rate limit failed", { scope, code: error.code });
  }

  // Rollout fallback for deployments that have not applied the hardening migration yet.
  return consumeRateLimit(`${scope}:${userId}`, options);
}

export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    "retry-after": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1_000))),
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(Math.ceil(result.resetAt / 1_000)),
  };
}
