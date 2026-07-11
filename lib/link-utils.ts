export type SavedLinkSearchFields = {
  title: string;
  domain: string;
  source: string;
  description: string;
  savedReason?: string;
  previewTitle: string;
  previewDescription: string;
  type: string;
  collection: string | null;
  tags: string[];
};

export type LinkDateFields = {
  createdAt: string;
  title: string;
};

const knownPlatformNames: Record<string, string> = {
  "github.com": "GitHub",
  "linear.app": "Linear",
  "react.dev": "React",
  "skills.sh": "Skills",
  "supabase.com": "Supabase",
  "twitch.tv": "Twitch",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
};

export function parseSavedLinkUrl(rawUrl: string) {
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl || /\s/.test(trimmedUrl)) {
    throw new Error("Enter a valid web address.");
  }

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
  const url = new URL(candidate);

  if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname.includes(".")) {
    throw new Error("Enter a valid http or https web address.");
  }

  const source = url.hostname.replace(/^www\./, "").toLowerCase();
  const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");

  return {
    href: url.href,
    source,
    domain: `${source}${path}`,
  };
}

export function isLikelyUrl(value: string) {
  try {
    parseSavedLinkUrl(value);
    return true;
  } catch {
    return false;
  }
}

export function getPlatformNameFromUrl(rawUrl: string) {
  const { source } = parseSavedLinkUrl(rawUrl);
  const knownName = knownPlatformNames[source];

  if (knownName) {
    return knownName;
  }

  const domainParts = source.split(".").filter(Boolean);
  const primaryDomainPart = domainParts.at(-2) ?? domainParts[0] ?? source;

  return primaryDomainPart
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function linkMatchesQuery(link: SavedLinkSearchFields, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    link.title,
    link.domain,
    link.source,
    link.description,
    link.savedReason ?? "",
    link.previewTitle,
    link.previewDescription,
    link.type,
    link.collection ?? "",
    ...link.tags,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

export function sortLinksByDateOrTitle<T extends LinkDateFields>(links: T[], sortBy: "recent" | "oldest" | "title") {
  return [...links].sort((left, right) => {
    if (sortBy === "title") {
      return left.title.localeCompare(right.title);
    }

    const delta = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    return sortBy === "oldest" ? delta : -delta;
  });
}

export function selectVisibleLink<T extends { id: string }>(visibleLinks: T[], selectedId: string) {
  return visibleLinks.find((link) => link.id === selectedId) ?? visibleLinks[0];
}

export function formatRelativeDate(value: string, now = Date.now()) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Unknown date";
  }

  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
