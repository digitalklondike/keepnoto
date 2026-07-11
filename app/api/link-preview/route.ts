import { type NextRequest } from "next/server";
import { getAuthenticatedApiUser } from "@/lib/api-auth";
import { consumeRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { normalizePublicHttpUrl, safeFetch } from "@/lib/safe-fetch";

export const dynamic = "force-dynamic";

const PAGE_FETCH_TIMEOUT_MS = 8000;
const ASSET_FETCH_TIMEOUT_MS = 2500;
const MANIFEST_FETCH_TIMEOUT_MS = 2500;
const MAX_HTML_BYTES = 1_000_000;
const MAX_MANIFEST_BYTES = 120_000;

const previewImageMetaKeys = [
  "og:image",
  "og:image:secure_url",
  "twitter:image",
  "twitter:image:src",
] as const;

type LinkPreviewResponse = {
  ok: boolean;
  url?: string;
  domain?: string;
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
  logo?: string;
  siteName?: string;
  type?: string;
  error?: string;
};

function decodeHtmlEntity(entity: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  if (entity.startsWith("#x")) {
    return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
  }

  if (entity.startsWith("#")) {
    return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
  }

  return namedEntities[entity] ?? `&${entity};`;
}

function cleanText(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return value
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => decodeHtmlEntity(entity))
    .replace(/\s+/g, " ")
    .trim() || undefined;
}

function getAttribute(tag: string, attribute: string) {
  const pattern = new RegExp(`\\s${attribute}\\s*=\\s*(?:"([^"\\r\\n]*)"|'([^'\\r\\n]*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return cleanText(match?.[1] ?? match?.[2] ?? match?.[3]);
}

function getMetaContent(html: string, key: string) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    const property = getAttribute(tag, "property")?.toLowerCase();
    const name = getAttribute(tag, "name")?.toLowerCase();

    if (property === key.toLowerCase() || name === key.toLowerCase()) {
      return getAttribute(tag, "content");
    }
  }

  return undefined;
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  return cleanText(match?.[1]?.replace(/<[^>]+>/g, ""));
}


function normalizeComparableText(value: string) {
  return value
    .toLowerCase()
    .replace(/[\s\-_\u2013\u2014|:]+/g, " ")
    .replace(/\.[a-z]{2,}$/i, "")
    .trim();
}

function isGenericTitleCandidate(title: string | undefined, siteName: string | undefined, pageUrl: URL) {
  if (!title) {
    return true;
  }

  const normalizedTitle = normalizeComparableText(title);
  const normalizedSiteName = siteName ? normalizeComparableText(siteName) : "";
  const normalizedDomain = normalizeComparableText(pageUrl.hostname.replace(/^www\./, ""));
  const normalizedHostLabel = normalizeComparableText(pageUrl.hostname.replace(/^www\./, "").split(".")[0] ?? "");

  return (
    normalizedTitle.length <= 1 ||
    normalizedTitle === normalizedSiteName ||
    normalizedTitle === normalizedDomain ||
    normalizedTitle === normalizedHostLabel
  );
}

function selectPreviewTitle(candidates: Array<string | undefined>, siteName: string | undefined, pageUrl: URL) {
  return candidates.find((candidate) => !isGenericTitleCandidate(candidate, siteName, pageUrl)) ?? candidates.find(Boolean);
}

function selectPreviewDescription(candidates: Array<string | undefined>) {
  const descriptions = candidates.filter((candidate): candidate is string => Boolean(candidate));
  const firstUsefulDescription = descriptions.find((candidate) => candidate.length >= 32);

  return firstUsefulDescription ?? descriptions.sort((a, b) => b.length - a.length)[0];
}
function getLinkTags(html: string) {
  return html.match(/<link\b[^>]*>/gi) ?? [];
}

function resolveAssetUrl(value: string | undefined, pageUrl: URL) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value, pageUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return url.href;
  } catch {
    return undefined;
  }
}

function getIconLinks(html: string) {
  return getLinkTags(html)
    .map((tag) => ({
      href: getAttribute(tag, "href"),
      rel: getAttribute(tag, "rel")?.toLowerCase() ?? "",
      sizes: getAttribute(tag, "sizes") ?? "",
    }))
    .filter((link) => link.href);
}

function getPreviewImageCandidates(html: string, pageUrl: URL) {
  return previewImageMetaKeys
    .map((key) => resolveAssetUrl(getMetaContent(html, key), pageUrl))
    .filter((image): image is string => Boolean(image && isLikelyPreviewImage(image)));
}

function isLikelyPreviewImage(value: string) {
  try {
    const url = new URL(value);
    const pathname = url.pathname.toLowerCase();

    if (pathname.endsWith(".ico") || pathname.includes("/favicon")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}


function getYouTubeVideoId(pageUrl: URL) {
  const hostname = pageUrl.hostname.replace(/^www\./, "");
  const pathParts = pageUrl.pathname.split("/").filter(Boolean);

  if (hostname === "youtu.be") {
    return pathParts[0];
  }

  if (hostname !== "youtube.com" && hostname !== "m.youtube.com") {
    return undefined;
  }

  if (pageUrl.pathname === "/watch") {
    return pageUrl.searchParams.get("v") ?? undefined;
  }

  if (["shorts", "embed", "live"].includes(pathParts[0] ?? "")) {
    return pathParts[1];
  }

  return undefined;
}

function isYouTubeChannelUrl(pageUrl: URL) {
  const hostname = pageUrl.hostname.replace(/^www\./, "");
  const pathParts = pageUrl.pathname.split("/").filter(Boolean);
  const firstPathPart = pathParts[0] ?? "";

  return (
    (hostname === "youtube.com" || hostname === "m.youtube.com") &&
    (firstPathPart.startsWith("@") || ["channel", "c", "user"].includes(firstPathPart))
  );
}

function getYouTubeVideoThumbnailCandidates(videoId: string | undefined) {
  if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
    return [];
  }

  return [
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/default.jpg`,
  ];
}
function getAppleIconCandidates(html: string, pageUrl: URL) {
  return getIconLinks(html)
    .filter((link) => {
      const relParts = link.rel.split(/\s+/);
      return relParts.includes("apple-touch-icon") || relParts.includes("apple-touch-icon-precomposed");
    })
    .sort((a, b) => getIconArea(b.sizes) - getIconArea(a.sizes))
    .map((link) => resolveAssetUrl(link.href, pageUrl))
    .filter((href): href is string => Boolean(href));
}

