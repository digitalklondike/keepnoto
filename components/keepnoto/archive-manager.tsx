"use client";

import * as React from "react";

import { LinkCard } from "@/components/keepnoto/link-card";
import { Button, Icon, Icons, LinkPreviewCard } from "@/components/keepnoto/product-components";

const ARCHIVE_RETENTION_DAYS = 7;
const DAY_IN_MILLISECONDS = 86_400_000;

export type ArchivedLinkSummary = {
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
  tags: string[];
  logoColor: string;
  archivedAt: string;
};

function daysUntilDeletion(archivedAt: string) {
  const deletionTime = new Date(archivedAt).getTime() + ARCHIVE_RETENTION_DAYS * DAY_IN_MILLISECONDS;
  return Math.max(0, Math.ceil((deletionTime - Date.now()) / DAY_IN_MILLISECONDS));
}

function deletionLabel(archivedAt: string) {
  const days = daysUntilDeletion(archivedAt);

  if (days <= 1) {
    return "Deletes within a day";
  }

  return `Deletes in ${days} days`;
}


type ArchivePanelProps = {
  links: ArchivedLinkSummary[];
  totalCount: number;
  selectedLinkId?: string;
  loading?: boolean;
  onSelectLink: (linkId: string) => void;
};

export function ArchivePanel({ links, totalCount, selectedLinkId, loading = false, onSelectLink }: ArchivePanelProps) {
  return (
    <section aria-busy={loading || undefined} className="flex h-full min-h-0 w-[var(--search-width)] shrink-0 flex-col rounded-[var(--radius-32)] bg-[var(--panel-surface)] px-[var(--space-24)] pb-[var(--space-12)] pt-[var(--space-32)] backdrop-blur-[var(--blur-soft)]">
      <div className="flex min-h-[var(--size-32)] items-baseline gap-[var(--space-8)]">
        <h1 className="type-title text-[var(--content-primary)]">Archive</h1>
        {loading ? (
          <span aria-hidden="true" className="h-[var(--space-16)] w-[var(--space-48)] animate-pulse rounded-full bg-[var(--skeleton-muted)]" />
        ) : (
          <span className="type-16 text-[var(--content-muted)]">{totalCount} {totalCount === 1 ? "link" : "links"}</span>
        )}
      </div>
      <div className="mt-[var(--space-24)] min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="library-card-stack" aria-label="Loading archived links">
            {[0, 1, 2].map((item) => <LinkCard key={item} title="" source="" visualState="loading" />)}
          </div>
        ) : links.length > 0 ? (
          <div className="library-card-stack">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                title={link.title}
                source={link.domain}
                description={link.savedReason ?? link.description}
                tags={link.tags}
                savedAt={deletionLabel(link.archivedAt)}
                faviconSrc={link.faviconSrc}
                faviconFallback={link.domain}
                faviconColor={link.logoColor}
                visualState={link.id === selectedLinkId ? "active" : "default"}
                onClick={() => onSelectLink(link.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectLink(link.id);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[calc(var(--size-48)*6)] flex-col items-center justify-center gap-[var(--space-16)] px-[var(--space-24)] text-center">
            <span className="flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] text-[var(--icon-muted)]">
              <Icon icon={Icons.archive} size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="flex max-w-[var(--auth-copy-width)] flex-col gap-[var(--space-8)]">
              <p className="type-16-semibold text-[var(--content-primary)]">Archive is empty</p>
              <p className="type-16 text-[var(--content-muted)]">Deleted links stay here for 7 days before they are removed permanently.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type ArchiveDetailPanelProps = {
  link?: ArchivedLinkSummary;
  loading?: boolean;
  actionPending?: boolean;
  error?: string | null;
  onRestore: (linkId: string) => void;
  onDeletePermanently: (linkId: string) => void;
};

export function ArchiveDetailPanel({ link, loading = false, actionPending = false, error, onRestore, onDeletePermanently }: ArchiveDetailPanelProps) {
  return (
    <section aria-busy={loading || undefined} className="w-[var(--layout-detail-width)] min-w-[var(--layout-detail-min-width)] max-w-[var(--layout-detail-max-width)] self-start rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)] backdrop-blur-[var(--blur-soft)]">
      {loading ? (
        <div className="flex min-h-[calc(var(--size-48)*6)] flex-col gap-[var(--space-24)]">
          <span className="h-[var(--skeleton-line-height)] w-3/5 animate-pulse rounded-full bg-[var(--skeleton-muted)]" />
          <span className="h-[var(--preview-card-height)] w-full animate-pulse rounded-[var(--radius-24)] bg-[var(--skeleton-muted-soft)]" />
          <span className="h-[var(--size-48)] w-full animate-pulse rounded-[var(--radius-round)] bg-[var(--skeleton-muted-soft)]" />
        </div>
      ) : link ? (
        <div className="flex w-full flex-col gap-[var(--space-24)]">
          <h2 className="truncate type-title text-[var(--content-primary)]">{link.title}</h2>

          <LinkPreviewCard
            title={link.previewTitle}
            description={link.previewDescription}
            url={link.domain}
            previewImageSrc={link.metadataImageSrc}
            previewImageAlt={`${link.previewTitle} preview`}
            logoSrc={link.previewLogoSrc ?? link.faviconSrc}
            logoAlt={`${link.source} logo`}
            logoFallback={link.source}
            logoColor={link.logoColor}
            externalHref={link.href}
          />

          <div className="grid grid-cols-2 gap-[var(--space-24)]">
            <div className="flex min-w-0 flex-col gap-[var(--space-8)]">
              <p className="type-label text-[var(--content-muted)]">Source</p>
              <span className="flex h-[var(--size-24)] min-w-0 items-center gap-[var(--space-8)] type-16 text-[var(--content-primary)]">
                <Icon icon={Icons.globe} size={20} strokeWidth={1.8} className="shrink-0 text-[var(--content-muted)]" />
                <span className="truncate">{link.source}</span>
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-[var(--space-8)]">
              <p className="type-label text-[var(--content-muted)]">Automatic deletion</p>
              <span className="flex h-[var(--size-24)] min-w-0 items-center gap-[var(--space-8)] type-16 text-[var(--content-primary)]">
                <Icon icon={Icons.calendar} size={20} strokeWidth={1.8} className="shrink-0 text-[var(--content-muted)]" />
                <span className="truncate">{deletionLabel(link.archivedAt)}</span>
              </span>
            </div>
          </div>

          {error ? <p aria-live="polite" className="type-12 text-[var(--danger)]">{error}</p> : null}
          <div aria-hidden="true" className="h-px w-full bg-[var(--divider-subtle)]" />
          <div className="flex h-[var(--size-48)] gap-[var(--space-8)]">
            <Button className="h-[var(--size-48)] flex-1" disabled={actionPending} onClick={() => onDeletePermanently(link.id)} tone="secondaryDanger" type="button">Delete now</Button>
            <Button className="h-[var(--size-48)] flex-1" disabled={actionPending} onClick={() => onRestore(link.id)} tone="primary" type="button">
              <Icon icon={Icons.restore} size={20} strokeWidth={1.8} aria-hidden="true" />
              Restore
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(var(--size-48)*5)] flex-col items-center justify-center gap-[var(--space-16)] px-[var(--space-32)] text-center">
          <span className="flex size-[var(--size-48)] items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] text-[var(--icon-muted)]">
            <Icon icon={Icons.archive} size={20} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p className="max-w-[var(--auth-copy-width)] type-16 text-[var(--content-muted)]">Select an archived link to restore it or delete it now.</p>
        </div>
      )}
    </section>
  );
}
