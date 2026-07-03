"use client";

import * as React from "react";
import { Dropdown, DropdownItem } from "@/components/keepnoto/dropdown";
import { LinkCard } from "@/components/keepnoto/link-card";
import { cn } from "@/lib/utils";
import {
  BrandLogo,
  Button,
  Icon,
  IconButton,
  Icons,
  LinkPreviewCard,
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

const savedLinks = [
  {
    id: "supabase-auth",
    title: "Supabase Auth — Documentation",
    domain: "supabase.com/docs/guides/auth",
    source: "supabase.com",
    description:
      "The cleanest explanation of magic links and OAuth providers. The session refresh flow finally clicked.",
    previewTitle: "Supabase Docs",
    previewDescription:
      "Production-ready backend for app developers.\nPostgres, Auth, Storage and Edge Functions.",
    href: "https://supabase.com/docs/guides/auth",
    type: "Documentation",
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
    tags: ["auth", "docs", "supabase"],
    addedDate: "9 days ago",
    logoColor: "var(--favicon-5)",
  },
];

const navItems = [
  { label: "Links", icon: Icons.link, active: true },
  { label: "Tags", icon: Icons.tag },
  { label: "Collections", icon: Icons.folder },
  { label: "Reading", icon: Icons.book },
];

function getVisibleTabs(activeTab: string) {
  const allTab = filterTabs[0];
  const defaultVisible = filterTabs.slice(1, 4);
  const isOverflowActive = ![allTab, ...defaultVisible].some((tab) => tab.label === activeTab);

  if (!isOverflowActive) {
    return [allTab, ...defaultVisible];
  }

  const activeOverflowTab = filterTabs.find((tab) => tab.label === activeTab);

  if (!activeOverflowTab) {
    return [allTab, ...defaultVisible];
  }

  return [allTab, activeOverflowTab, ...defaultVisible.filter((tab) => tab.label !== activeTab).slice(0, 2)];
}

function orderLinksByFavorite(links: typeof savedLinks, favoriteLinkIds: Set<string>) {
  const favoriteLinks = links.filter((link) => favoriteLinkIds.has(link.id));
  const regularLinks = links.filter((link) => !favoriteLinkIds.has(link.id));

  return [...favoriteLinks, ...regularLinks];
}

export default function Home() {
  const [libraryBoundary, setLibraryBoundary] = React.useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = React.useState(filterTabs[0].label);
  const [selectedLinkId, setSelectedLinkId] = React.useState(savedLinks[0].id);
  const [favoriteLinkIds, setFavoriteLinkIds] = React.useState<Set<string>>(() => new Set());

  const visibleFilterTabs = React.useMemo(() => getVisibleTabs(activeTab), [activeTab]);
  const overflowFilterTabs = React.useMemo(
    () => filterTabs.filter((tab) => !visibleFilterTabs.some((visibleTab) => visibleTab.label === tab.label)),
    [visibleFilterTabs]
  );
  const filteredLinks = React.useMemo(
    () => (activeTab === "All links" ? savedLinks : savedLinks.filter((link) => link.tags.includes(activeTab))),
    [activeTab]
  );
  const orderedLinks = React.useMemo(
    () => orderLinksByFavorite(filteredLinks, favoriteLinkIds),
    [filteredLinks, favoriteLinkIds]
  );
  const selectedLink = React.useMemo(
    () => orderedLinks.find((link) => link.id === selectedLinkId) ?? orderedLinks[0] ?? savedLinks[0],
    [orderedLinks, selectedLinkId]
  );
  const isSelectedLinkFavorite = favoriteLinkIds.has(selectedLink.id);

  const selectTab = (tab: string) => {
    const nextLinks = orderLinksByFavorite(
      tab === "All links" ? savedLinks : savedLinks.filter((link) => link.tags.includes(tab)),
      favoriteLinkIds
    );

    setActiveTab(tab);
    setSelectedLinkId(nextLinks[0]?.id ?? savedLinks[0].id);
  };

  const toggleFavorite = (linkId: string) => {
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

      <div className="relative mx-auto h-full w-full max-w-[var(--app-max-width)]">
        <header className="flex h-[var(--size-48)] w-full items-center justify-between">
          <div className="flex h-[var(--size-48)] w-[var(--layout-left-width)] items-center gap-[var(--space-16)]">
            <div className="flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-12)]">
              <BrandLogo size={32} />
            </div>
            <TextField placeholder="Search your library or paste a link to save..." />
          </div>
          <Button tone="primary" className="h-[var(--size-48)] w-[var(--save-button-width)]">
            <Icon icon={Icons.add} size={20} strokeWidth={2} aria-hidden="true" />
            Save link
          </Button>
        </header>

        <div className="mt-[var(--space-24)] flex h-[calc(100dvh-var(--layout-main-height-offset))] w-full gap-[var(--space-24)]">
          <div className="flex h-full w-[var(--layout-left-width)] gap-[var(--space-16)]">
            <aside aria-label="Keepnoto navigation" className="flex h-full w-[var(--layout-sidebar-width)] flex-col items-center justify-between">
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

            <section ref={setLibraryBoundary} className="flex h-full w-[var(--layout-library-width)] flex-col rounded-[var(--radius-16)] bg-[var(--panel-surface)] p-[var(--space-24)] pt-[var(--space-32)] backdrop-blur-[1px]">
              <div className="flex h-[var(--size-32)] w-[var(--layout-library-inner-width)] items-center justify-between">
                <div className="flex items-baseline gap-[var(--space-8)]">
                  <h1 className="type-title text-[var(--content-primary)]">Library</h1>
                  <span className="type-16 text-[var(--content-muted)]">142 links</span>
                </div>
                <button className="inline-flex h-[var(--size-24)] items-center gap-[var(--space-8)] type-16 text-[var(--content-muted)]" type="button">
                  Recently saved
                  <Icon icon={Icons.sort} size={20} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>

              <div role="tablist" aria-label="Saved link filters" className="relative mt-[var(--space-20)] flex h-[var(--size-32)] items-center gap-[var(--space-8)] overflow-visible">
                {visibleFilterTabs.map((item) => (
                  <Tab key={item.label} selected={item.label === activeTab} onClick={() => selectTab(item.label)}>
                    {item.label}
                  </Tab>
                ))}
                {overflowFilterTabs.length > 0 ? (
                  <Dropdown
                    align="start"
                    sideOffset={8}
                    collisionBoundary={libraryBoundary ?? undefined}
                    trigger={
                      <Tab hasMenu aria-label="Show more filters">
                        More
                      </Tab>
                    }
                  >
                    {overflowFilterTabs.map((item) => (
                      <DropdownItem key={item.label} onClick={() => selectTab(item.label)}>
                        {item.label}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                ) : null}
              </div>

              <div className="mt-[var(--space-20)] flex min-h-0 w-[var(--layout-library-inner-width)] flex-1 flex-col gap-[var(--space-8)] overflow-hidden">
                {orderedLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    title={link.title}
                    source={link.domain}
                    url={link.domain}
                    description={link.description}
                    tags={link.tags}
                    savedAt={link.addedDate}
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
                ))}
              </div>
            </section>
          </div>

          <section className="h-[var(--detail-panel-height)] min-w-0 flex-1 rounded-[var(--radius-16)] bg-[var(--panel-surface)] p-[var(--space-24)] backdrop-blur-[1px]">
            <div className="flex h-[var(--detail-hero-height)] w-full flex-col gap-[var(--space-24)]">
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
                  <IconButton icon={Icons.share} label="Share selected link" iconSize={20} surface="card" tooltipSide="right" />
                </div>
              </div>

              <LinkPreviewCard
                title={selectedLink.previewTitle}
                description={selectedLink.previewDescription}
                url={selectedLink.domain}
                externalHref={selectedLink.href}
              />
            </div>

            <div className="mt-[var(--space-40)] h-[var(--metadata-height)] w-full">
              <div className="flex h-[var(--metadata-row-height)] w-full items-center gap-[var(--space-32)]">
                <div className="flex h-[var(--metadata-row-height)] w-[var(--metadata-column-width)] flex-col gap-[var(--space-24)]">
                  <div className="flex h-[var(--metadata-item-height)] w-[var(--metadata-column-width)] flex-col gap-[var(--space-8)]">
                    <p className="type-label text-[var(--content-muted)]">Tags</p>
                    <div className="flex h-[var(--size-24)] flex-wrap gap-[var(--space-8)]">
                      {selectedLink.tags.slice(0, 2).map((tag) => (
                        <Tag key={tag} aria-label={`Filter library by ${tag}`} onClick={() => selectTab(tag)}>{tag}</Tag>
                      ))}
                      <Tag add>+ Add tag</Tag>
                    </div>
                  </div>
                  <div className="flex h-[var(--metadata-item-height)] w-[var(--metadata-column-width)] flex-col gap-[var(--space-8)]">
                    <p className="type-label text-[var(--content-muted)]">Source</p>
                    <span className="flex h-[var(--size-24)] items-center gap-[var(--space-8)] type-16 text-[var(--content-primary)]">
                      <Icon icon={Icons.globe} size={20} strokeWidth={1.8} className="text-[var(--content-muted)]" />
                      {selectedLink.source}
                    </span>
                  </div>
                </div>
                <div aria-hidden="true" className="min-h-[var(--metadata-row-height)] shrink-0 self-stretch border-l border-[var(--divider-subtle)]" />
                <div className="flex h-[var(--metadata-row-height)] w-[var(--metadata-column-width)] flex-col gap-[var(--space-24)]">
                  {["Saved", "Saved"].map((label) => (
                    <div key={label} className="flex h-[var(--metadata-item-height)] w-[var(--metadata-column-width)] flex-col gap-[var(--space-8)]">
                      <p className="type-label text-[var(--content-muted)]">{label}</p>
                      <span className="flex h-[var(--size-24)] items-center gap-[var(--space-8)] type-16 text-[var(--content-primary)]">
                        <Icon icon={Icons.calendar} size={20} strokeWidth={1.8} className="text-[var(--content-muted)]" />
                        {selectedLink.addedDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-[var(--space-32)] h-px w-full bg-[var(--divider-subtle)]" />
              <div className="mt-[var(--space-28)] flex h-[var(--size-48)] w-full items-center gap-[var(--space-8)]">
                <Button tone="secondaryDanger" className="h-[var(--size-48)] flex-1">Delete</Button>
                <Button tone="secondary" className="h-[var(--size-48)] flex-1">Edit</Button>
                <Button tone="primary" className="h-[var(--size-48)] w-[var(--primary-action-width)]">
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
