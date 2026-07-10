"use client";

import * as React from "react";

import { TAG_MAX_LENGTH } from "@/components/keepnoto/design-constants";
import { Dropdown, DropdownItem } from "@/components/keepnoto/dropdown";
import { Button, Icon, IconButton, Icons, LinkLogo } from "@/components/keepnoto/product-components";
import { cn } from "@/lib/utils";

export type TagSummary = {
  name: string;
  linkCount: number;
};

export type TagLinkSummary = {
  id: string;
  title: string;
  source: string;
  faviconSrc?: string;
  logoColor?: string;
};

const tagSortOptions = [
  { id: "name-asc", label: "Name A-Z" },
  { id: "name-desc", label: "Name Z-A" },
  { id: "links-desc", label: "Most links" },
  { id: "links-asc", label: "Fewest links" },
] as const;

type TagSortId = (typeof tagSortOptions)[number]["id"];

type TagManagerPanelProps = {
  loading?: boolean;
  tags: TagSummary[];
  totalCount: number;
  selectedTag?: string;
  searchQuery: string;
  onSelectTag: (tag: string) => void;
  onRenameTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
};

export function TagManagerPanel({
  loading = false,
  tags,
  totalCount,
  selectedTag,
  searchQuery,
  onSelectTag,
  onRenameTag,
  onDeleteTag,
}: TagManagerPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const pointerIdRef = React.useRef<number | null>(null);
  const [scrollbar, setScrollbar] = React.useState({ height: 0, top: 0, visible: false });
  const [sortId, setSortId] = React.useState<TagSortId>("name-asc");
  const activeSortOption = tagSortOptions.find((option) => option.id === sortId) ?? tagSortOptions[0];
  const sortedTags = React.useMemo(() => {
    const nextTags = [...tags];

    return nextTags.sort((a, b) => {
      if (sortId === "links-desc") {
        return b.linkCount - a.linkCount || a.name.localeCompare(b.name, "en", { sensitivity: "base" });
      }

      if (sortId === "links-asc") {
        return a.linkCount - b.linkCount || a.name.localeCompare(b.name, "en", { sensitivity: "base" });
      }

      const nameOrder = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
      return sortId === "name-desc" ? -nameOrder : nameOrder;
    });
  }, [sortId, tags]);

  const updateScrollbar = React.useCallback(() => {
    const scrollElement = scrollRef.current;
    const trackElement = trackRef.current;

    if (!scrollElement || !trackElement) {
      return;
    }

    const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;

    if (maxScrollTop <= 1) {
      setScrollbar((current) => current.visible ? { height: 0, top: 0, visible: false } : current);
      return;
    }

    const trackHeight = trackElement.clientHeight;
    const height = Math.max(32, Math.round((scrollElement.clientHeight / scrollElement.scrollHeight) * trackHeight));
    const maxTop = Math.max(0, trackHeight - height);
    const top = Math.round((scrollElement.scrollTop / maxScrollTop) * maxTop);

    setScrollbar((current) =>
      current.visible && current.height === height && current.top === top
        ? current
        : { height, top, visible: true }
    );
  }, []);

  const scrollToPointer = React.useCallback((clientY: number) => {
    const scrollElement = scrollRef.current;
    const trackElement = trackRef.current;

    if (!scrollElement || !trackElement) {
      return;
    }

    const rect = trackElement.getBoundingClientRect();
    const maxTop = Math.max(1, rect.height - scrollbar.height);
    const nextTop = Math.min(Math.max(0, clientY - rect.top - scrollbar.height / 2), maxTop);
    const maxScrollTop = Math.max(1, scrollElement.scrollHeight - scrollElement.clientHeight);

    scrollElement.scrollTop = (nextTop / maxTop) * maxScrollTop;
    updateScrollbar();
  }, [scrollbar.height, updateScrollbar]);

  React.useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(updateScrollbar);
    const scrollElement = scrollRef.current;

    if (!scrollElement || typeof ResizeObserver === "undefined") {
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new ResizeObserver(updateScrollbar);
    observer.observe(scrollElement);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sortedTags.length, updateScrollbar]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollToPointer(event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === event.pointerId) {
      scrollToPointer(event.clientY);
    }
  };

  const stopPointerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerIdRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="flex h-full min-h-0 w-[var(--search-width)] shrink-0 flex-col rounded-[var(--radius-32)] bg-[var(--panel-surface)] px-[var(--space-24)] pb-[var(--space-12)] pt-[var(--space-32)] backdrop-blur-[var(--blur-soft)]">
      <div className="flex min-h-[var(--size-32)] items-center justify-between gap-[var(--space-16)]">
        <div className="flex items-baseline gap-[var(--space-8)]">
          <h1 className="type-title text-[var(--content-primary)]">Tags</h1>
          <span className="type-16 text-[var(--content-muted)]">{totalCount} {totalCount === 1 ? "tag" : "tags"}</span>
        </div>
        <Dropdown
          align="end"
          trigger={
            <button className="inline-flex h-[var(--size-24)] items-center gap-[var(--space-8)] rounded-[var(--radius-8)] px-[var(--space-4)] type-16 text-[var(--content-muted)] transition-colors duration-150 hover:text-[var(--content-primary)] data-[popup-open]:text-[var(--content-primary)]" type="button">
              {activeSortOption.label}
              <Icon icon={Icons.sort} size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
          }
        >
          {tagSortOptions.map((option) => (
            <DropdownItem key={option.id} selected={option.id === sortId} onClick={() => setSortId(option.id)}>
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      <div className="relative mt-[var(--space-20)] min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="keepnoto-scrollbar h-full min-h-0 overflow-y-auto overscroll-contain"
          onScroll={updateScrollbar}
        >
          {loading ? (
            <div aria-label="Loading tags" className="flex min-h-full flex-col gap-[var(--space-4)]">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex min-h-[var(--size-48)] animate-pulse items-center gap-[var(--space-8)] rounded-[var(--radius-16)] px-[var(--space-12)]">
                  <span className="size-[var(--space-16)] rounded-full bg-[var(--skeleton-muted)]" />
                  <span className="h-[var(--skeleton-line-height)] flex-1 rounded-full bg-[var(--skeleton-muted)]" />
                  <span className="h-[var(--skeleton-line-height-sm)] w-[var(--space-48)] rounded-full bg-[var(--skeleton-muted-soft)]" />
                </div>
              ))}
            </div>
          ) : sortedTags.length > 0 ? (
            <div className="flex min-h-full flex-col gap-[var(--space-4)]">
              {sortedTags.map((tag) => {
                const selected = tag.name === selectedTag;

                return (
                  <div
                    key={tag.name}
                    data-selected={selected ? "true" : undefined}
                    onClick={() => onSelectTag(tag.name)}
                    className={cn(
                      "group flex min-h-[var(--size-48)] cursor-pointer items-center gap-[var(--space-8)] rounded-[var(--radius-16)] px-[var(--space-12)] transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
                      selected ? "bg-[var(--card-active-surface)]" : "hover:bg-[var(--state-hover)]"
                    )}
                  >
                    <button
                      aria-current={selected ? "true" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-[var(--space-8)] text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                      type="button"
                    >
                      <span aria-hidden="true" className="shrink-0 type-16-semibold text-[var(--tab-hash)]">#</span>
                      <span className="min-w-0 flex-1 truncate type-16-semibold text-[var(--content-primary)]">{tag.name}</span>
                      <span className="shrink-0 type-12 text-[var(--content-muted)]">
                        {tag.linkCount} {tag.linkCount === 1 ? "link" : "links"}
                      </span>
                    </button>
                    <Dropdown
                      trigger={
                        <IconButton
                          className="-mr-[var(--space-16)]"
                          icon={Icons.more}
                          iconSize={20}
                          label={"Actions for " + tag.name}
                          surface="page"
                          tooltip={false}
                        />
                      }
                    >
                      <DropdownItem icon={Icons.edit} onClick={() => onRenameTag(tag.name)}>Rename</DropdownItem>
                      <DropdownItem icon={Icons.delete} tone="danger" onClick={() => onDeleteTag(tag.name)}>Delete</DropdownItem>
                    </Dropdown>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full min-h-[calc(var(--size-48)*5)] flex-col items-center justify-center gap-[var(--space-16)] px-[var(--space-24)] text-center">
              <span className="flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] text-[var(--icon-muted)]">
                <Icon icon={Icons.tag} size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="flex max-w-[var(--auth-copy-width)] flex-col gap-[var(--space-8)]">
                <p className="type-16-semibold text-[var(--content-primary)]">{searchQuery ? "No tags found" : "No tags yet"}</p>
                <p className="type-16 text-[var(--content-muted)]">
                  {searchQuery ? "Try another search." : "Tags appear here when you add them to saved links."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          ref={trackRef}
          aria-hidden="true"
          className={cn(
            "keepnoto-scrollbar-track bottom-[var(--space-16)] right-[var(--scrollbar-track-edge-inset)] top-[var(--space-16)] transition-opacity",
            scrollbar.visible ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopPointerDrag}
          onPointerCancel={stopPointerDrag}
        >
          {scrollbar.visible ? (
            <span className="keepnoto-scrollbar-thumb" style={{ height: scrollbar.height, transform: "translateY(" + scrollbar.top + "px)" }} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

type TagDetailPanelProps = {
  tag?: TagSummary;
  links: TagLinkSummary[];
  renaming: boolean;
  renameDraft: string;
  renameError: string | null;
  renamePending: boolean;
  onOpenLink: (linkId: string) => void;
  onViewLinks: (tag: string) => void;
  onRenameDraftChange: (value: string) => void;
  onStartRename: (tag: string) => void;
  onCancelRename: () => void;
  onSubmitRename: () => Promise<void>;
  onDeleteTag: (tag: string) => void;
};

export function TagDetailPanel({
  tag,
  links,
  renaming,
  renameDraft,
  renameError,
  renamePending,
  onOpenLink,
  onViewLinks,
  onRenameDraftChange,
  onStartRename,
  onCancelRename,
  onSubmitRename,
  onDeleteTag,
}: TagDetailPanelProps) {
  const handleRenameBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (nextFocusedElement && event.currentTarget.contains(nextFocusedElement)) {
      return;
    }

    void onSubmitRename();
  };
  return (
    <section className="w-[var(--layout-detail-width)] min-w-[var(--layout-detail-min-width)] max-w-[var(--layout-detail-max-width)] self-start rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)] backdrop-blur-[var(--blur-soft)]">
      {tag ? (
        <div className="flex w-full flex-col gap-[var(--space-24)]">
          <div className="flex flex-col gap-[var(--space-4)]">
            <div className="flex min-h-[var(--size-48)] items-center gap-[var(--space-8)]">
              {renaming ? (
                <form className="flex min-w-0 flex-1 items-center gap-[var(--space-8)]" onBlur={handleRenameBlur} onSubmit={(event) => { event.preventDefault(); void onSubmitRename(); }}>
                  <span aria-hidden="true" className="type-title text-[var(--tab-hash)]">#</span>
                  <span className="group relative flex h-[var(--size-40)] min-w-0 flex-1 items-center">
                    <input
                      aria-invalid={Boolean(renameError) || undefined}
                      aria-label="Tag name"
                      autoFocus
                      className="h-full min-w-0 flex-1 bg-transparent type-title text-[var(--content-primary)] outline-none"
                      disabled={renamePending}
                      maxLength={TAG_MAX_LENGTH}
                      onChange={(event) => onRenameDraftChange(event.target.value)}
                      onFocus={(event) => event.currentTarget.select()}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          onCancelRename();
                        }
                      }}
                      value={renameDraft}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-colors duration-150",
                        renameError
                          ? "bg-[var(--danger)]"
                          : "bg-[var(--skeleton-muted)] group-focus-within:bg-[var(--add-tag-border)]"
                      )}
                    />
                  </span>
                  <IconButton
                    className="!text-[var(--success-muted)] hover:!text-[var(--success)] data-[state=hover]:!text-[var(--success)] active:opacity-70"
                    disabled={renamePending || !renameDraft.trim()}
                    icon={Icons.check}
                    iconSize={20}
                    label="Save tag name"
                    surface="card"
                    tooltip={false}
                    type="submit"
                  />
                  <IconButton
                    className="!text-[var(--danger-muted)] hover:!text-[var(--danger)] data-[state=hover]:!text-[var(--danger)] active:opacity-70"
                    disabled={renamePending}
                    icon={Icons.cancel}
                    iconSize={20}
                    label="Cancel rename"
                    surface="card"
                    onClick={onCancelRename}
                    tooltip={false}
                    type="button"
                  />
                </form>
              ) : (
                <h2 className="min-w-0 flex-1">
                  <button className="flex max-w-full cursor-text items-center gap-[var(--space-8)] rounded-[var(--radius-8)] text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" onClick={() => onStartRename(tag.name)} type="button">
                    <span aria-hidden="true" className="type-title text-[var(--tab-hash)]">#</span>
                    <span className="truncate type-title text-[var(--content-primary)]">{tag.name}</span>
                  </button>
                </h2>
              )}
            </div>
            {renameError ? <p aria-live="polite" className="type-12 text-[var(--danger)]">{renameError}</p> : null}
          </div>
          <div className="flex items-center gap-[var(--space-8)] type-16 text-[var(--content-muted)]">
            <Icon icon={Icons.link} size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>Used on {tag.linkCount} {tag.linkCount === 1 ? "saved link" : "saved links"}</span>
          </div>

          <div aria-hidden="true" className="h-px w-full bg-[var(--divider-subtle)]" />

          <div className="flex flex-col gap-[var(--space-8)]">
            <p className="type-label text-[var(--content-muted)]">Saved links</p>
            {links.length > 0 ? (
              <div className="flex flex-col gap-[var(--space-4)]">
                {links.slice(0, 6).map((link) => (
                  <button
                    key={link.id}
                    className="flex min-h-[var(--size-48)] items-center gap-[var(--space-12)] rounded-[var(--radius-12)] px-[var(--space-12)] text-left transition-colors duration-150 hover:bg-[var(--state-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                    onClick={() => onOpenLink(link.id)}
                    type="button"
                  >
                    <LinkLogo src={link.faviconSrc} fallback={link.source} color={link.logoColor} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate type-16-semibold text-[var(--content-primary)]">{link.title}</span>
                      <span className="block truncate type-12 text-[var(--content-muted)]">{link.source}</span>
                    </span>
                  </button>
                ))}
                {links.length > 6 ? <p className="px-[var(--space-12)] type-12 text-[var(--content-muted)]">+{links.length - 6} more</p> : null}
              </div>
            ) : (
              <p className="type-16 text-[var(--content-muted)]">This tag is not used on any saved links.</p>
            )}
          </div>

          <div aria-hidden="true" className="h-px w-full bg-[var(--divider-subtle)]" />
          <div className="flex h-[var(--size-48)] items-center gap-[var(--space-8)]">
            <Button className="h-[var(--size-48)] flex-1" onClick={() => onDeleteTag(tag.name)} tone="secondaryDanger" type="button">Delete</Button>
            <Button className="h-[var(--size-48)] flex-1" onClick={() => onViewLinks(tag.name)} tone="primary" type="button">View links</Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(var(--size-48)*5)] flex-col items-center justify-center gap-[var(--space-16)] px-[var(--space-32)] text-center">
          <span className="flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] text-[var(--icon-muted)]">
            <Icon icon={Icons.tag} size={20} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p className="max-w-[var(--auth-copy-width)] type-16 text-[var(--content-muted)]">Select a tag to see where it is used.</p>
        </div>
      )}
    </section>
  );
}