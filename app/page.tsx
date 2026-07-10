"use client";

import Image from "next/image";
import * as React from "react";
import { flushSync } from "react-dom";
import { Dropdown, DropdownItem } from "@/components/keepnoto/dropdown";
import { LargeTextField } from "@/components/keepnoto/large-text-field";
import { MultiSelect, type MultiSelectOption } from "@/components/keepnoto/multi-select";
import { Tooltip } from "@/components/keepnoto/tooltip";
import { AuthScreen } from "@/components/keepnoto/auth-screen";
import {
  FILTER_TAB_GAP,
  FILTER_TAB_MORE_WIDTH,
  FILTER_TAB_ROW_WIDTH,
  FLOATING_SIDE_OFFSET,
  SAVED_REASON_INPUT_MAX_LENGTH,
  TAG_MAX_LENGTH,
} from "@/components/keepnoto/design-constants";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { LinkCard } from "@/components/keepnoto/link-card";
import { cn } from "@/lib/utils";
import {
  BrandLogo,
  Button,
  Icon,
  IconButton,
  Icons,
  LinkPreviewCard,
  SavedReason,
  Tag,
  Tab,
  TextField,
} from "@/components/keepnoto/product-components";


const filterTabs = [
  { label: "All links" },
  { label: "auth" },
  { label: "design" },
  { label: "react" },
  { label: "frontend" },
  { label: "docs" },
  { label: "supabase" },
];

const SAVED_REASON_FIELD_LABEL = "Why I saved this";
const SAVED_REASON_PLACEHOLDER = "Why will this matter later?";
const LIBRARY_STORAGE_KEY = "keepnoto.library.v1";
const PROFILE_STORAGE_KEY = "keepnoto.profile.v1";
const AUTH_STORAGE_KEY = "keepnoto.auth-preview.v1";
const AUTH_SIGNED_OUT_KEY = "keepnoto.auth-preview.signed-out.v1";
const MAX_AVATAR_FILE_BYTES = 1_500_000;

const sortOptions = [
  { id: "recent", label: "Recently saved" },
  { id: "oldest", label: "Oldest saved" },
  { id: "title", label: "Title A-Z" },
] as const;

type SortOptionId = (typeof sortOptions)[number]["id"];

type SavedLink = {
  id: string;
  title: string;
  domain: string;
  source: string;
  description: string;
  savedReason?: string;
  previewTitle: string;
  previewDescription: string;
  href: string;
  faviconSrc?: string;
  previewLogoSrc?: string;
  metadataImageSrc?: string;
  type: string;
  collection: string | null;
  tags: string[];
  addedDate: string;
  logoColor: string;
  favorite?: boolean;
};

type PersistedLibraryState = {
  availableTagValues?: string[];
  favoriteLinkIds?: string[];
  links?: SavedLink[];
};

type LinkPreviewMetadata = {
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
};

type UserProfile = {
  name: string;
  email: string;
  avatarDataUrl?: string;
};

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Nora Keep",
  email: "nora@keepnoto.app",
};

type LocalSession = {
  email: string;
};

function createUserProfile(email: string): UserProfile {
  if (email === DEFAULT_USER_PROFILE.email) {
    return DEFAULT_USER_PROFILE;
  }

  const emailName = email.split("@")[0] ?? "";
  const name = emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    name: name || "Keepnoto user",
    email,
  };
}

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

const savedLinks: SavedLink[] = [
  {
    id: "supabase-auth",
    title: "Supabase Auth - Documentation",
    domain: "supabase.com/docs/guides/auth",
    source: "supabase.com",
    description:
      "The cleanest explanation of magic links and OAuth providers. The session refresh flow finally clicked.",
    previewTitle: "Supabase Docs",
    previewDescription:
      "Production-ready backend for app developers.\nPostgres, Auth, Storage and Edge Functions.",
    savedReason:
      "The cleanest explanation of magic links and OAuth providers I found. Coming back when I wire auth into the side project.",
    href: "https://supabase.com/docs/guides/auth",
    type: "Documentation",
    collection: null,
    tags: ["auth", "docs", "supabase"],
    addedDate: "2 days ago",
    logoColor: "var(--favicon-1)",
  },
  {
    id: "linear-design",
    title: "Linear Design System Notes",
    domain: "linear.app/changelog/design-system",
    source: "linear.app",
    description:
      "A quiet reference for spacing, density, and focused product surfaces that still feel personal.",
    previewTitle: "Linear Changelog",
    previewDescription:
      "Product updates and design notes from Linear. Useful for studying crisp workflows and calm defaults.",
    savedReason:
      "Keeping this as a reference for dense product UI that still feels calm, readable, and intentional.",
    href: "https://linear.app/changelog/design-system",
    type: "Reference",
    collection: "Design references",
    tags: ["design", "frontend"],
    addedDate: "3 days ago",
    logoColor: "var(--favicon-2)",
  },
  {
    id: "react-cache",
    title: "React Cache Patterns",
    domain: "react.dev/reference/react/cache",
    source: "react.dev",
    description:
      "A compact explanation of where cache boundaries help and where they make data flow harder to reason about.",
    previewTitle: "React Reference",
    previewDescription:
      "Official React API reference with examples for cache and server rendering patterns.",
    href: "https://react.dev/reference/react/cache",
    type: "Guide",
    collection: "React",
    tags: ["react", "frontend", "docs"],
    addedDate: "5 days ago",
    logoColor: "var(--favicon-3)",
  },
  {
    id: "frontend-checklist",
    title: "Frontend Review Checklist",
    domain: "frontendchecklist.io",
    source: "frontendchecklist.io",
    description:
      "Useful before shipping a page: accessibility, metadata, performance, responsive behavior, and edge cases.",
    previewTitle: "Frontend Checklist",
    previewDescription:
      "A practical checklist for production frontend quality across UX, HTML, CSS, JavaScript, and performance.",
    href: "https://frontendchecklist.io",
    type: "Checklist",
    collection: null,
    tags: ["frontend", "docs"],
    addedDate: "1 week ago",
    logoColor: "var(--favicon-4)",
  },
  {
    id: "supabase-rls",
    title: "Supabase Row Level Security",
    domain: "supabase.com/docs/guides/database/postgres/row-level-security",
    source: "supabase.com",
    description:
      "The examples are direct enough to keep around for auth policy work and quick security reviews.",
    previewTitle: "Supabase RLS",
    previewDescription:
      "Guides for Postgres row level security, policies, and secure data access in Supabase projects.",
    href: "https://supabase.com/docs/guides/database/postgres/row-level-security",
    type: "Documentation",
    collection: null,
    tags: ["auth", "docs", "supabase"],
    addedDate: "9 days ago",
    logoColor: "var(--favicon-5)",
  },
];
const linkLogoColors = [
  "var(--favicon-1)",
  "var(--favicon-2)",
  "var(--favicon-3)",
  "var(--favicon-4)",
  "var(--favicon-5)",
];

function normalizeTagValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase().slice(0, TAG_MAX_LENGTH);
}

function estimateFilterTabWidth(tab: { label: string; count?: number }) {
  if (tab.label === "All links") {
    return 88;
  }

  const labelWidth = Math.min(tab.label.length, TAG_MAX_LENGTH) * 8.5;
  const hashWidth = 14;
  const countWidth = typeof tab.count === "number" ? String(tab.count).length * 8 + 16 : 0;

  return Math.ceil(32 + hashWidth + labelWidth + countWidth);
}

function estimateFilterTabRowWidth(labels: string[], items: { label: string; count?: number }[], includeMore: boolean) {
  const itemByLabel = new Map(items.map((item) => [item.label, item]));
  const visibleWidth = labels.reduce((total, label) => total + estimateFilterTabWidth(itemByLabel.get(label) ?? { label }), 0);
  const itemCount = labels.length + (includeMore ? 1 : 0);

  return visibleWidth + (includeMore ? FILTER_TAB_MORE_WIDTH : 0) + FILTER_TAB_GAP * Math.max(itemCount - 1, 0);
}
function toTagOptions(tags: string[]): MultiSelectOption[] {
  return Array.from(new Set(tags.map(normalizeTagValue).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b))
    .map((tag) => ({ value: tag, label: tag }));
}

function getLinkParts(rawUrl: string) {
  const trimmedUrl = rawUrl.trim();
  const hrefCandidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;

  try {
    const url = new URL(hrefCandidate);
    const source = url.hostname.replace(/^www\./, "");
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");

    return {
      href: url.href,
      source,
      domain: `${source}${path}`,
    };
  } catch {
    return {
      href: trimmedUrl,
      source: trimmedUrl || "saved link",
      domain: trimmedUrl || "saved link",
    };
  }
}

function isLikelyUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue || /\s/.test(trimmedValue)) {
    return false;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return true;
  }

  return /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(trimmedValue);
}

function getPlatformNameFromUrl(rawUrl: string) {
  const { source } = getLinkParts(rawUrl);
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
async function fetchLinkPreviewMetadata(url: string) {
  try {
    const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const metadata = (await response.json()) as LinkPreviewMetadata;

    return metadata.ok ? metadata : null;
  } catch {
    return null;
  }
}

const navItems = [
  { label: "Links", icon: Icons.link, active: true },
  { label: "Tags", icon: Icons.tag },
  { label: "Collections", icon: Icons.folder },
  { label: "Reading", icon: Icons.book },
];

function orderLinksByFavorite(links: SavedLink[], favoriteLinkIds: Set<string>) {
  const favoriteLinks = links.filter((link) => favoriteLinkIds.has(link.id));
  const regularLinks = links.filter((link) => !favoriteLinkIds.has(link.id));

  return [...favoriteLinks, ...regularLinks];
}

function sortLinks(links: SavedLink[], sortBy: SortOptionId) {
  if (sortBy === "oldest") {
    return [...links].reverse();
  }

  if (sortBy === "title") {
    return [...links].sort((a, b) => a.title.localeCompare(b.title));
  }

  return links;
}

type SocialLogoName = "x" | "facebook" | "linkedin";

function SocialLogo({ name }: { name: SocialLogoName }) {
  if (name === "x") {
    return (
      <svg aria-hidden="true" className="size-[var(--size-20)] text-[var(--social-x)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg aria-hidden="true" className="size-[var(--size-20)] text-[var(--social-facebook)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-[var(--size-20)] text-[var(--social-linkedin)]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.37-1.852 3.602 0 4.267 2.371 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.559V9h3.555v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
    </svg>
  );
}


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSavedLink(value: unknown): value is SavedLink {
  if (!isRecord(value)) {
    return false;
  }

  const requiredStringKeys: Array<keyof SavedLink> = [
    "id",
    "title",
    "domain",
    "source",
    "description",
    "previewTitle",
    "previewDescription",
    "href",
    "type",
    "addedDate",
    "logoColor",
  ];

  return (
    requiredStringKeys.every((key) => typeof value[key] === "string") &&
    (value.collection === null || typeof value.collection === "string") &&
    isStringArray(value.tags) &&
    (value.savedReason === undefined || typeof value.savedReason === "string") &&
    (value.faviconSrc === undefined || typeof value.faviconSrc === "string") &&
    (value.previewLogoSrc === undefined || typeof value.previewLogoSrc === "string") &&
    (value.metadataImageSrc === undefined || typeof value.metadataImageSrc === "string") &&
    (value.favorite === undefined || typeof value.favorite === "boolean")
  );
}

function isUserProfile(value: unknown): value is UserProfile {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    (value.avatarDataUrl === undefined || typeof value.avatarDataUrl === "string")
  );
}

function readPersistedProfileState(storageKey: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const rawState = window.localStorage.getItem(storageKey);

    if (!rawState) {
      return undefined;
    }

    const parsedState: unknown = JSON.parse(rawState);

    return isUserProfile(parsedState) ? parsedState : undefined;
  } catch {
    return undefined;
  }
}

function getProfileInitials(profile: UserProfile) {
  const source = profile.name.trim() || profile.email.trim() || "User";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0] ?? ""}${parts[1][0] ?? ""}` : source.slice(0, 2);

  return initials.toUpperCase();
}

function readPersistedLibraryState(storageKey: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const rawState = window.localStorage.getItem(storageKey);

    if (!rawState) {
      return undefined;
    }

    const parsedState: unknown = JSON.parse(rawState);

    if (!isRecord(parsedState)) {
      return undefined;
    }

    const links = Array.isArray(parsedState.links) && parsedState.links.every(isSavedLink) ? parsedState.links : undefined;
    const favoriteLinkIds = isStringArray(parsedState.favoriteLinkIds) ? parsedState.favoriteLinkIds : undefined;
    const availableTagValues = isStringArray(parsedState.availableTagValues) ? parsedState.availableTagValues : undefined;

    return { availableTagValues, favoriteLinkIds, links } satisfies PersistedLibraryState;
  } catch {
    return undefined;
  }
}
function isLocalSession(value: unknown): value is LocalSession {
  return isRecord(value) && typeof value.email === "string";
}

function getAccountStorageKey(baseKey: string, email: string) {
  return email === DEFAULT_USER_PROFILE.email ? baseKey : `${baseKey}:${encodeURIComponent(email.toLowerCase())}`;
}

export default function Home() {
  const [authSession, setAuthSession] = React.useState<LocalSession | null | undefined>(undefined);

  React.useEffect(() => {
    let nextSession: LocalSession | null = null;

    try {
      const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const parsedSession: unknown = storedSession ? JSON.parse(storedSession) : null;

      if (isLocalSession(parsedSession)) {
        nextSession = parsedSession;
      } else {
        const explicitlySignedOut = window.localStorage.getItem(AUTH_SIGNED_OUT_KEY) === "1";
        const hasLegacyData =
          window.localStorage.getItem(LIBRARY_STORAGE_KEY) !== null ||
          window.localStorage.getItem(PROFILE_STORAGE_KEY) !== null;

        if (!explicitlySignedOut && hasLegacyData) {
          nextSession = { email: DEFAULT_USER_PROFILE.email };
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        }
      }
    } catch {
      nextSession = null;
    }

    queueMicrotask(() => setAuthSession(nextSession));
  }, []);

  const handleAuthenticated = (email: string) => {
    const nextSession = { email };

    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      window.localStorage.removeItem(AUTH_SIGNED_OUT_KEY);
    } catch {
      // The local preview remains usable even if persistence is unavailable.
    }

    setAuthSession(nextSession);
  };

  const handleSignOut = () => {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.setItem(AUTH_SIGNED_OUT_KEY, "1");
    } catch {
      // Signing out should still update the current view.
    }

    setAuthSession(null);
  };

  if (authSession === undefined) {
    return (
      <main className="auth-canvas relative flex h-dvh w-dvw items-center justify-center overflow-hidden">
        <BrandLogo className="relative animate-pulse" size={40} />
      </main>
    );
  }

  if (authSession === null) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return <KeepnotoWorkspace key={authSession.email} onSignOut={handleSignOut} session={authSession} />;
}

function KeepnotoWorkspace({ session, onSignOut }: { session: LocalSession; onSignOut: () => void }) {
  const libraryStorageKey = getAccountStorageKey(LIBRARY_STORAGE_KEY, session.email);
  const profileStorageKey = getAccountStorageKey(PROFILE_STORAGE_KEY, session.email);
  const initialLinks = session.email === DEFAULT_USER_PROFILE.email ? savedLinks : [];
  const initialProfile = createUserProfile(session.email);
  const [libraryBoundary, setLibraryBoundary] = React.useState<HTMLElement | null>(null);
  const [links, setLinks] = React.useState<SavedLink[]>(initialLinks);
  const [availableTagValues, setAvailableTagValues] = React.useState(() =>
    initialLinks.length > 0 ? filterTabs.slice(1).map((tab) => normalizeTagValue(tab.label)) : []
  );
  const [activeTab, setActiveTab] = React.useState(filterTabs[0].label);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [sortOptionId, setSortOptionId] = React.useState<SortOptionId>("recent");
  const [selectedLinkId, setSelectedLinkId] = React.useState(initialLinks[0]?.id ?? "");
  const [favoriteLinkIds, setFavoriteLinkIds] = React.useState<Set<string>>(() => new Set());
  const [libraryStorageReady, setLibraryStorageReady] = React.useState(false);
  const [favoriteTransitionLinkId, setFavoriteTransitionLinkId] = React.useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [saveDialogTagsOpen, setSaveDialogTagsOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [shareCopyState, setShareCopyState] = React.useState<"idle" | "copied" | "failed">("idle");
  const [profile, setProfile] = React.useState<UserProfile>(initialProfile);
  const [profileNameDraft, setProfileNameDraft] = React.useState(initialProfile.name);
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [saveDialogMode, setSaveDialogMode] = React.useState<"create" | "edit">("create");
  const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);
  const [isSavingLink, setIsSavingLink] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftUrl, setDraftUrl] = React.useState("");
  const [draftTags, setDraftTags] = React.useState<string[]>([]);
  const [draftSavedReason, setDraftSavedReason] = React.useState("");
  const libraryScrollRef = React.useRef<HTMLDivElement>(null);
  const libraryCardStackRef = React.useRef<HTMLDivElement>(null);
  const libraryScrollbarTrackRef = React.useRef<HTMLDivElement>(null);
  const libraryScrollbarDragRef = React.useRef<{ thumbOffset: number } | null>(null);
  const detailTagsRowRef = React.useRef<HTMLDivElement>(null);
  const [detailAddTagCompact, setDetailAddTagCompact] = React.useState(false);
  const [libraryScrollState, setLibraryScrollState] = React.useState({
    thumbHeight: 0,
    thumbTop: 0,
    visible: false,
  });

  React.useEffect(() => {
    const persistedState = readPersistedLibraryState(libraryStorageKey);
    const persistedLinks = persistedState?.links;
    const persistedFavoriteLinkIds = persistedState?.favoriteLinkIds;
    const persistedAvailableTagValues = persistedState?.availableTagValues;

    queueMicrotask(() => {
      if (persistedLinks) {
        setLinks(persistedLinks);

        if (persistedLinks[0]) {
          setSelectedLinkId(persistedLinks[0].id);
        }
      }

      if (persistedFavoriteLinkIds) {
        setFavoriteLinkIds(new Set(persistedFavoriteLinkIds));
      }

      if (persistedAvailableTagValues) {
        setAvailableTagValues((currentValues) =>
          Array.from(new Set([...currentValues, ...persistedAvailableTagValues.map(normalizeTagValue).filter(Boolean)]))
        );
      }

      setLibraryStorageReady(true);
    });
  }, [libraryStorageKey]);


  React.useEffect(() => {
    if (!libraryStorageReady) {
      return;
    }

    const stateToPersist: PersistedLibraryState = {
      availableTagValues,
      favoriteLinkIds: Array.from(favoriteLinkIds),
      links,
    };

    try {
      window.localStorage.setItem(libraryStorageKey, JSON.stringify(stateToPersist));
    } catch {
      // Saving should never break the in-memory library flow.
    }
  }, [availableTagValues, favoriteLinkIds, libraryStorageKey, libraryStorageReady, links]);

  React.useEffect(() => {
    const persistedProfile = readPersistedProfileState(profileStorageKey);

    queueMicrotask(() => {
      if (persistedProfile) {
        setProfile(persistedProfile);
        setProfileNameDraft(persistedProfile.name);
      }
    });
  }, [profileStorageKey]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    } catch {
      // Profile settings should never break the app shell.
    }
  }, [profile, profileStorageKey]);


  const tagOptions = React.useMemo(
    () => toTagOptions([...availableTagValues, ...links.flatMap((link) => link.tags)]),
    [availableTagValues, links]
  );
  const tagLinkCounts = React.useMemo(() => {
    const counts = new Map<string, number>();

    links.forEach((link) => {
      link.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });

    return counts;
  }, [links]);
  const filterTabItems = React.useMemo(
    () => [
      { label: "All links", count: undefined },
      ...tagOptions.map((option) => ({ label: option.value, count: tagLinkCounts.get(option.value) ?? 0 })),
    ],
    [tagOptions, tagLinkCounts]
  );
  const visibleFilterLabels = React.useMemo(() => {
    const allLabels = filterTabItems.map((tab) => tab.label);

    if (estimateFilterTabRowWidth(allLabels, filterTabItems, false) <= FILTER_TAB_ROW_WIDTH) {
      return allLabels;
    }

    const primaryLabels = ["auth", "design", "docs"];
    const visibleLabels = ["All links"];
    const activeVisibleLabel = activeTab !== "All links" && allLabels.includes(activeTab) ? activeTab : undefined;

    if (activeVisibleLabel) {
      visibleLabels.push(activeVisibleLabel);
    }

    const candidateLabels = [
      ...primaryLabels,
      ...allLabels.filter((label) => label !== "All links" && label !== activeTab && !primaryLabels.includes(label)),
    ].filter((label): label is string => typeof label === "string" && allLabels.includes(label));

    candidateLabels.forEach((label) => {
      if (visibleLabels.includes(label)) {
        return;
      }

      const nextLabels = [...visibleLabels, label];

      if (estimateFilterTabRowWidth(nextLabels, filterTabItems, true) <= FILTER_TAB_ROW_WIDTH) {
        visibleLabels.push(label);
      }
    });

    return visibleLabels;
  }, [activeTab, filterTabItems]);

  const visibleFilterTabs = React.useMemo(
    () =>
      visibleFilterLabels
        .map((label) => filterTabItems.find((tab) => tab.label === label))
        .filter((tab): tab is (typeof filterTabItems)[number] => Boolean(tab)),
    [filterTabItems, visibleFilterLabels]
  );
  const overflowFilterTabs = React.useMemo(
    () => filterTabItems.filter((tab) => !visibleFilterLabels.includes(tab.label)),
    [filterTabItems, visibleFilterLabels]
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredLinks = React.useMemo(() => {
    const tabFilteredLinks = activeTab === "All links" ? links : links.filter((link) => link.tags.includes(activeTab));

    if (!normalizedSearchQuery) {
      return tabFilteredLinks;
    }

    return tabFilteredLinks.filter((link) => {
      const searchableText = [
        link.title,
        link.domain,
        link.source,
        link.description,
        link.previewTitle,
        link.previewDescription,
        link.type,
        link.collection ?? "",
        ...link.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    });
  }, [activeTab, links, normalizedSearchQuery]);
  const sortedLinks = React.useMemo(() => sortLinks(filteredLinks, sortOptionId), [filteredLinks, sortOptionId]);
  const orderedLinks = React.useMemo(
    () => orderLinksByFavorite(sortedLinks, favoriteLinkIds),
    [sortedLinks, favoriteLinkIds]
  );
  const hasLibraryCards = libraryStorageReady && orderedLinks.length > 0;
  const activeSortOption = sortOptions.find((option) => option.id === sortOptionId) ?? sortOptions[0];
  const selectedLink = React.useMemo(
    () => orderedLinks.find((link) => link.id === selectedLinkId) ?? orderedLinks[0] ?? links[0] ?? savedLinks[0],
    [links, orderedLinks, selectedLinkId]
  );
  const emptyLibraryTitle = normalizedSearchQuery
    ? "No saved links match this"
    : activeTab === "All links"
      ? "Your library is ready"
      : `No links tagged "${activeTab}"`;
  const emptyLibraryDescription = normalizedSearchQuery
    ? "Try another word, or paste a link above and press Enter to save it."
    : activeTab === "All links"
      ? "Save a link with a note so it stays useful later."
      : "Save a link with this tag or choose another filter.";
  const isSelectedLinkFavorite = favoriteLinkIds.has(selectedLink.id);
  const detailVisibleTagCount = Math.min(2, selectedLink.tags.length);
  const hiddenDetailTags = selectedLink.tags.slice(detailVisibleTagCount);
  const encodedShareUrl = encodeURIComponent(selectedLink.href);
  const encodedShareTitle = encodeURIComponent(selectedLink.title);
  const shareTargets = [
    { label: "X", logo: "x" as const, href: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareTitle}` },
    { label: "Facebook", logo: "facebook" as const, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}` },
    { label: "LinkedIn", logo: "linkedin" as const, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}` },
  ];

  React.useEffect(() => {
    const rowElement = detailTagsRowRef.current;

    if (!rowElement) {
      return;
    }

    const updateAddTagLabel = () => {
      const measureElement = rowElement.querySelector<HTMLElement>("[data-detail-add-tag-measure='true']");
      const visibleTagElements = Array.from(
        rowElement.querySelectorAll<HTMLElement>("[data-detail-tag-item='true']")
      );
      const hiddenTagElement = rowElement.querySelector<HTMLElement>("[data-detail-hidden-tags='true']");

      if (!measureElement) {
        return;
      }

      const rowStyle = window.getComputedStyle(rowElement);
      const gap = Number.parseFloat(rowStyle.columnGap || rowStyle.gap) || 0;
      const visibleTagsWidth = visibleTagElements.reduce((sum, element) => sum + element.offsetWidth, 0);
      const hiddenTagsWidth = hiddenTagElement?.offsetWidth ?? 0;
      const itemCount = visibleTagElements.length + (hiddenTagElement ? 1 : 0) + 1;
      const fullAddTagWidth =
        visibleTagsWidth + hiddenTagsWidth + measureElement.offsetWidth + gap * Math.max(itemCount - 1, 0);

      setDetailAddTagCompact(fullAddTagWidth > rowElement.clientWidth);
    };

    updateAddTagLabel();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateAddTagLabel);
      return () => window.removeEventListener("resize", updateAddTagLabel);
    }

    const resizeObserver = new ResizeObserver(updateAddTagLabel);
    resizeObserver.observe(rowElement);

    return () => resizeObserver.disconnect();
  }, [hiddenDetailTags.length, selectedLink.id, selectedLink.tags]);
  const updateLibraryScrollbar = React.useCallback(() => {
    const element = libraryScrollRef.current;

    if (!element) {
      return;
    }

    if (!hasLibraryCards) {
      setLibraryScrollState((current) =>
        current.visible ? { thumbHeight: 0, thumbTop: 0, visible: false } : current
      );
      return;
    }

    const { clientHeight, scrollHeight, scrollTop } = element;
    const visible = scrollHeight > clientHeight + 1;

    if (!visible) {
      setLibraryScrollState((current) =>
        current.visible ? { thumbHeight: 0, thumbTop: 0, visible: false } : current
      );
      return;
    }

    const trackInset = 8;
    const trackHeight = Math.max(0, clientHeight - trackInset * 2);
    const thumbHeight = Math.max(40, Math.round((clientHeight / scrollHeight) * trackHeight));
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
    const thumbTop = Math.round((scrollTop / maxScrollTop) * maxThumbTop);

    setLibraryScrollState((current) => {
      if (current.visible === visible && current.thumbHeight === thumbHeight && current.thumbTop === thumbTop) {
        return current;
      }

      return { thumbHeight, thumbTop, visible };
    });
  }, [hasLibraryCards]);

  const scrollLibraryToThumbPosition = React.useCallback(
    (clientY: number, thumbOffset: number) => {
      const scrollElement = libraryScrollRef.current;
      const trackElement = libraryScrollbarTrackRef.current;

      if (!scrollElement || !trackElement) {
        return;
      }

      const trackRect = trackElement.getBoundingClientRect();
      const maxThumbTop = Math.max(0, trackRect.height - libraryScrollState.thumbHeight);
      const nextThumbTop = Math.min(Math.max(clientY - trackRect.top - thumbOffset, 0), maxThumbTop);
      const maxScrollTop = Math.max(1, scrollElement.scrollHeight - scrollElement.clientHeight);

      scrollElement.scrollTop = maxThumbTop === 0 ? 0 : (nextThumbTop / maxThumbTop) * maxScrollTop;
      updateLibraryScrollbar();
    },
    [libraryScrollState.thumbHeight, updateLibraryScrollbar]
  );

  const handleLibraryScrollbarPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!libraryScrollState.visible) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

      const trackRect = event.currentTarget.getBoundingClientRect();
      const pointerThumbOffset = event.clientY - trackRect.top - libraryScrollState.thumbTop;
      const isInsideThumb = pointerThumbOffset >= 0 && pointerThumbOffset <= libraryScrollState.thumbHeight;
      const thumbOffset = isInsideThumb ? pointerThumbOffset : libraryScrollState.thumbHeight / 2;

      libraryScrollbarDragRef.current = { thumbOffset };
      scrollLibraryToThumbPosition(event.clientY, thumbOffset);
    },
    [libraryScrollState.thumbHeight, libraryScrollState.thumbTop, libraryScrollState.visible, scrollLibraryToThumbPosition]
  );

  const handleLibraryScrollbarPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = libraryScrollbarDragRef.current;

      if (!drag) {
        return;
      }

      event.preventDefault();
      scrollLibraryToThumbPosition(event.clientY, drag.thumbOffset);
    },
    [scrollLibraryToThumbPosition]
  );

  const stopLibraryScrollbarDrag = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    libraryScrollbarDragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  React.useLayoutEffect(() => {
    let frameId = window.requestAnimationFrame(updateLibraryScrollbar);
    const scheduleLibraryScrollbarUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateLibraryScrollbar);
    };

    const element = libraryScrollRef.current;
    const contentElement = libraryCardStackRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", scheduleLibraryScrollbarUpdate);
      return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", scheduleLibraryScrollbarUpdate);
      };
    }

    const resizeObserver = new ResizeObserver(scheduleLibraryScrollbarUpdate);
    resizeObserver.observe(element);

    if (contentElement) {
      resizeObserver.observe(contentElement);
    }

    window.addEventListener("resize", scheduleLibraryScrollbarUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleLibraryScrollbarUpdate);
    };
  }, [hasLibraryCards, orderedLinks.length, updateLibraryScrollbar]);


  const handleProfileNameSave = () => {
    const nextName = profileNameDraft.trim();

    if (!nextName) {
      setProfileNameDraft(profile.name);
      return;
    }

    setProfile((currentProfile) => ({ ...currentProfile, name: nextName }));
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file.");
      return;
    }

    if (file.size > MAX_AVATAR_FILE_BYTES) {
      setAvatarError("Avatar image must be under 1.5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setProfile((currentProfile) => ({ ...currentProfile, avatarDataUrl: reader.result as string }));
        setAvatarError(null);
      }
    });
    reader.addEventListener("error", () => setAvatarError("Could not read this image."));
    reader.readAsDataURL(file);
  };

  const handleProfileDialogOpenChange = (nextOpen: boolean) => {
    setProfileDialogOpen(nextOpen);

    if (!nextOpen) {
      setProfileNameDraft(profile.name);
      setAvatarError(null);
    }
  };

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleProfileNameSave();
    setProfileDialogOpen(false);
  };

  const handleAccountSignOut = () => {
    setProfileDialogOpen(false);
    onSignOut();
  };

  
  const resetSaveDialog = () => {
    setDraftTitle("");
    setDraftUrl("");
    setDraftTags([]);
    setDraftSavedReason("");
  };

  const handleSaveDialogOpenChange = (nextOpen: boolean) => {
    setSaveDialogOpen(nextOpen);

    if (!nextOpen) {
      setSaveDialogTagsOpen(false);
    }
  };

  const openCreateDialog = (initialValues?: { title?: string; url?: string }) => {
    setSaveDialogMode("create");
    setEditingLinkId(null);
    setIsSavingLink(false);
    setSaveDialogTagsOpen(false);
    resetSaveDialog();
    setDraftTitle(initialValues?.title ?? "");
    setDraftUrl(initialValues?.url ?? "");
    setSaveDialogOpen(true);
  };
  const openEditDialog = (link: SavedLink, options?: { openTags?: boolean }) => {
    setSaveDialogMode("edit");
    setEditingLinkId(link.id);
    setIsSavingLink(false);
    setDraftTitle(link.title);
    setDraftUrl(link.href);
    setDraftTags(link.tags);
    setDraftSavedReason((link.savedReason ?? "").slice(0, SAVED_REASON_INPUT_MAX_LENGTH));
    setSaveDialogTagsOpen(Boolean(options?.openTags));
    setSaveDialogOpen(true);
  };
  const handleTopSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !isLikelyUrl(searchQuery)) {
      return;
    }

    event.preventDefault();

    const linkParts = getLinkParts(searchQuery);

    openCreateDialog({
      title: getPlatformNameFromUrl(searchQuery),
      url: linkParts.href,
    });
    setSearchQuery("");
  };
  const createTagOption = (label: string) => {
    const nextValue = normalizeTagValue(label);

    if (!nextValue) {
      return;
    }

    setAvailableTagValues((currentValues) =>
      currentValues.includes(nextValue) ? currentValues : [...currentValues, nextValue]
    );
  };

  const handleSaveLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = draftTitle.trim();
    const rawUrl = draftUrl.trim();

    if (!title || !rawUrl || isSavingLink) {
      return;
    }

    setIsSavingLink(true);

    const linkParts = getLinkParts(rawUrl);
    const normalizedTags = Array.from(new Set(draftTags.map(normalizeTagValue).filter(Boolean)));
    const savedReason = draftSavedReason.trim().slice(0, SAVED_REASON_INPUT_MAX_LENGTH);
    const metadata = await fetchLinkPreviewMetadata(linkParts.href);
    const metadataDescription = metadata?.description?.trim();
    const metadataTitle = metadata?.title?.trim();
    const metadataSiteName = metadata?.siteName?.trim();
    const metadataIcon = metadata?.icon?.trim();
    const metadataLogo = metadata?.logo?.trim();
    const metadataImage = metadata?.image?.trim();
    const resolvedHref = metadata?.url ?? linkParts.href;

    setAvailableTagValues((currentValues) => Array.from(new Set([...currentValues, ...normalizedTags])));

    if (saveDialogMode === "edit") {
      const editedLink = links.find((link) => link.id === editingLinkId);

      if (!editedLink) {
        setIsSavingLink(false);
        return;
      }

      const hrefChanged = editedLink.href !== resolvedHref;
      const updatedLink: SavedLink = {
        ...editedLink,
        title,
        domain: linkParts.domain,
        source: metadata?.domain ?? linkParts.source,
        description: metadataDescription ?? (hrefChanged ? "Saved manually. Preview metadata was not available from this URL." : editedLink.description),
        previewTitle: metadataTitle ?? metadataSiteName ?? title,
        previewDescription:
          metadataDescription ?? (hrefChanged ? "No preview description was provided by the saved URL." : editedLink.previewDescription),
        href: resolvedHref,
        faviconSrc: metadataIcon ?? (hrefChanged ? undefined : editedLink.faviconSrc),
        previewLogoSrc: metadataLogo ?? metadataIcon ?? (hrefChanged ? undefined : editedLink.previewLogoSrc),
        metadataImageSrc: metadataImage ?? (hrefChanged ? undefined : editedLink.metadataImageSrc),
        type: metadata?.type === "article" ? "Article" : hrefChanged ? "Link" : editedLink.type,
        tags: normalizedTags,
        savedReason: savedReason || undefined,
      };

      setLinks((currentLinks) => currentLinks.map((link) => (link.id === updatedLink.id ? updatedLink : link)));
      setSelectedLinkId(updatedLink.id);
      setSaveDialogOpen(false);
      setSaveDialogTagsOpen(false);
      return;
    }

    const nextLink: SavedLink = {
      id: `saved-${Date.now()}`,
      title,
      domain: linkParts.domain,
      source: metadata?.domain ?? linkParts.source,
      description: metadataDescription ?? "Saved manually. Preview metadata was not available from this URL.",
      savedReason: savedReason || undefined,
      previewTitle: metadataTitle ?? metadataSiteName ?? title,
      previewDescription: metadataDescription ?? "No preview description was provided by the saved URL.",
      href: resolvedHref,
      faviconSrc: metadataIcon,
      previewLogoSrc: metadataLogo ?? metadataIcon,
      metadataImageSrc: metadataImage,
      type: metadata?.type === "article" ? "Article" : "Link",
      collection: null,
      tags: normalizedTags,
      addedDate: "Just now",
      logoColor: linkLogoColors[links.length % linkLogoColors.length],
    };

    setLinks((currentLinks) => [nextLink, ...currentLinks]);
    setActiveTab("All links");
    setSearchQuery("");
    setSelectedLinkId(nextLink.id);
    setSaveDialogOpen(false);
    setSaveDialogTagsOpen(false);
  };
  const selectTab = (tab: string) => {
    const nextLinks = orderLinksByFavorite(
      sortLinks(tab === "All links" ? links : links.filter((link) => link.tags.includes(tab)), sortOptionId),
      favoriteLinkIds
    );

    setActiveTab(tab);
    setSelectedLinkId(nextLinks[0]?.id ?? links[0]?.id ?? savedLinks[0].id);
  };
  const openSelectedLink = () => {
    window.open(selectedLink.href, "_blank", "noopener,noreferrer");
  };

  const openShareDialog = () => {
    setShareCopyState("idle");
    setShareDialogOpen(true);
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(selectedLink.href);
      setShareCopyState("copied");
    } catch {
      setShareCopyState("failed");
    }
  };

  const handleDeleteSelectedLink = () => {
    const deletedLinkId = selectedLink.id;
    const nextFavoriteLinkIds = new Set(favoriteLinkIds);
    const remainingLinks = links.filter((link) => link.id !== deletedLinkId);

    nextFavoriteLinkIds.delete(deletedLinkId);

    const linksForCurrentTab = activeTab === "All links" ? remainingLinks : remainingLinks.filter((link) => link.tags.includes(activeTab));
    const shouldResetTab = activeTab !== "All links" && linksForCurrentTab.length === 0;
    const nextActiveTab = shouldResetTab ? "All links" : activeTab;
    const nextVisibleLinks = shouldResetTab ? remainingLinks : linksForCurrentTab;
    const nextSelectedLink = orderLinksByFavorite(sortLinks(nextVisibleLinks, sortOptionId), nextFavoriteLinkIds)[0] ?? remainingLinks[0];

    setFavoriteLinkIds(nextFavoriteLinkIds);
    setLinks(remainingLinks);
    setActiveTab(nextActiveTab);
    setSelectedLinkId(nextSelectedLink?.id ?? savedLinks[0].id);
    setDeleteDialogOpen(false);
  };
  const toggleFavorite = (linkId: string) => {
    const updateFavorite = () => {
      setFavoriteLinkIds((current) => {
        const next = new Set(current);

        if (next.has(linkId)) {
          next.delete(linkId);
        } else {
          next.add(linkId);
        }

        return next;
      });
    };
    const viewTransitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<void> };
    };
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!viewTransitionDocument.startViewTransition || prefersReducedMotion) {
      updateFavorite();
      return;
    }

    flushSync(() => setFavoriteTransitionLinkId(linkId));

    const transition = viewTransitionDocument.startViewTransition(() => {
      flushSync(updateFavorite);
    });

    transition.finished.finally(() => {
      setFavoriteTransitionLinkId((currentLinkId) => (currentLinkId === linkId ? null : currentLinkId));
    });
  };

  return (
    <main className="relative h-dvh w-dvw overflow-hidden p-[var(--space-24)] text-[var(--content-primary)]">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 1024"
      >
        <defs>
          <linearGradient
            id="app-bg-gradient"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop offset="0" stopColor="var(--canvas-start)" />
            <stop offset="1" stopColor="var(--canvas-end)" />
          </linearGradient>
        </defs>
        <rect width="1440" height="1024" fill="url(#app-bg-gradient)" />
      </svg>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full opacity-[var(--paper-noise-opacity)] mix-blend-multiply">
        <filter id="paper-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="12" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.46 0 0 0 0 0.43 0 0 0 0 0.38 0 0 0 0.54 0"
          />
        </filter>
        <filter id="paper-fibers">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.52" numOctaves="2" seed="31" result="fibers" />
          <feColorMatrix
            in="fibers"
            type="matrix"
            values="0 0 0 0 0.55 0 0 0 0 0.51 0 0 0 0 0.44 0 0 0 0.36 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
        <rect width="100%" height="100%" filter="url(#paper-fibers)" opacity="0.55" />
      </svg>

      <div className="relative mx-auto flex h-full w-[var(--app-width)] min-w-[var(--app-min-width)] max-w-[var(--app-max-width)] flex-col">
        <header className="grid h-[var(--size-48)] w-full grid-cols-[var(--layout-left-width)_var(--layout-detail-width)] items-center gap-[var(--space-24)]">
          <div className="flex h-[var(--size-48)] w-[var(--layout-left-width)] shrink-0 items-center gap-[var(--space-16)]">
            <div className="flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-12)]">
              <BrandLogo size={32} />
            </div>
            <TextField
              ref={searchInputRef}
              endAdornment={
                searchQuery ? (
                  <IconButton
                    aria-label="Clear search"
                    className="text-[var(--icon-muted)] hover:text-[var(--content-primary)]"
                    icon={Icons.cancel}
                    iconSize={16}
                    label="Clear search"
                    mode="plain"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    tooltip={false}
                    type="button"
                  />
                ) : null
              }
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleTopSearchKeyDown}
              placeholder="Search your library or paste a link to save..."
              value={searchQuery}
            />
          </div>
          <div className="flex h-[var(--size-48)] w-[var(--layout-detail-width)] min-w-[var(--layout-detail-min-width)] max-w-[var(--layout-detail-max-width)] items-center justify-end">
            <Button
              tone="primary"
              className="h-[var(--size-48)] w-[var(--save-button-width)] min-w-[var(--save-button-width)] max-w-[var(--save-button-width)] shrink-0"
              onClick={() => openCreateDialog()}
              type="button"
            >
              <Icon icon={Icons.add} size={20} strokeWidth={2} aria-hidden="true" />
              Save link
            </Button>
          </div>
        </header>

        <Dialog open={saveDialogOpen} onOpenChange={handleSaveDialogOpenChange}>
          <DialogContent
            className="flex w-[var(--save-link-dialog-width)] !max-w-[calc(100dvw-var(--space-48))] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border-0 !bg-[var(--dialog-surface)] p-[var(--space-32)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] ring-0 backdrop-blur-[var(--blur-panel)] sm:!max-w-[var(--save-link-dialog-width)]"
          >
            <div className="flex flex-col gap-[var(--space-8)]">
              <DialogTitle className="type-title text-[var(--content-primary)]">
                {saveDialogMode === "edit" ? "Edit link" : "Save link"}
              </DialogTitle>
              <DialogDescription className="type-16 text-[var(--content-muted)]">
                {saveDialogMode === "edit"
                  ? "Update the link, tags, and why it still matters for later."
                  : "Save this link with context, so it is easy to understand later."}
              </DialogDescription>
            </div>

            <form className="flex flex-col gap-[var(--space-16)]" onSubmit={handleSaveLink}>
              <label className="flex flex-col gap-[var(--space-8)]">
                <span className="type-label text-[var(--content-muted)]">Title</span>
                <TextField
                  className="w-full"
                  icon={Icons.edit}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  placeholder="Name this saved link"
                  value={draftTitle}
                />
              </label>

              <label className="flex flex-col gap-[var(--space-8)]">
                <span className="type-label text-[var(--content-muted)]">Link</span>
                <TextField
                  className="w-full"
                  icon={Icons.link}
                  inputMode="url"
                  onChange={(event) => setDraftUrl(event.target.value)}
                  placeholder="https://example.com/resource"
                  value={draftUrl}
                />
              </label>

              <div className="flex flex-col gap-[var(--space-8)]">
                <span className="flex items-center justify-between gap-[var(--space-16)]">
                  <span className="type-label text-[var(--content-muted)]">{SAVED_REASON_FIELD_LABEL}</span>
                  <span aria-live="polite" className="shrink-0 type-12-semibold text-[var(--content-muted)]">
                    {draftSavedReason.length}/{SAVED_REASON_INPUT_MAX_LENGTH}
                  </span>
                </span>
                <LargeTextField
                  aria-label={SAVED_REASON_FIELD_LABEL}
                  maxLength={SAVED_REASON_INPUT_MAX_LENGTH}
                  onChange={(event) => setDraftSavedReason(event.currentTarget.value.slice(0, SAVED_REASON_INPUT_MAX_LENGTH))}
                  placeholder={SAVED_REASON_PLACEHOLDER}
                  value={draftSavedReason}
                />
              </div>

              <div className="flex flex-col gap-[var(--space-8)]">
                <span className="type-label text-[var(--content-muted)]">Tags</span>
                <MultiSelect
                  onCreateOption={createTagOption}
                  onOpenChange={setSaveDialogTagsOpen}
                  onValueChange={setDraftTags}
                  open={saveDialogTagsOpen}
                  options={tagOptions}
                  placeholder="Search or add tags"
                  value={draftTags}
                  maxOptionLength={TAG_MAX_LENGTH}
                />
              </div>

              <div className="flex items-center gap-[var(--space-8)] pt-[var(--space-8)]">
                <Button className="h-[var(--size-48)] flex-1" disabled={isSavingLink} onClick={() => handleSaveDialogOpenChange(false)} tone="secondary" type="button">
                  Cancel
                </Button>
                <Button className="h-[var(--size-48)] flex-1" disabled={isSavingLink || !draftTitle.trim() || !draftUrl.trim()} tone="primary" type="submit">
                  <Icon icon={saveDialogMode === "edit" ? Icons.edit : Icons.add} size={20} strokeWidth={2} aria-hidden="true" />
                  {isSavingLink ? (saveDialogMode === "edit" ? "Updating..." : "Saving...") : saveDialogMode === "edit" ? "Update link" : "Save link"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent
            className="flex w-[var(--confirm-dialog-width)] !max-w-[calc(100dvw-var(--space-48))] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border-0 !bg-[var(--dialog-surface)] p-[var(--space-32)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] ring-0 backdrop-blur-[var(--blur-panel)]"
          >
            <div className="flex flex-col gap-[var(--space-8)]">
              <DialogTitle className="type-title text-[var(--content-primary)]">Remove this link?</DialogTitle>
              <DialogDescription className="type-16 text-[var(--content-muted)]">
                This removes the link and saved note from your library. You can save it again, but this copy will be gone.
              </DialogDescription>
            </div>

            <div className="flex h-[var(--size-48)] items-center gap-[var(--space-8)]">
              <Button className="h-[var(--size-48)] flex-1" onClick={() => setDeleteDialogOpen(false)} tone="secondary" type="button">
                Keep link
              </Button>
              <Button className="h-[var(--size-48)] flex-1" onClick={handleDeleteSelectedLink} tone="secondaryDanger" type="button">
                Remove link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent
            initialFocus={false}
            className="flex w-[var(--confirm-dialog-width)] !max-w-[calc(100dvw-var(--space-48))] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border-0 !bg-[var(--dialog-surface)] p-[var(--space-32)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] ring-0 backdrop-blur-[var(--blur-panel)]"
          >
            <div className="flex flex-col gap-[var(--space-8)]">
              <DialogTitle className="type-title text-[var(--content-primary)]">Share this link</DialogTitle>
              <DialogDescription className="type-16 text-[var(--content-muted)]">
                Copy the URL or share this saved link.
              </DialogDescription>
            </div>

            <TextField
              aria-label="Link URL"
              className="w-full !pr-[var(--space-8)]"
              icon={Icons.link}
              inputClassName="truncate"
              readOnly
              value={selectedLink.href}
              endAdornment={
                <Button className={cn("relative h-[var(--size-32)] overflow-visible px-[var(--space-16)] type-12-semibold", shareCopyState === "copied" && "copy-success-button")} onClick={handleCopyShareLink} tone="secondary" type="button">
                  <Icon icon={shareCopyState === "copied" ? Icons.check : Icons.copy} size={16} strokeWidth={2} aria-hidden="true" />
                  <span aria-live="polite">{shareCopyState === "copied" ? "Copied" : shareCopyState === "failed" ? "Try again" : "Copy"}</span>
                </Button>
              }
            />
            <div className="flex items-center gap-[var(--space-16)]">
              <span aria-hidden="true" className="h-px flex-1 bg-[var(--divider-subtle)]" />
              <div className="flex shrink-0 items-center justify-center gap-[var(--space-8)]">
                {shareTargets.map((target) => (
                  <a
                    key={target.label}
                    aria-label={`Share on ${target.label}`}
                    className="inline-flex size-[var(--size-48)] shrink-0 items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] text-[var(--content-primary)] transition-[background-color,color,opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--card-control-hover)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                    href={target.href}
                    rel={target.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    target={target.href.startsWith("mailto:") ? undefined : "_blank"}
                    title={target.label}
                  >
                    <SocialLogo name={target.logo} />
                  </a>
                ))}
              </div>
              <span aria-hidden="true" className="h-px flex-1 bg-[var(--divider-subtle)]" />
            </div>

          </DialogContent>
        </Dialog>
        <Dialog open={profileDialogOpen} onOpenChange={handleProfileDialogOpenChange}>
          <DialogContent
            className="flex w-[var(--profile-dialog-width)] !max-w-[calc(100dvw-var(--space-48))] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border-0 !bg-[var(--dialog-surface)] p-[var(--space-32)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] ring-0 backdrop-blur-[var(--blur-panel)]"
          >
            <div className="flex flex-col gap-[var(--space-8)] pr-[var(--space-32)]">
              <DialogTitle className="type-title text-[var(--content-primary)]">Profile</DialogTitle>
              <DialogDescription className="type-16 text-[var(--content-muted)]">
                Manage your account details.
              </DialogDescription>
            </div>

            <form className="flex flex-col gap-[var(--space-20)]" onSubmit={handleProfileSubmit}>
              <input ref={avatarInputRef} accept="image/*" className="sr-only" onChange={handleAvatarFileChange} type="file" />

              <div className="flex items-center gap-[var(--space-16)]">
                <button
                  aria-label="Change avatar"
                  className="group relative flex size-[var(--profile-avatar-size)] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-round)] bg-[var(--avatar-overlay)] type-title text-[var(--white)] outline-none transition-[filter,transform,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-strong)]"
                  onClick={() => avatarInputRef.current?.click()}
                  type="button"
                >
                  {profile.avatarDataUrl ? (
                    <Image src={profile.avatarDataUrl} alt="" width={80} height={80} className="size-full object-cover" unoptimized />
                  ) : (
                    getProfileInitials(profile)
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex h-[var(--profile-avatar-overlay-height)] items-center justify-center gap-[var(--space-4)] bg-[var(--profile-avatar-overlay)] type-12-semibold text-[var(--white)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Icon icon={Icons.camera} size={14} strokeWidth={2} aria-hidden="true" />
                    Change
                  </span>
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-8)]">
                  <span className="type-16-semibold text-[var(--content-primary)]">Avatar</span>
                  <span className="type-12 text-[var(--content-muted)]">Click the avatar to upload a new image.</span>
                  {profile.avatarDataUrl ? (
                    <button className="w-fit type-12-semibold text-[var(--danger-muted)] transition-colors hover:text-[var(--danger)]" onClick={() => setProfile((currentProfile) => ({ ...currentProfile, avatarDataUrl: undefined }))} type="button">
                      Remove photo
                    </button>
                  ) : null}
                </div>
              </div>

              {avatarError ? <p className="type-12 text-[var(--danger)]">{avatarError}</p> : null}

              <label className="flex flex-col gap-[var(--space-8)]">
                <span className="type-label text-[var(--content-muted)]">Name</span>
                <TextField
                  className="w-full"
                  icon={Icons.user}
                  onChange={(event) => setProfileNameDraft(event.target.value)}
                  placeholder="Your name"
                  value={profileNameDraft}
                />
              </label>

              <div className="flex flex-col gap-[var(--space-8)]">
                <span className="type-label text-[var(--content-muted)]">Email</span>
                <div className="flex h-[var(--size-48)] min-w-0 items-center gap-[var(--space-8)] rounded-[var(--radius-round)] bg-[var(--control-surface)] px-[var(--space-16)] type-16 text-[var(--content-primary)]">
                  <Icon icon={Icons.mail} size={20} strokeWidth={2} aria-hidden="true" />
                  <span className="min-w-0 truncate">{profile.email}</span>
                </div>
              </div>

              <Button className="h-[var(--size-48)] w-full" disabled={!profileNameDraft.trim()} tone="primary" type="submit">
                Save
              </Button>
            </form>

            <div aria-hidden="true" className="h-px w-full bg-[var(--divider-subtle)]" />
            <Button className="h-[var(--size-48)] w-full" onClick={handleAccountSignOut} tone="secondaryDanger" type="button">
              <Icon icon={Icons.logout} size={20} strokeWidth={2} aria-hidden="true" />
              Sign out
            </Button>
          </DialogContent>
        </Dialog>

        
        <div className="mt-[var(--space-24)] grid min-h-0 flex-1 w-full overflow-visible grid-cols-[var(--layout-left-width)_var(--layout-detail-width)] gap-[var(--space-24)]">
          <div className="flex h-full min-h-0 w-[var(--layout-left-width)] shrink-0 gap-[var(--space-16)]">
            <aside aria-label="Keepnoto navigation" className="flex h-full w-[var(--layout-sidebar-width)] shrink-0 flex-col items-center justify-between">
              <nav className="flex w-[var(--layout-sidebar-width)] flex-col items-center gap-[var(--space-8)]">
                {navItems.map((item) => (
                  <IconButton key={item.label} icon={item.icon} label={item.label} active={item.active} iconSize={24} tooltipSide="auto" />
                ))}
              </nav>
              <div className="flex w-[var(--layout-sidebar-width)] flex-col items-center gap-[var(--space-8)]">
                <button
                  aria-expanded={profileDialogOpen}
                  aria-haspopup="dialog"
                  aria-label="Open profile settings"
                  className="flex size-[var(--size-48)] items-center justify-center overflow-hidden rounded-[var(--radius-round)] bg-[var(--avatar-overlay)] type-16-semibold text-[var(--white)] outline-none transition-[box-shadow,filter,opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-105 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-strong)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--focus-ring-strong)]"
                  data-state={profileDialogOpen ? "open" : undefined}
                  onClick={() => setProfileDialogOpen(true)}
                  type="button"
                >
                  {profile.avatarDataUrl ? (
                    <Image src={profile.avatarDataUrl} alt="" width={48} height={48} className="size-full object-cover" unoptimized />
                  ) : (
                    getProfileInitials(profile)
                  )}
                </button>
              </div>
            </aside>

            <section ref={setLibraryBoundary} className="flex h-full min-h-0 w-[var(--search-width)] shrink-0 flex-col rounded-[var(--radius-32)] bg-[var(--panel-surface)] px-[var(--space-24)] pb-[var(--space-12)] pt-[var(--space-32)] backdrop-blur-[var(--blur-soft)]">
              <div className="flex min-h-[var(--size-32)] w-full items-center justify-between gap-[var(--space-16)]">
                <div className="flex items-baseline gap-[var(--space-8)]">
                  <h1 className="type-title text-[var(--content-primary)]">Library</h1>
                  {libraryStorageReady ? (
                  <span className="type-16 text-[var(--content-muted)]">{orderedLinks.length} links</span>
                ) : (
                  <span aria-hidden="true" className="h-[var(--space-16)] w-[var(--space-48)] animate-pulse rounded-full bg-[var(--skeleton-muted)]" />
                )}
                </div>
                <Dropdown
                  align="end"
                  sideOffset={FLOATING_SIDE_OFFSET}
                  collisionBoundary={libraryBoundary ?? undefined}
                  trigger={
                    <button
                      className="inline-flex h-[var(--size-24)] items-center gap-[var(--space-8)] rounded-[var(--radius-8)] px-[var(--space-4)] type-16 text-[var(--content-muted)] transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-[var(--content-primary)] data-[popup-open]:text-[var(--content-primary)]"
                      type="button"
                    >
                      {activeSortOption.label}
                      <Icon icon={Icons.sort} size={20} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  }
                >
                  {sortOptions.map((option) => (
                    <DropdownItem
                      key={option.id}
                      selected={option.id === sortOptionId}
                      visualState={option.id === sortOptionId ? "active" : "default"}
                      onClick={() => setSortOptionId(option.id)}
                    >
                      {option.label}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>

              {libraryStorageReady && links.length > 0 ? (
                <div role="tablist" aria-label="Saved link filters" className="relative mt-[var(--space-20)] flex h-[var(--size-32)] items-center gap-[var(--space-8)] overflow-visible">
                {visibleFilterTabs.map((item) => (
                  <Tab
                    key={item.label}
                    count={item.label === "All links" ? undefined : item.count}
                    selected={item.label === activeTab}
                    showHash={item.label !== "All links"}
                    onClick={() => selectTab(item.label)}
                  >
                    {item.label}
                  </Tab>
                ))}
                {overflowFilterTabs.length > 0 ? (
                  <Dropdown
                    align="start"
                    sideOffset={FLOATING_SIDE_OFFSET}
                    collisionBoundary={libraryBoundary ?? undefined}
                    trigger={
                      <Tab hasMenu aria-label="Show more filters">
                        More
                      </Tab>
                    }
                  >
                    {overflowFilterTabs.map((item) => (
                      <DropdownItem key={item.label} className="[&_[data-dropdown-hash]]:!text-[var(--tab-hash)] focus:[&_[data-dropdown-hash]]:!text-[var(--tab-hash)] data-highlighted:[&_[data-dropdown-hash]]:!text-[var(--tab-hash)]" endLabel={typeof item.count === "number" ? String(item.count) : undefined} onClick={() => selectTab(item.label)}>
                        <span className="inline-flex min-w-0 items-center gap-[var(--space-8)]">
                          <span aria-hidden="true" data-dropdown-hash className="shrink-0 text-[var(--tab-hash)]">
                            #
                          </span>
                          <span className="min-w-0 truncate">{item.label}</span>
                        </span>
                      </DropdownItem>
                    ))}
                  </Dropdown>
                ) : null}
                </div>
              ) : null}

              <div className="relative mt-[var(--space-20)] min-h-0 w-full flex-1">
                <div
                  ref={libraryScrollRef}
                  className={cn(
                    "library-scroll h-full min-h-0 w-full overflow-x-hidden overscroll-contain",
                    hasLibraryCards ? "overflow-y-auto" : "overflow-y-hidden"
                  )}
                  onScroll={updateLibraryScrollbar}
                >
                  {hasLibraryCards ? (
                    <div ref={libraryCardStackRef} className="library-card-stack">
                      {orderedLinks.map((link) => (
                        <div
                          key={link.id}
                          className="library-card-motion"
                          style={{ viewTransitionName: favoriteTransitionLinkId === link.id ? "favorite-flight" : undefined } as React.CSSProperties}
                        >
                          <LinkCard
                            title={link.title}
                            source={link.domain}
                            url={link.domain}
                            description={link.savedReason ?? link.description}
                            tags={link.tags}
                            savedAt={link.addedDate}
                            faviconSrc={link.faviconSrc}
                            faviconFallback={link.domain}
                            faviconColor={link.logoColor}
                            visualState={link.id === selectedLink.id ? "active" : "default"}
                            favorite={favoriteLinkIds.has(link.id)}
                            onClick={() => setSelectedLinkId(link.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedLinkId(link.id);
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[calc(var(--size-48)*6)] flex-col items-center justify-center gap-[var(--space-24)] px-[var(--space-24)] py-[var(--space-48)] text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200">
                      <Image
                        alt=""
                        aria-hidden="true"
                        className="h-[240px] w-[240px] max-w-full object-contain"
                        height={502}
                        priority
                        src="/keepnoto/empty%20state.png"
                        width={502}
                      />
                      <div className="flex max-w-[calc(var(--size-48)*7)] flex-col items-center gap-[var(--space-8)]">
                        <p className="type-16-semibold text-[var(--content-primary)]">{emptyLibraryTitle}</p>
                        <p className="type-16 text-[var(--content-muted)]">{emptyLibraryDescription}</p>
                      </div>
                      {!normalizedSearchQuery && activeTab === "All links" ? (
                        <Button className="h-[var(--size-48)] px-[var(--space-24)]" onClick={() => openCreateDialog()} tone="primary" type="button">
                          <Icon icon={Icons.add} size={20} strokeWidth={2} aria-hidden="true" />
                          Save first link
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
                {hasLibraryCards && libraryScrollState.visible ? (
                  <div
                    ref={libraryScrollbarTrackRef}
                    aria-hidden="true"
                    className="library-scrollbar-track"
                    onPointerDown={handleLibraryScrollbarPointerDown}
                    onPointerMove={handleLibraryScrollbarPointerMove}
                    onPointerUp={stopLibraryScrollbarDrag}
                    onPointerCancel={stopLibraryScrollbarDrag}
                  >
                    <span
                      className="library-scrollbar-thumb"
                      style={{ height: libraryScrollState.thumbHeight, transform: `translateY(${libraryScrollState.thumbTop}px)` }}
                    />
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <section aria-busy={!libraryStorageReady || undefined} className="w-[var(--layout-detail-width)] min-w-[var(--layout-detail-min-width)] max-w-[var(--layout-detail-max-width)] self-start rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)] backdrop-blur-[var(--blur-soft)]">
            {libraryStorageReady && links.length === 0 ? (
              <div className="flex min-h-[calc(var(--size-48)*5)] w-full flex-col items-center justify-center gap-[var(--space-16)] px-[var(--space-32)] text-center">
                <span className="flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] text-[var(--icon-muted)]">
                  <Icon icon={Icons.link} size={20} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="flex max-w-[var(--auth-copy-width)] flex-col items-center gap-[var(--space-8)]">
                  <p className="type-16-semibold text-[var(--content-primary)]">Your saved link will appear here</p>
                  <p className="type-16 text-[var(--content-muted)]">Save your first link to see its preview, context, and details.</p>
                </div>
              </div>
            ) : null}
            <div className={cn("flex w-full flex-col gap-[var(--space-24)]", (!libraryStorageReady || links.length === 0) && "hidden")}>
              <div className="flex h-[var(--size-48)] w-full items-center justify-between gap-[var(--space-24)]">
                <h2 className="min-w-0 flex-1 truncate type-title text-[var(--content-primary)]">
                  {selectedLink.title}
                </h2>
                <div className="flex h-[var(--size-48)] shrink-0 items-center gap-[var(--space-8)]">
                  <IconButton
                    icon={Icons.bookmark}
                    label={isSelectedLinkFavorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isSelectedLinkFavorite || undefined}
                    surface="card"
                    tooltipSide="right"
                    onClick={() => toggleFavorite(selectedLink.id)}
                    className={cn(
                      "text-[var(--accent-start)] hover:!text-[var(--accent-start)] data-[state=hover]:!text-[var(--accent-start)]",
                      isSelectedLinkFavorite &&
                        "!text-[var(--favorite-accent)] hover:!text-[var(--favorite-accent)] favorite-icon-filled"
                    )}
                  />
                  <IconButton icon={Icons.share} label="Share selected link" iconSize={20} surface="card" tooltipSide="right" onClick={openShareDialog} />
                </div>
              </div>

              <LinkPreviewCard
                title={selectedLink.previewTitle}
                description={selectedLink.previewDescription}
                url={selectedLink.domain}
                previewImageSrc={selectedLink.metadataImageSrc}
                previewImageAlt={`${selectedLink.previewTitle} preview`}
                logoSrc={selectedLink.previewLogoSrc ?? selectedLink.faviconSrc}
                logoAlt={`${selectedLink.source} logo`}
                logoFallback={selectedLink.source}
                logoColor={selectedLink.logoColor}
                externalHref={selectedLink.href}
              />

              {selectedLink.savedReason ? <SavedReason maxLength={null} reason={selectedLink.savedReason} /> : null}

            </div>

            <div className={cn("mt-[var(--space-24)] w-full", (!libraryStorageReady || links.length === 0) && "hidden")}>
              <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-[var(--space-32)]">
                <div className="flex min-w-0 flex-col gap-[var(--space-24)]">
                  <div className="flex min-w-0 flex-col gap-[var(--space-8)]">
                    <p className="type-label text-[var(--content-muted)]">Tags</p>
                    <div ref={detailTagsRowRef} className="relative flex h-[var(--size-24)] min-w-0 items-center gap-[var(--space-8)] overflow-visible">
                      {selectedLink.tags.slice(0, detailVisibleTagCount).map((tag) => (
                        <Tag
                          key={tag}
                          aria-label={`Filter library by ${tag}`}
                          className="shrink-0"
                          data-detail-tag-item="true"
                          onClick={() => selectTab(tag)}
                        >
                          {tag}
                        </Tag>
                      ))}
                      {hiddenDetailTags.length > 0 ? (
                        <Tooltip
                          interactive
                          label={
                            <div className="flex flex-col items-start gap-[var(--space-8)]">
                              {hiddenDetailTags.map((tag) => (
                                <Tag key={tag} aria-label={`Filter library by ${tag}`} className="shrink-0" onClick={() => selectTab(tag)}>
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          }
                          side="top"
                        >
                          <Tag aria-label={`${hiddenDetailTags.length} more tags`} className="shrink-0" data-detail-hidden-tags="true">
                            +{hiddenDetailTags.length}
                          </Tag>
                        </Tooltip>
                      ) : null}
                      <Tag
                        add
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-0 shrink-0 opacity-0"
                        data-detail-add-tag-measure="true"
                        disabled
                        tabIndex={-1}
                      >
                        + Add tag
                      </Tag>
                      <Tag add aria-label="Add tag" className="shrink-0" onClick={() => openEditDialog(selectedLink, { openTags: true })}>
                        {detailAddTagCompact ? "+" : "+ Add tag"}
                      </Tag>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col gap-[var(--space-8)]">
                    <p className="type-label text-[var(--content-muted)]">Source</p>
                    <span className="flex h-[var(--size-24)] items-center gap-[var(--space-8)] type-16 text-[var(--content-primary)]">
                      <Icon icon={Icons.globe} size={20} strokeWidth={1.8} className="text-[var(--content-muted)]" />
                      {selectedLink.source}
                    </span>
                  </div>
                </div>
                <div aria-hidden="true" className="w-px shrink-0 self-stretch bg-[var(--divider-subtle)]" />
                <div className="flex min-w-0 flex-col gap-[var(--space-24)]">
                  <div className="flex min-w-0 flex-col gap-[var(--space-8)]">
                    <p className="type-label text-[var(--content-muted)]">Saved</p>
                    <span className="flex h-[var(--size-24)] items-center gap-[var(--space-8)] type-16 text-[var(--content-primary)]">
                      <Icon icon={Icons.calendar} size={20} strokeWidth={1.8} className="text-[var(--content-muted)]" />
                      {selectedLink.addedDate}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-[var(--space-8)]">
                    <p className="type-label text-[var(--content-muted)]">Collection</p>
                    <span className="flex h-[var(--size-24)] items-center gap-[var(--space-8)] type-16 text-[var(--content-primary)]">
                      <Icon icon={Icons.folder} size={20} strokeWidth={1.8} className="text-[var(--content-muted)]" />
                      {selectedLink.collection ?? "No collection"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-[var(--space-24)] h-px w-full bg-[var(--divider-subtle)]" />
              <div className="mt-[var(--space-24)] flex h-[var(--size-48)] w-full items-center gap-[var(--space-8)]">
                <Button tone="secondaryDanger" className="h-[var(--size-48)] flex-1" onClick={() => setDeleteDialogOpen(true)} type="button">Delete</Button>
                <Button tone="secondary" className="h-[var(--size-48)] flex-1" onClick={() => openEditDialog(selectedLink)} type="button">Edit</Button>
                <Button tone="primary" className="h-[var(--size-48)] flex-[var(--primary-action-flex)]" onClick={openSelectedLink} type="button">
                  Open link
                  <Icon icon={Icons.external} size={20} strokeWidth={1.8} />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
