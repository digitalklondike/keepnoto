"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Dropdown, DropdownItem } from "@/components/keepnoto/dropdown";
import { MultiSelect, type MultiSelectOption } from "@/components/keepnoto/multi-select";
import { Tooltip } from "@/components/keepnoto/tooltip";
import {
  FILTER_TAB_GAP,
  FILTER_TAB_MORE_WIDTH,
  FILTER_TAB_ROW_WIDTH,
  FLOATING_SIDE_OFFSET,
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


export default function Home() {
  const [libraryBoundary, setLibraryBoundary] = React.useState<HTMLElement | null>(null);
  const [links, setLinks] = React.useState<SavedLink[]>(savedLinks);
  const [availableTagValues, setAvailableTagValues] = React.useState(() =>
    filterTabs.slice(1).map((tab) => normalizeTagValue(tab.label))
  );
  const [activeTab, setActiveTab] = React.useState(filterTabs[0].label);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [sortOptionId, setSortOptionId] = React.useState<SortOptionId>("recent");
  const [selectedLinkId, setSelectedLinkId] = React.useState(savedLinks[0].id);
  const [favoriteLinkIds, setFavoriteLinkIds] = React.useState<Set<string>>(() => new Set());
  const [favoriteTransitionLinkId, setFavoriteTransitionLinkId] = React.useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [saveDialogTagsOpen, setSaveDialogTagsOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [shareCopyState, setShareCopyState] = React.useState<"idle" | "copied" | "failed">("idle");
  const [saveDialogMode, setSaveDialogMode] = React.useState<"create" | "edit">("create");
  const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);
  const [isSavingLink, setIsSavingLink] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftUrl, setDraftUrl] = React.useState("");
  const [draftTags, setDraftTags] = React.useState<string[]>([]);
  const libraryScrollRef = React.useRef<HTMLDivElement>(null);
  const libraryScrollbarTrackRef = React.useRef<HTMLDivElement>(null);
  const libraryScrollbarDragRef = React.useRef<{ thumbOffset: number } | null>(null);
  const [libraryScrollState, setLibraryScrollState] = React.useState({
    thumbHeight: 0,
    thumbTop: 0,
    visible: false,
  });

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
  const activeSortOption = sortOptions.find((option) => option.id === sortOptionId) ?? sortOptions[0];
  const selectedLink = React.useMemo(
    () => orderedLinks.find((link) => link.id === selectedLinkId) ?? orderedLinks[0] ?? links[0] ?? savedLinks[0],
    [links, orderedLinks, selectedLinkId]
  );
  const emptyLibraryTitle = normalizedSearchQuery
    ? "No saved links match this"
    : activeTab === "All links"
      ? "No saved links yet"
      : `No links tagged "${activeTab}"`;
  const emptyLibraryDescription = normalizedSearchQuery
    ? "Try another word, or paste a link above and press Enter to save it."
    : activeTab === "All links"
      ? "Paste a link in search or use Save link to start building your library."
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
  const hydratedPreviewIdsRef = React.useRef<Set<string>>(new Set());
  const pendingPreviewIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    let cancelled = false;
    const pendingPreviewIds = pendingPreviewIdsRef.current;
    const requestedPreviewIds = new Set<string>();

    for (const link of links) {
      if (hydratedPreviewIdsRef.current.has(link.id) || pendingPreviewIds.has(link.id)) {
        continue;
      }

      requestedPreviewIds.add(link.id);
      pendingPreviewIds.add(link.id);

      void fetchLinkPreviewMetadata(link.href)
        .then((metadata) => {
          pendingPreviewIds.delete(link.id);

          if (cancelled || !metadata) {
            return;
          }

          hydratedPreviewIdsRef.current.add(link.id);

          const metadataTitle = metadata.title?.trim();
          const metadataDescription = metadata.description?.trim();
          const metadataSiteName = metadata.siteName?.trim();
          const metadataIcon = metadata.icon?.trim();
          const metadataLogo = metadata.logo?.trim();
          const metadataImage = metadata.image?.trim();

          setLinks((currentLinks) =>
            currentLinks.map((currentLink) =>
              currentLink.id === link.id
                ? {
                    ...currentLink,
                    previewTitle: metadataTitle ?? metadataSiteName ?? currentLink.previewTitle,
                    previewDescription: metadataDescription ?? currentLink.previewDescription,
                    faviconSrc: metadataIcon ?? currentLink.faviconSrc,
                    previewLogoSrc: metadataLogo ?? metadataIcon ?? currentLink.previewLogoSrc,
                    metadataImageSrc: metadataImage ?? currentLink.metadataImageSrc,
                  }
                : currentLink
            )
          );
        })
        .catch(() => {
          pendingPreviewIds.delete(link.id);
        });
    }

    return () => {
      cancelled = true;

      for (const id of requestedPreviewIds) {
        pendingPreviewIds.delete(id);
      }
    };
  }, [links]);
  const updateLibraryScrollbar = React.useCallback(() => {
    const element = libraryScrollRef.current;

    if (!element) {
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
  }, []);

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
    updateLibraryScrollbar();

    const element = libraryScrollRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateLibraryScrollbar);
      return () => window.removeEventListener("resize", updateLibraryScrollbar);
    }

    const resizeObserver = new ResizeObserver(updateLibraryScrollbar);
    resizeObserver.observe(element);

    window.addEventListener("resize", updateLibraryScrollbar);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLibraryScrollbar);
    };
  }, [orderedLinks.length, updateLibraryScrollbar]);


  const resetSaveDialog = () => {
    setDraftTitle("");
    setDraftUrl("");
    setDraftTags([]);
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
      };

      hydratedPreviewIdsRef.current.delete(updatedLink.id);
      pendingPreviewIdsRef.current.delete(updatedLink.id);
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
      savedReason: "Saved this link to revisit later with the context close by.",
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
    hydratedPreviewIdsRef.current.delete(deletedLinkId);
    pendingPreviewIdsRef.current.delete(deletedLinkId);

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

      <div className="relative mx-auto flex h-full w-[var(--app-max-width)] min-w-[var(--app-max-width)] flex-col">
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
          <div className="flex h-[var(--size-48)] w-[var(--layout-detail-width)] min-w-[var(--layout-detail-width)] max-w-[var(--layout-detail-width)] shrink-0 items-center justify-end">
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
            showCloseButton={false}
            className="flex w-[var(--save-link-dialog-width)] !max-w-[calc(100dvw-var(--space-48))] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border-0 bg-[var(--dialog-surface)] p-[var(--space-32)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] ring-0 backdrop-blur-[var(--blur-panel)] sm:!max-w-[var(--save-link-dialog-width)]"
          >
            <div className="flex flex-col gap-[var(--space-8)]">
              <DialogTitle className="type-title text-[var(--content-primary)]">{saveDialogMode === "edit" ? "Edit link" : "Save link"}</DialogTitle>
              <DialogDescription className="type-16 text-[var(--content-muted)]">
                {saveDialogMode === "edit"
                  ? "Update this saved link. Keepnoto will refresh metadata from the URL when available."
                  : "Add the link now. Keepnoto will use real metadata from the URL when available."}
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
                <span className="type-label text-[var(--content-muted)]">Tags</span>
                <MultiSelect
                  onCreateOption={createTagOption}
                  onOpenChange={setSaveDialogTagsOpen}
                  onValueChange={setDraftTags}
                  open={saveDialogTagsOpen}
                  options={tagOptions}
                  placeholder="Choose or create tags"
                  value={draftTags}
                  maxOptionLength={TAG_MAX_LENGTH}
                />
              </div>

              <div className="flex h-[var(--size-48)] items-center gap-[var(--space-8)] pt-[var(--space-8)]">
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
            showCloseButton={false}
            className="flex w-[var(--confirm-dialog-width)] !max-w-[calc(100dvw-var(--space-48))] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border-0 bg-[var(--dialog-surface)] p-[var(--space-32)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] ring-0 backdrop-blur-[var(--blur-panel)]"
          >
            <div className="flex flex-col gap-[var(--space-8)]">
              <DialogTitle className="type-title text-[var(--content-primary)]">Delete link?</DialogTitle>
              <DialogDescription className="type-16 text-[var(--content-muted)]">
                This will remove {selectedLink.title} from your library. This action cannot be undone.
              </DialogDescription>
            </div>

            <div className="flex h-[var(--size-48)] items-center gap-[var(--space-8)]">
              <Button className="h-[var(--size-48)] flex-1" onClick={() => setDeleteDialogOpen(false)} tone="secondary" type="button">
                Cancel
              </Button>
              <Button className="h-[var(--size-48)] flex-1" onClick={handleDeleteSelectedLink} tone="secondaryDanger" type="button">
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>


        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent
            showCloseButton={false}
            className="flex w-[var(--confirm-dialog-width)] !max-w-[calc(100dvw-var(--space-48))] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border-0 bg-[var(--dialog-surface)] p-[var(--space-32)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] ring-0 backdrop-blur-[var(--blur-panel)]"
          >
            <div className="flex flex-col gap-[var(--space-8)]">
              <DialogTitle className="type-title text-[var(--content-primary)]">Share link</DialogTitle>
              <DialogDescription className="type-16 text-[var(--content-muted)]">
                Share {selectedLink.title} or copy the direct resource link.
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-[var(--space-8)]">
              <span className="type-label text-[var(--content-muted)]">Link</span>
              <div className="flex h-[var(--size-48)] min-w-0 items-center gap-[var(--space-8)] rounded-[var(--radius-round)] bg-[var(--panel-surface)] p-[var(--space-8)]">
                <Icon icon={Icons.link} size={20} strokeWidth={1.8} className="shrink-0 text-[var(--content-muted)]" />
                <span className="min-w-0 flex-1 truncate type-16 text-[var(--content-primary)]">{selectedLink.href}</span>
                <Button className={cn("relative h-[var(--size-32)] overflow-visible px-[var(--space-16)] type-12-semibold", shareCopyState === "copied" && "copy-success-button")} onClick={handleCopyShareLink} tone="secondary" type="button">
                  <Icon icon={shareCopyState === "copied" ? Icons.check : Icons.copy} size={16} strokeWidth={2} aria-hidden="true" />
                  <span aria-live="polite">{shareCopyState === "copied" ? "Copied" : shareCopyState === "failed" ? "Retry" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-[var(--space-16)]">
              <span aria-hidden="true" className="h-px flex-1 bg-[var(--divider-subtle)]" />
              <div className="flex shrink-0 items-center justify-center gap-[var(--space-8)]">
              {shareTargets.map((target) => (
                <a
                  key={target.label}
                  aria-label={`Share on ${target.label}`}
                  className="inline-flex size-[var(--size-48)] shrink-0 items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] text-[var(--content-primary)] transition-[background-color,color,opacity] hover:bg-[var(--card-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
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

            <Button className="h-[var(--size-48)] w-full" onClick={() => setShareDialogOpen(false)} tone="secondary" type="button">
              Done
            </Button>
          </DialogContent>
        </Dialog>
        <div className="mt-[var(--space-24)] grid min-h-0 flex-1 w-full grid-cols-[var(--layout-left-width)_var(--layout-detail-width)] gap-[var(--space-24)]">
          <div className="flex h-full w-[var(--layout-left-width)] shrink-0 gap-[var(--space-16)]">
            <aside aria-label="Keepnoto navigation" className="flex h-full w-[var(--layout-sidebar-width)] shrink-0 flex-col items-center justify-between">
              <nav className="flex w-[var(--layout-sidebar-width)] flex-col items-center gap-[var(--space-8)]">
                {navItems.map((item) => (
                  <IconButton key={item.label} icon={item.icon} label={item.label} active={item.active} iconSize={24} tooltipSide="auto" />
                ))}
              </nav>
              <div className="flex w-[var(--layout-sidebar-width)] flex-col items-center gap-[var(--space-8)]">
                <div className="flex size-[var(--size-48)] items-center justify-center overflow-hidden rounded-[var(--radius-round)] bg-[var(--avatar-overlay)] type-16-semibold text-[var(--white)]">
                  N
                </div>
              </div>
            </aside>

            <section ref={setLibraryBoundary} className="flex h-full w-[var(--search-width)] shrink-0 flex-col rounded-[var(--radius-32)] bg-[var(--panel-surface)] px-[var(--space-24)] pb-[var(--space-0)] pt-[var(--space-32)] backdrop-blur-[var(--blur-soft)]">
              <div className="flex min-h-[var(--size-32)] w-full items-center justify-between gap-[var(--space-16)]">
                <div className="flex items-baseline gap-[var(--space-8)]">
                  <h1 className="type-title text-[var(--content-primary)]">Library</h1>
                  <span className="type-16 text-[var(--content-muted)]">{orderedLinks.length} links</span>
                </div>
                <Dropdown
                  align="end"
                  sideOffset={FLOATING_SIDE_OFFSET}
                  collisionBoundary={libraryBoundary ?? undefined}
                  trigger={
                    <button
                      className="inline-flex h-[var(--size-24)] items-center gap-[var(--space-8)] rounded-[var(--radius-8)] px-[var(--space-4)] type-16 text-[var(--content-muted)] transition-colors hover:text-[var(--content-primary)] data-[popup-open]:text-[var(--content-primary)]"
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

              <div className="relative mt-[var(--space-20)] min-h-0 w-full flex-1">
                <div
                  ref={libraryScrollRef}
                  className="library-scroll h-full min-h-0 w-full overflow-x-hidden overflow-y-auto overscroll-contain"
                  onScroll={updateLibraryScrollbar}
                >
                  {orderedLinks.length > 0 ? (
                    <div className="library-card-stack">
                      {orderedLinks.map((link) => (
                        <div
                          key={link.id}
                          className="library-card-motion"
                          style={{ viewTransitionName: favoriteTransitionLinkId === link.id ? "favorite-flight" : `saved-link-${link.id}` } as React.CSSProperties}
                        >
                          <LinkCard
                            title={link.title}
                            source={link.domain}
                            url={link.domain}
                            description={link.description}
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
                    <div className="flex h-full min-h-[calc(var(--size-48)*6)] flex-col items-center justify-center gap-[var(--space-24)] px-[var(--space-24)] py-[var(--space-48)] text-center">
                      <svg
                        aria-hidden="true"
                        className="h-[calc(var(--size-48)*4+var(--space-24))] w-[calc(var(--size-48)*4+var(--space-24))] overflow-visible"
                        fill="none"
                        viewBox="0 0 216 216"
                      >
                        <defs>
                          <linearGradient id="empty-state-surface" x1="40" x2="174" y1="74" y2="174" gradientUnits="userSpaceOnUse">
                            <stop stopColor="var(--white)" stopOpacity="0.96" />
                            <stop offset="1" stopColor="var(--control-surface)" stopOpacity="0.78" />
                          </linearGradient>
                          <linearGradient id="empty-state-muted-surface" x1="46" x2="168" y1="42" y2="132" gradientUnits="userSpaceOnUse">
                            <stop stopColor="var(--white)" stopOpacity="0.54" />
                            <stop offset="1" stopColor="var(--control-surface)" stopOpacity="0.34" />
                          </linearGradient>
                          <linearGradient id="empty-state-accent" x1="58" x2="104" y1="106" y2="154" gradientUnits="userSpaceOnUse">
                            <stop stopColor="var(--accent-soft)" />
                            <stop offset="1" stopColor="var(--accent-start)" />
                          </linearGradient>
                          <radialGradient id="empty-state-lens" cx="0" cy="0" r="1" gradientTransform="matrix(42 38 -38 42 132 90)" gradientUnits="userSpaceOnUse">
                            <stop stopColor="var(--white)" stopOpacity="0.94" />
                            <stop offset="1" stopColor="var(--control-surface)" stopOpacity="0.72" />
                          </radialGradient>
                          <filter id="empty-state-card-shadow" colorInterpolationFilters="sRGB" x="12" y="28" width="184" height="166">
                            <feDropShadow dx="0" dy="18" stdDeviation="15" floodColor="var(--accent-start)" floodOpacity="0.11" />
                            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="var(--content-primary)" floodOpacity="0.05" />
                          </filter>
                          <filter id="empty-state-lens-shadow" colorInterpolationFilters="sRGB" x="74" y="38" width="128" height="132">
                            <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="var(--accent-start)" floodOpacity="0.16" />
                            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--content-primary)" floodOpacity="0.08" />
                          </filter>
                        </defs>
                        <circle cx="42" cy="48" r="3" fill="var(--accent-start)" opacity="0.2" />
                        <circle cx="174" cy="60" r="5" fill="var(--content-muted)" opacity="0.12" />
                        <circle cx="42" cy="170" r="4" fill="var(--content-muted)" opacity="0.11" />
                        <path d="M164 148c5-2 8-6 9-12 1 6 4 10 9 12-5 2-8 6-9 12-1-6-4-10-9-12Z" fill="var(--accent-start)" opacity="0.2" />
                        <g opacity="0.64" transform="rotate(-4 106 78)">
                          <rect x="48" y="46" width="120" height="64" rx="20" fill="url(#empty-state-muted-surface)" stroke="var(--white)" strokeOpacity="0.54" strokeWidth="2" />
                          <rect x="68" y="64" width="26" height="26" rx="9" fill="var(--accent-start)" opacity="0.16" />
                          <rect x="104" y="65" width="46" height="7" rx="3.5" fill="var(--skeleton-muted)" opacity="0.56" />
                          <rect x="104" y="81" width="34" height="7" rx="3.5" fill="var(--skeleton-muted-soft)" opacity="0.72" />
                        </g>
                        <g filter="url(#empty-state-card-shadow)">
                          <rect x="30" y="94" width="136" height="82" rx="24" fill="url(#empty-state-surface)" stroke="var(--white)" strokeOpacity="0.86" strokeWidth="2" />
                          <rect x="50" y="114" width="38" height="38" rx="13" fill="url(#empty-state-accent)" opacity="0.46" />
                          <path d="m66 132-5 5c-4 4-10 4-14 0s-4-10 0-14l5-5" stroke="var(--white)" strokeLinecap="round" strokeWidth="4" opacity="0.78" />
                          <path d="m69 124 5-5c4-4 10-4 14 0s4 10 0 14l-5 5" stroke="var(--white)" strokeLinecap="round" strokeWidth="4" opacity="0.94" />
                          <rect x="100" y="113" width="44" height="7" rx="3.5" fill="var(--skeleton-muted)" opacity="0.9" />
                          <rect x="100" y="130" width="34" height="7" rx="3.5" fill="var(--skeleton-muted-soft)" opacity="0.94" />
                          <rect x="50" y="160" width="34" height="10" rx="5" fill="var(--tag-surface)" opacity="0.92" />
                          <rect x="92" y="160" width="42" height="10" rx="5" fill="var(--tag-surface)" opacity="0.7" />
                        </g>
                        <g filter="url(#empty-state-lens-shadow)">
                          <circle cx="132" cy="88" r="39" fill="url(#empty-state-lens)" stroke="var(--white)" strokeOpacity="0.9" strokeWidth="5" />
                          <path d="M106 78c7-13 23-20 38-14" stroke="var(--white)" strokeLinecap="round" strokeOpacity="0.58" strokeWidth="7" />
                          <circle cx="132" cy="88" r="27" stroke="var(--content-muted)" strokeOpacity="0.18" strokeWidth="4" />
                          <path d="m123 91-6 6c-5 5-13 5-18 0s-5-13 0-18l6-6" stroke="var(--accent-start)" strokeLinecap="round" strokeWidth="6" opacity="0.54" />
                          <path d="m126 82 6-6c5-5 13-5 18 0s5 13 0 18l-6 6" stroke="var(--accent-start)" strokeLinecap="round" strokeWidth="6" opacity="0.82" />
                          <path d="m116 92 28-28" stroke="var(--accent-start)" strokeLinecap="round" strokeWidth="5" opacity="0.62" />
                          <path d="m160 116 28 28" stroke="var(--accent-start)" strokeLinecap="round" strokeWidth="14" />
                          <path d="m154 110 12 12" stroke="var(--accent-soft)" strokeLinecap="round" strokeWidth="12" opacity="0.82" />
                        </g>
                      </svg>
                      <div className="flex max-w-[calc(var(--size-48)*7)] flex-col items-center gap-[var(--space-8)]">
                        <p className="type-16-semibold text-[var(--content-primary)]">{emptyLibraryTitle}</p>
                        <p className="type-16 text-[var(--content-muted)]">{emptyLibraryDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
                {libraryScrollState.visible ? (
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

          <section className="w-[var(--layout-detail-width)] min-w-[var(--layout-detail-width)] max-w-[var(--layout-detail-width)] shrink-0 self-start rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)] backdrop-blur-[var(--blur-soft)]">
            <div className="flex w-full flex-col gap-[var(--space-24)]">
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

              <SavedReason reason={selectedLink.savedReason ?? selectedLink.description} />

            </div>

            <div className="mt-[var(--space-40)] w-full">
              <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-[var(--space-32)]">
                <div className="flex min-w-0 flex-col gap-[var(--space-24)]">
                  <div className="flex min-w-0 flex-col gap-[var(--space-8)]">
                    <p className="type-label text-[var(--content-muted)]">Tags</p>
                    <div className="relative flex h-[var(--size-24)] min-w-0 items-center gap-[var(--space-8)] overflow-visible">
                      {selectedLink.tags.slice(0, detailVisibleTagCount).map((tag) => (
                        <Tag key={tag} aria-label={`Filter library by ${tag}`} className="shrink-0" onClick={() => selectTab(tag)}>{tag}</Tag>
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
                          <Tag aria-label={`${hiddenDetailTags.length} more tags`} className="shrink-0">
                            +{hiddenDetailTags.length}
                          </Tag>
                        </Tooltip>
                      ) : null}
                      <Tag add aria-label="Add tag" className="shrink-0" onClick={() => openEditDialog(selectedLink, { openTags: true })}>
                        {hiddenDetailTags.length > 0 ? "+" : "+ Add tag"}
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
