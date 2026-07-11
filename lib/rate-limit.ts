type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
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

export function consumeRateLimit(key: string, { limit, windowMs }: RateLimitOptions) {
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

export function getRateLimitHeaders(result: ReturnType<typeof consumeRateLimit>) {
  return {
    "retry-after": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1_000))),
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(Math.ceil(result.resetAt / 1_000)),
  };
}