function getFaviconCandidates(html: string, pageUrl: URL) {
  const icons = getIconLinks(html).filter((link) => {
    const relParts = link.rel.split(/\s+/);
    return relParts.includes("icon") || link.rel === "shortcut icon";
  });

  return [
    ...icons
      .sort((a, b) => getIconArea(b.sizes) - getIconArea(a.sizes))
      .map((link) => resolveAssetUrl(link.href, pageUrl)),
    new URL("/favicon.ico", pageUrl.origin).href,
  ].filter((href): href is string => Boolean(href));
}
function findManifestHref(html: string, pageUrl: URL) {
  const manifest = getLinkTags(html).find((tag) => getAttribute(tag, "rel")?.toLowerCase() === "manifest");

  return resolveAssetUrl(getAttribute(manifest ?? "", "href"), pageUrl);
}

function getIconArea(sizes: string) {
  const match = sizes.match(/(\d+)x(\d+)/i);

  if (!match) {
    return 0;
  }

  return Number(match[1]) * Number(match[2]);
}

async function fetchText(url: string, maxBytes: number, timeoutMs = PAGE_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await safeFetch(url, {
      cache: "no-store",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent": "Keepnoto-LinkPreview/0.1",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const reader = response.body?.getReader();

    if (!reader) {
      return response.text();
    }

    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (receivedBytes < maxBytes) {
      const { done, value } = await reader.read();

      if (done || !value) {
        break;
      }

      chunks.push(value);
      receivedBytes += value.byteLength;
    }

    return new TextDecoder().decode(concatChunks(chunks, Math.min(receivedBytes, maxBytes)));
  } finally {
    clearTimeout(timeout);
  }
}

function concatChunks(chunks: Uint8Array[], length: number) {
  const result = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    const nextChunk = chunk.slice(0, Math.min(chunk.byteLength, length - offset));
    result.set(nextChunk, offset);
    offset += nextChunk.byteLength;

    if (offset >= length) {
      break;
    }
  }

  return result;
}

