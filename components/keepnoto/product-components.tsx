/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Archive01Icon,
  Bookmark02Icon,
  Calendar03Icon,
  Delete02Icon,
  Edit02Icon,
  ExternalLinkIcon,
  FileImageIcon,
  Folder01Icon,
  Globe02Icon,
  Link01Icon,
  Moon02Icon,
  Search01Icon,
  Sun03Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KntVisualState = "default" | "hover" | "pressed" | "selected";

export type KntIconName = IconSvgElement;

function KntIcon({
  icon,
  className,
  size = 18,
}: {
  icon: IconSvgElement;
  className?: string;
  size?: number;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={1.5}
      className={className}
    />
  );
}

export type KntSidebarItemProps = {
  icon: IconSvgElement;
  label: string;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  className?: string;
};

export function KntSidebarItem({
  icon,
  label,
  active,
  disabled,
  href,
  className,
}: KntSidebarItemProps) {
  const content = (
    <>
      <KntIcon icon={icon} size={19} />
      <span className="pointer-events-none absolute left-[calc(100%+var(--spacing-2))] top-1/2 z-10 -translate-y-1/2 rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-soft ring-1 ring-border transition-opacity group-hover/sidebar-item:opacity-100 group-focus-visible/sidebar-item:opacity-100">
        {label}
      </span>
    </>
  );

  const sharedClassName = cn(
    "group/sidebar-item relative text-muted-foreground",
    "hover:bg-secondary hover:text-secondary-foreground",
    "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-soft",
    className
  );

  if (href && !disabled) {
    return (
      <a
        aria-label={label}
        aria-current={active ? "page" : undefined}
        data-active={active ? "true" : undefined}
        href={href}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px",
          sharedClassName
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <Button
      aria-label={label}
      aria-pressed={active || undefined}
      data-active={active ? "true" : undefined}
      disabled={disabled}
      variant="ghost"
      size="icon-lg"
      className={sharedClassName}
    >
      {content}
    </Button>
  );
}

export type KntSidebarProps = {
  items: KntSidebarItemProps[];
  activeLabel?: string;
  className?: string;
};

export function KntSidebar({ items, activeLabel, className }: KntSidebarProps) {
  return (
    <aside
      aria-label="Keepnoto navigation"
      className={cn(
        "flex w-14 flex-col items-center gap-2 rounded-2xl bg-sidebar px-2 py-3 text-sidebar-foreground shadow-card ring-1 ring-sidebar-border",
        className
      )}
    >
      <div className="mb-1 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <KntIcon icon={BookmarkIcon} size={18} />
      </div>
      <nav className="flex flex-col items-center gap-1">
        {items.map((item) => (
          <KntSidebarItem
            key={item.label}
            {...item}
            active={item.active ?? item.label === activeLabel}
          />
        ))}
      </nav>
    </aside>
  );
}

export type KntTopSearchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  action?: React.ReactNode;
  state?: KntVisualState;
  className?: string;
  inputClassName?: string;
};

export function KntTopSearch({ action, state = "default", className, inputClassName, ...props }: KntTopSearchProps) {
  return (
    <label
      data-state={state}
      className={cn(
        "flex h-11 w-full max-w-xl items-center gap-3 rounded-xl bg-card px-3 text-foreground shadow-soft ring-1 ring-border transition-all",
        "focus-within:ring-3 focus-within:ring-ring/35",
        "data-[state=hover]:bg-surface-raised data-[state=hover]:shadow-card",
        "data-[state=pressed]:translate-y-px data-[state=pressed]:ring-ring",
        className
      )}
    >
      <KntIcon icon={Search01Icon} className="text-muted-foreground" />
      <span className="sr-only">Search saved links</span>
      <input
        {...props}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          inputClassName
        )}
      />
      {action}
    </label>
  );
}

export type KntThemeToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  theme?: "light" | "dark";
  pressed?: boolean;
};

export function KntThemeToggle({ theme = "light", pressed, className, ...props }: KntThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <Button
      {...props}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={pressed ?? isDark}
      data-pressed={pressed ? "true" : undefined}
      variant="outline"
      size="icon-lg"
      className={cn(
        "bg-card text-muted-foreground shadow-soft hover:text-foreground data-[pressed=true]:bg-primary data-[pressed=true]:text-primary-foreground",
        className
      )}
    >
      <KntIcon icon={isDark ? Moon02Icon : Sun03Icon} size={18} />
    </Button>
  );
}

export type KntTagTab = {
  label: string;
  count?: number;
  disabled?: boolean;
};

export type KntTagTabsProps = {
  tabs: KntTagTab[];
  activeLabel?: string;
  className?: string;
};

