import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_SAFE_REDIRECTS = 5;

const blockedHostnames = new Set(["localhost", "localhost.localdomain"]);

type SafeFetchOptions = Omit<RequestInit, "redirect" | "signal"> & {
  signal?: AbortSignal;
};

function normalizeHost(value: string) {
  return value.toLowerCase().replace(/^\[(.*)\]$/, "$1").replace(/\.$/, "");
}

function isIPv4InCidr(ip: string, range: string, bits: number) {
  const ipParts = ip.split(".").map(Number);
  const rangeParts = range.split(".").map(Number);

  if (ipParts.length !== 4 || rangeParts.length !== 4 || ipParts.some((part) => Number.isNaN(part)) || rangeParts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const ipValue = ipParts.reduce((value, part) => (value << 8) + part, 0) >>> 0;
  const rangeValue = rangeParts.reduce((value, part) => (value << 8) + part, 0) >>> 0;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;

  return (ipValue & mask) === (rangeValue & mask);
}

function isBlockedIPv4(ip: string) {
  return (
    isIPv4InCidr(ip, "0.0.0.0", 8) ||
    isIPv4InCidr(ip, "10.0.0.0", 8) ||
    isIPv4InCidr(ip, "100.64.0.0", 10) ||
    isIPv4InCidr(ip, "127.0.0.0", 8) ||
    isIPv4InCidr(ip, "169.254.0.0", 16) ||
    isIPv4InCidr(ip, "172.16.0.0", 12) ||
    isIPv4InCidr(ip, "192.0.0.0", 24) ||
    isIPv4InCidr(ip, "192.0.2.0", 24) ||
    isIPv4InCidr(ip, "192.168.0.0", 16) ||
    isIPv4InCidr(ip, "198.18.0.0", 15) ||
    isIPv4InCidr(ip, "198.51.100.0", 24) ||
    isIPv4InCidr(ip, "203.0.113.0", 24) ||
    isIPv4InCidr(ip, "224.0.0.0", 4) ||
    isIPv4InCidr(ip, "240.0.0.0", 4)
  );
}

function isBlockedIPv6(ip: string) {
  const normalized = normalizeHost(ip);

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(normalized) ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab][0-9a-f]:/.test(normalized) ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:")
  );
}

function assertPublicAddress(address: string) {
  const normalizedAddress = normalizeHost(address);
  const addressType = isIP(normalizedAddress);

  if (addressType === 4 && isBlockedIPv4(normalizedAddress)) {
    throw new Error("Private or internal URLs are not supported.");
  }

  if (addressType === 6 && isBlockedIPv6(normalizedAddress)) {
    throw new Error("Private or internal URLs are not supported.");
  }
}

export function normalizePublicHttpUrl(value: string) {
  const trimmed = value.trim();
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }

  return url;
}

export async function assertPublicHttpUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }

  const hostname = normalizeHost(url.hostname);

  if (!hostname.includes(".") && !hostname.includes(":")) {
    throw new Error("Private or internal URLs are not supported.");
  }

  if (blockedHostnames.has(hostname) || hostname.endsWith(".localhost")) {
    throw new Error("Private or internal URLs are not supported.");
  }

  const hostnameIpType = isIP(hostname);

  if (hostnameIpType) {
    assertPublicAddress(hostname);
    return;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });

  if (addresses.length === 0) {
    throw new Error("Unable to resolve URL host.");
  }

  addresses.forEach(({ address }) => assertPublicAddress(address));
}

export async function safeFetch(url: URL | string, options: SafeFetchOptions = {}) {
  let currentUrl = typeof url === "string" ? normalizePublicHttpUrl(url) : url;

  for (let redirectCount = 0; redirectCount <= MAX_SAFE_REDIRECTS; redirectCount += 1) {
    await assertPublicHttpUrl(currentUrl);

    const response = await fetch(currentUrl.href, {
      ...options,
      redirect: "manual",
      signal: options.signal,
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return response;
    }

    const location = response.headers.get("location");
    await response.body?.cancel();

    if (!location) {
      return response;
    }

    currentUrl = new URL(location, currentUrl);
  }

  throw new Error("Too many redirects while fetching URL.");
}