async function findManifestIconCandidates(manifestHref: string | undefined, pageUrl: URL) {
  if (!manifestHref) {
    return [];
  }

  try {
    const manifestText = await fetchText(manifestHref, MAX_MANIFEST_BYTES, MANIFEST_FETCH_TIMEOUT_MS);
    const manifest = JSON.parse(manifestText) as { icons?: Array<{ src?: string; sizes?: string; purpose?: string }> };
    const manifestUrl = new URL(manifestHref, pageUrl);

    return (manifest.icons ?? [])
      .filter((icon) => icon.src && !icon.purpose?.includes("maskable"))
      .sort((a, b) => getIconArea(b.sizes ?? "") - getIconArea(a.sizes ?? ""))
      .map((icon) => resolveAssetUrl(icon.src, manifestUrl))
      .filter((href): href is string => Boolean(href));
  } catch {
    return [];
  }
}

function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls));
}

function isLikelyImagePath(value: string) {
  try {
    return /\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:$|[?#])/i.test(new URL(value).pathname);
  } catch {
    return false;
  }
}

async function isUsableImage(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ASSET_FETCH_TIMEOUT_MS);

  try {
    const response = await safeFetch(url, {
      cache: "no-store",
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "user-agent": "Keepnoto-LinkPreview/0.1",
      },
      signal: controller.signal,
    });

    await response.body?.cancel();

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    return contentType.startsWith("image/") || (!contentType.includes("text/html") && isLikelyImagePath(response.url));
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function findFirstUsableImage(candidates: string[]) {
  const uniqueCandidates = uniqueUrls(candidates);
  const checks = await Promise.all(uniqueCandidates.map(async (candidate) => isUsableImage(candidate)));

  return uniqueCandidates.find((_, index) => checks[index]);
}

async function findBestDeclaredImage(candidates: string[]) {
  return (await findFirstUsableImage(candidates)) ?? uniqueUrls(candidates)[0];
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedApiUser();

  if (!user) {
    return Response.json({ ok: false, error: "Authentication required." } satisfies LinkPreviewResponse, { status: 401 });
  }

  const rateLimit = consumeRateLimit(`link-preview:${user.id}`, { limit: 20, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return Response.json(
      { ok: false, error: "Too many preview requests. Please try again shortly." } satisfies LinkPreviewResponse,
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return Response.json({ ok: false, error: "Missing url parameter." } satisfies LinkPreviewResponse, { status: 400 });
  }

  try {
    const pageUrl = normalizePublicHttpUrl(rawUrl);
    const html = await fetchText(pageUrl.href, MAX_HTML_BYTES);
    const manifestIcons = await findManifestIconCandidates(findManifestHref(html, pageUrl), pageUrl);
    const previewImageCandidates = getPreviewImageCandidates(html, pageUrl);
    const youtubeVideoId = getYouTubeVideoId(pageUrl);
    const youtubeVideoImageCandidates = getYouTubeVideoThumbnailCandidates(youtubeVideoId);
    const youtubeChannelImageCandidates = isYouTubeChannelUrl(pageUrl) ? previewImageCandidates : [];
    const appleIconCandidates = getAppleIconCandidates(html, pageUrl);
    const faviconCandidates = getFaviconCandidates(html, pageUrl);
    const defaultFaviconCandidate = new URL("/favicon.ico", pageUrl.origin).href;
    const brandIconCandidates = [...appleIconCandidates, ...manifestIcons];
    const browserIconCandidates = [...faviconCandidates, defaultFaviconCandidate];
    const siteName = getMetaContent(html, "og:site_name");
    const documentTitle = getTitle(html);
    const image =
      (await findBestDeclaredImage([...youtubeVideoImageCandidates, ...youtubeChannelImageCandidates, ...previewImageCandidates])) ??
      undefined;
    const icon =
      (await findFirstUsableImage([...browserIconCandidates, ...brandIconCandidates])) ??
      uniqueUrls([...browserIconCandidates, ...brandIconCandidates])[0];
    const logo =
      (await findFirstUsableImage([...youtubeChannelImageCandidates, ...brandIconCandidates, ...browserIconCandidates])) ??
      icon;
    return Response.json({
      ok: true,
      url: pageUrl.href,
      domain: pageUrl.hostname.replace(/^www\./, ""),
      title: selectPreviewTitle(
        [getMetaContent(html, "og:title"), getMetaContent(html, "twitter:title"), documentTitle, siteName],
        siteName,
        pageUrl
      ),
      description: selectPreviewDescription([
        getMetaContent(html, "og:description"),
        getMetaContent(html, "twitter:description"),
        getMetaContent(html, "description"),
      ]),
      image,
      icon,
      logo,
      siteName,
      type: getMetaContent(html, "og:type"),
    } satisfies LinkPreviewResponse);
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to fetch link preview." } satisfies LinkPreviewResponse,
      { status: 422 }
    );
  }
}