export function KntTagTabs({ tabs, activeLabel, className }: KntTagTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Saved link filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.label === activeLabel;
        return (
          <Button
            key={tab.label}
            role="tab"
            aria-selected={selected}
            disabled={tab.disabled}
            data-selected={selected ? "true" : undefined}
            variant={selected ? "default" : "secondary"}
            size="sm"
            className="rounded-4xl data-[selected=true]:shadow-soft"
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? (
              <span className="text-xs opacity-75">{tab.count}</span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}

export type KntLinkLogoProps = {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function KntLinkLogo({ src, alt = "", fallback, size = "md", className }: KntLinkLogoProps) {
  const sizeClassName = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary font-semibold text-secondary-foreground ring-1 ring-border",
        sizeClassName,
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{fallback.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}

export type KntLinkPreviewCardProps = {
  title: string;
  domain: string;
  imageSrc?: string;
  fallbackLabel?: string;
  className?: string;
};

export function KntLinkPreviewCard({
  title,
  domain,
  imageSrc,
  fallbackLabel = "Link preview",
  className,
}: KntLinkPreviewCardProps) {
  return (
    <Card className={cn("gap-0 bg-surface-raised shadow-soft", className)}>
      <div className="aspect-[16/9] overflow-hidden bg-surface-warm">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <KntIcon icon={FileImageIcon} size={22} />
            <span className="text-xs font-medium">{fallbackLabel}</span>
          </div>
        )}
      </div>
      <CardHeader className="gap-1">
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <KntIcon icon={Globe02Icon} size={14} />
          {domain}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export type KntMetadataGridProps = {
  source: string;
  savedDate: string;
  createdDate?: string;
  type: string;
  tags?: string[];
  className?: string;
};

export function KntMetadataGrid({
  source,
  savedDate,
  createdDate,
  type,
  tags = [],
  className,
}: KntMetadataGridProps) {
  const items = [
    { label: "Source", value: source, icon: Globe02Icon },
    { label: "Saved", value: savedDate, icon: Calendar03Icon },
    { label: "Created", value: createdDate ?? "Unknown", icon: Archive01Icon },
    { label: "Type", value: type, icon: Link01Icon },
  ];

  return (
    <div className={cn("grid gap-3 rounded-xl bg-surface p-3 ring-1 ring-border", className)}>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2 rounded-lg bg-card p-3 shadow-soft">
            <KntIcon icon={item.icon} size={16} className="mt-0.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <p className="truncate text-sm font-medium text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              <KntIcon icon={Tag01Icon} size={12} />
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type KntDetailActionsProps = {
  disabled?: boolean;
  className?: string;
};

export function KntDetailActions({ disabled, className }: KntDetailActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button disabled={disabled} variant="outline" size="sm">
        <KntIcon icon={Edit02Icon} size={15} />
        Edit
      </Button>
      <Button disabled={disabled} variant="destructive" size="sm">
        <KntIcon icon={Delete02Icon} size={15} />
        Delete
      </Button>
      <Button disabled={disabled} size="sm">
        <KntIcon icon={ExternalLinkIcon} size={15} />
        Open link
      </Button>
    </div>
  );
}

export type KntLinkCardProps = {
  title: string;
  domain: string;
  description?: string;
  savedReason?: string;
  logoSrc?: string;
  previewSrc?: string;
  tags?: string[];
  selected?: boolean;
  pressed?: boolean;
  state?: KntVisualState;
  className?: string;
};

export function KntLinkCard({
  title,
  domain,
  description,
  savedReason,
  logoSrc,
  previewSrc,
  tags = [],
  selected,
  pressed,
  state = "default",
  className,
}: KntLinkCardProps) {
  const visualState = selected ? "selected" : pressed ? "pressed" : state;

  return (
    <article
      data-state={visualState}
      className={cn(
        "group rounded-2xl bg-card text-card-foreground shadow-soft ring-1 ring-border transition-all",
        "hover:-translate-y-0.5 hover:bg-surface-raised hover:shadow-card",
        "data-[state=hover]:-translate-y-0.5 data-[state=hover]:bg-surface-raised data-[state=hover]:shadow-card",
        "data-[state=pressed]:translate-y-px data-[state=pressed]:shadow-soft data-[state=pressed]:ring-ring",
        "data-[state=selected]:bg-surface-raised data-[state=selected]:shadow-card data-[state=selected]:ring-primary",
        className
      )}
    >
      {previewSrc ? (
        <div className="aspect-[16/7] overflow-hidden rounded-t-2xl bg-surface-warm">
          <img src={previewSrc} alt="" className="size-full object-cover transition-transform group-hover:scale-[1.02]" />
        </div>
      ) : null}
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <KntLinkLogo src={logoSrc} fallback={domain} alt="" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-muted-foreground">{domain}</p>
            <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </h3>
          </div>
        </div>
        {description ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {savedReason ? (
          <div className="rounded-xl bg-note px-3 py-2 text-note-foreground">
            <p className="font-saved-reason text-xl leading-snug">{savedReason}</p>
          </div>
        ) : null}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export const BookmarkIcon = Bookmark02Icon;
export const KntIcons = {
  archive: Archive01Icon,
  bookmark: Bookmark02Icon,
  edit: Edit02Icon,
  external: ExternalLinkIcon,
  folder: Folder01Icon,
  link: Link01Icon,
  search: Search01Icon,
  tag: Tag01Icon,
};




