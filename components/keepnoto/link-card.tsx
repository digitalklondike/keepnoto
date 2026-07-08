"use client";

import * as React from "react";

import { Icon, Icons, LinkLogo } from "@/components/keepnoto/product-components";
import { Tooltip, useOverflowState } from "@/components/keepnoto/tooltip";
import { cn } from "@/lib/utils";

export type LinkCardVisualState = "default" | "hover" | "pressed" | "focused" | "active" | "loading";

export type LinkCardProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  title: string;
  source: string;
  url?: string;
  description?: string;
  tags?: string[];
  savedAt?: string;
  faviconSrc?: string;
  faviconAlt?: string;
  faviconFallback?: string;
  faviconColor?: string;
  visualState?: LinkCardVisualState;
  favorite?: boolean;
};

type LinkCardTagProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode;
};

function LinkCardTag({ children, className, ...props }: LinkCardTagProps) {
  const tooltipLabel = typeof children === "string" || typeof children === "number" ? String(children) : undefined;
  const { ref: labelRef, overflowing } = useOverflowState<HTMLSpanElement>(tooltipLabel);
  const tag = (
    <span
      {...props}
      className={cn(
        "inline-flex h-[var(--size-24)] min-w-0 max-w-[var(--link-card-tag-max-width)] shrink-0 items-center rounded-[var(--radius-round)] bg-[var(--tag-fill)] pl-[var(--space-12)] pr-[var(--space-12)] py-[var(--space-4)] type-12-semibold text-[var(--content-primary)]",
        className
      )}
    >
      <span ref={labelRef} className="min-w-0 truncate">{children}</span>
    </span>
  );

  return tooltipLabel && overflowing ? (
    <Tooltip label={tooltipLabel} side="top">
      {tag}
    </Tooltip>
  ) : tag;
}
function getVisibleTagCount({
  availableWidth,
  gap,
  tagWidths,
  countWidths,
}: {
  availableWidth: number;
  gap: number;
  tagWidths: number[];
  countWidths: Map<number, number>;
}) {
  if (tagWidths.length === 0 || availableWidth <= 0) {
    return 0;
  }

  const totalTagsWidth = tagWidths.reduce((sum, width) => sum + width, 0) + gap * Math.max(tagWidths.length - 1, 0);

  if (totalTagsWidth <= availableWidth) {
    return tagWidths.length;
  }

  for (let visibleCount = tagWidths.length - 1; visibleCount >= 0; visibleCount -= 1) {
    const hiddenCount = tagWidths.length - visibleCount;
    const countWidth = countWidths.get(hiddenCount) ?? 0;
    const visibleTagsWidth = tagWidths.slice(0, visibleCount).reduce((sum, width) => sum + width, 0);
    const itemCount = visibleCount + 1;
    const usedWidth = visibleTagsWidth + countWidth + gap * Math.max(itemCount - 1, 0);

    if (usedWidth <= availableWidth) {
      return visibleCount;
    }
  }

  return 0;
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block animate-pulse rounded-full bg-[var(--skeleton-muted)]",
        className
      )}
    />
  );
}

function LinkCardSkeleton({ className, ...props }: Omit<LinkCardProps, "title" | "source" | "description">) {
  return (
    <article
      {...props}
      aria-busy="true"
      data-state="loading"
      className={cn(
        "grid w-full grid-cols-[var(--link-card-logo-column)_minmax(0,1fr)] gap-x-[var(--space-16)] rounded-[var(--radius-24)] bg-transparent p-[var(--space-20)] text-[var(--content-primary)]",
        className
      )}
    >
      <span className="size-[var(--size-32)] animate-pulse rounded-[var(--radius-8)] bg-[var(--skeleton-muted)]" />
      <span className="grid min-w-0 gap-[var(--space-8)]">
        <SkeletonBar className="h-[var(--skeleton-line-height)] w-3/5" />
        <SkeletonBar className="h-[var(--skeleton-line-height-sm)] w-2/5 bg-[var(--skeleton-muted-soft)]" />
        <SkeletonBar className="mt-[var(--space-8)] h-[var(--skeleton-line-height)] w-full" />
        <SkeletonBar className="h-[var(--skeleton-line-height)] w-4/5" />
        <span className="flex gap-[var(--space-8)] pt-[var(--space-4)]">
          <SkeletonBar className="h-[var(--size-24)] w-[var(--skeleton-chip-width-sm)] bg-[var(--skeleton-muted-soft)]" />
          <SkeletonBar className="h-[var(--size-24)] w-[var(--skeleton-chip-width-md)] bg-[var(--skeleton-muted-soft)]" />
        </span>
      </span>
    </article>
  );
}

