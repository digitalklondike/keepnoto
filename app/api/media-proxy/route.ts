import { type NextRequest } from "next/server";
import { getAuthenticatedApiUser } from "@/lib/api-auth";
import { consumeRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { normalizePublicHttpUrl, safeFetch } from "@/lib/safe-fetch";

export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 8000;
const MAX_MEDIA_BYTES = 4_000_000;

function getImageContentTypeFromPath(value: string) {
  try {
    const pathname = new URL(value).pathname.toLowerCase();

    if (pathname.endsWith(".svg")) {
      return "image/svg+xml";
    }

    if (pathname.endsWith(".png")) {
      return "image/png";
    }

    if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
      return "image/jpeg";
    }

    if (pathname.endsWith(".webp")) {
      return "image/webp";
    }

    if (pathname.endsWith(".avif")) {
      return "image/avif";
    }

    if (pathname.endsWith(".gif")) {
      return "image/gif";
    }

    if (pathname.endsWith(".ico")) {
      return "image/x-icon";
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedApiUser();

  if (!user) {
    return new Response("Authentication required.", { status: 401 });
  }

  const rateLimit = consumeRateLimit(`media-proxy:${user.id}`, { limit: 120, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return new Response("Too many media requests. Please try again shortly.", {
      status: 429,
      headers: getRateLimitHeaders(rateLimit),
    });
  }
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new Response("Missing url parameter.", { status: 400 });
  }

  try {
    const mediaUrl = normalizePublicHttpUrl(rawUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await safeFetch(mediaUrl, {
        cache: "force-cache",
        headers: {
          accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "user-agent": "Keepnoto-MediaProxy/0.1",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return new Response("Unable to fetch media.", { status: 404 });
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      const fallbackContentType = getImageContentTypeFromPath(response.url);
      const responseLooksLikeImage = contentType.startsWith("image/") || (Boolean(fallbackContentType) && !contentType.includes("text/html"));

      if (!responseLooksLikeImage) {
        return new Response("Unsupported media type.", { status: 415 });
      }

      const contentLength = Number(response.headers.get("content-length") ?? 0);

      if (contentLength > MAX_MEDIA_BYTES) {
        return new Response("Media is too large.", { status: 413 });
      }

      const mediaBuffer = await response.arrayBuffer();

      if (mediaBuffer.byteLength > MAX_MEDIA_BYTES) {
        return new Response("Media is too large.", { status: 413 });
      }

      return new Response(mediaBuffer, {
        headers: {
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=86400, s-maxage=604800",
          "content-type": contentType.startsWith("image/") ? contentType : fallbackContentType ?? "application/octet-stream",
          "x-content-type-options": "nosniff",
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to proxy media.", { status: 422 });
  }
}
