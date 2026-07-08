import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 8000;
const MAX_MEDIA_BYTES = 4_000_000;

function normalizeMediaUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https media URLs are supported.");
  }

  return url;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new Response("Missing url parameter.", { status: 400 });
  }

  try {
    const mediaUrl = normalizeMediaUrl(rawUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(mediaUrl.href, {
        cache: "force-cache",
        headers: {
          accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "user-agent": "Keepnoto-MediaProxy/0.1",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      if (!response.ok) {
        return new Response("Unable to fetch media.", { status: 404 });
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

      if (!contentType.startsWith("image/")) {
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
          "content-type": contentType,
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