export function LinkCard({
  title,
  source,
  url,
  description = "",
  tags = [],
  savedAt,
  faviconSrc,
  faviconAlt,
  faviconFallback,
  faviconColor,
  visualState = "default",
  favorite,
  className,
  ...props
}: LinkCardProps) {
  const tagListRef = React.useRef<HTMLSpanElement>(null);
  const tagMeasureRef = React.useRef<HTMLSpanElement>(null);
  const [visibleTagCount, setVisibleTagCount] = React.useState(tags.length);

  React.useLayoutEffect(() => {
    const tagList = tagListRef.current;
    const tagMeasure = tagMeasureRef.current;

    if (!tagList || !tagMeasure) {
      return;
    }

    const updateVisibleTags = () => {
      const styles = window.getComputedStyle(tagList);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      const tagWidths = Array.from(tagMeasure.querySelectorAll<HTMLElement>("[data-measure-tag]")).map(
        (element) => element.offsetWidth
      );
      const countWidths = new Map(
        Array.from(tagMeasure.querySelectorAll<HTMLElement>("[data-measure-count]")).map((element) => [
          Number(element.dataset.measureCount),
          element.offsetWidth,
        ])
      );
      const nextVisibleTagCount = getVisibleTagCount({
        availableWidth: tagList.clientWidth,
        gap,
        tagWidths,
        countWidths,
      });

      setVisibleTagCount((current) => (current === nextVisibleTagCount ? current : nextVisibleTagCount));
    };

    updateVisibleTags();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateVisibleTags);
      return () => window.removeEventListener("resize", updateVisibleTags);
    }

    const resizeObserver = new ResizeObserver(updateVisibleTags);
    resizeObserver.observe(tagList);

    return () => resizeObserver.disconnect();
  }, [tags]);

  if (visualState === "loading") {
    return <LinkCardSkeleton className={className} {...props} />;
  }

  const logoFallback = faviconFallback ?? title;
  const trimmedDescription = description.trim();
  const hasFooter = tags.length > 0 || Boolean(savedAt);
  const hiddenTagCount = Math.max(tags.length - visibleTagCount, 0);
  const visibleTags = tags.slice(0, visibleTagCount);
  const cardClassName = cn(
    "link-card-shell group/link-card relative grid w-full grid-cols-[var(--link-card-logo-column)_minmax(0,1fr)] items-start gap-x-[var(--space-16)] rounded-[var(--radius-24)] p-[var(--space-20)] text-[var(--content-primary)] outline-none transition-[background-color,box-shadow,transform] duration-150 ease-out",
    "bg-transparent",
    "hover:bg-[var(--panel-surface)] active:scale-[0.995] active:bg-[var(--control-surface)]",
    "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-strong)]",
    "data-[state=hover]:bg-[var(--panel-surface)]",
    "data-[state=pressed]:scale-[0.995] data-[state=pressed]:bg-[var(--control-surface)]",
    "data-[state=focused]:ring-2 data-[state=focused]:ring-[var(--focus-ring-strong)]",
    className
  );

  return (
    <article
      {...props}
      tabIndex={props.tabIndex ?? 0}
      data-state={visualState}
      aria-current={visualState === "active" ? "true" : undefined}
      className={cardClassName}
    >
      {favorite ? (
        <span aria-hidden="true" className="favorite-icon-filled pointer-events-none absolute right-[var(--space-24)] top-[var(--space-20)] z-10 inline-flex size-[var(--space-20)] items-center justify-center text-[var(--favorite-accent)]">
          <Icon icon={Icons.bookmark} size={20} strokeWidth={2} />
        </span>
      ) : null}
      <LinkLogo
        src={faviconSrc}
        alt={faviconAlt ?? ""}
        fallback={logoFallback}
        color={faviconColor}
        size="sm"
      />
      <span className="min-w-0">
        <span className="block min-w-0">
          <span className="block truncate type-16-semibold text-[var(--content-primary)]">{title}</span>
          <span className="block truncate type-12 text-[var(--content-muted)]">{url ?? source}</span>
        </span>
        {trimmedDescription ? (
          <span className="mt-[var(--space-12)] flex min-w-0 items-start gap-[var(--space-8)] rounded-[var(--radius-16)] border border-[var(--saved-reason-border)] bg-[var(--saved-reason-surface)] px-[var(--space-12)] py-[var(--space-8)] text-[var(--saved-reason-ink)]">
            <span aria-hidden="true" className="shrink-0 font-sans type-16-semibold text-[var(--saved-reason-mark)]">
              &ldquo;
            </span>
            <span className="line-clamp-2 min-w-0 overflow-hidden font-handwritten type-16 text-[var(--saved-reason-ink)] [text-wrap:pretty]">
              {trimmedDescription}
            </span>
          </span>
        ) : null}
        {hasFooter ? (
          <span className={cn("flex min-w-0 items-center gap-[var(--space-8)]", trimmedDescription ? "mt-[var(--space-8)]" : "mt-[var(--space-16)]")}>
            <span ref={tagListRef} className="relative flex min-w-0 flex-1 items-center gap-[var(--space-8)] overflow-hidden">
              {visibleTags.map((tag) => (
                <LinkCardTag key={tag}>{tag}</LinkCardTag>
              ))}
              {hiddenTagCount > 0 ? (
                <LinkCardTag aria-label={`${hiddenTagCount} more tags`}>+{hiddenTagCount}</LinkCardTag>
              ) : null}
              <span
                ref={tagMeasureRef}
                aria-hidden="true"
                className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-[var(--space-8)] whitespace-nowrap"
              >
                {tags.map((tag) => (
                  <LinkCardTag key={`measure-${tag}`} data-measure-tag>
                    {tag}
                  </LinkCardTag>
                ))}
                {tags.map((_, index) => {
                  const hiddenCount = index + 1;

                  return (
                    <LinkCardTag key={`measure-count-${hiddenCount}`} data-measure-count={hiddenCount}>
                      +{hiddenCount}
                    </LinkCardTag>
                  );
                })}
              </span>
            </span>
            {savedAt ? <span className="shrink-0 type-12 text-[var(--content-muted)]">{savedAt}</span> : null}
          </span>
        ) : null}
      </span>
    </article>
  );
}
