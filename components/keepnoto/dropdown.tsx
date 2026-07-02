"use client";

import * as React from "react";
import type { IconSvgElement } from "@hugeicons/react";

import {
  DropdownMenu as BaseDropdownMenu,
  DropdownMenuContent as BaseDropdownMenuContent,
  DropdownMenuItem as BaseDropdownMenuItem,
  DropdownMenuSeparator as BaseDropdownMenuSeparator,
  DropdownMenuTrigger as BaseDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/keepnoto/product-components";
import { cn } from "@/lib/utils";

export type DropdownMenuItemTone = "default" | "danger";
export type DropdownMenuItemVisualState = "default" | "hover" | "active" | "pressed";
export type DropdownMenuItemRenderAs = "menuitem" | "div";

export type DropdownMenuItemProps = React.ComponentProps<typeof BaseDropdownMenuItem> & {
  icon?: IconSvgElement;
  endLabel?: string;
  shortcut?: string;
  tone?: DropdownMenuItemTone;
  visualState?: DropdownMenuItemVisualState;
  renderAs?: DropdownMenuItemRenderAs;
};

const dropdownMenuItemToneClassName: Record<DropdownMenuItemTone, string> = {
  default: cn(
    "!text-[var(--content-primary)] focus:!text-[var(--content-primary)] data-highlighted:!text-[var(--content-primary)] focus:[&_*]:!text-inherit data-highlighted:[&_*]:!text-inherit",
    "hover:bg-[var(--state-hover)] focus:bg-[var(--state-hover)] data-highlighted:bg-[var(--state-hover)]",
    "data-[visual-state=hover]:bg-[var(--state-hover)] data-[visual-state=active]:bg-[var(--state-hover)]",
    "active:bg-[var(--state-pressed)] data-[visual-state=pressed]:bg-[var(--state-pressed)]"
  ),
  danger: cn(
    "!text-[var(--danger-dropdown)] focus:!text-[var(--danger-dropdown)] data-highlighted:!text-[var(--danger-dropdown)] focus:[&_*]:!text-inherit data-highlighted:[&_*]:!text-inherit",
    "hover:bg-[var(--state-danger-hover)] focus:bg-[var(--state-danger-hover)] data-highlighted:bg-[var(--state-danger-hover)]",
    "data-[visual-state=hover]:bg-[var(--state-danger-hover)] data-[visual-state=active]:bg-[var(--state-danger-hover)]",
    "active:bg-[var(--state-danger-pressed)] data-[visual-state=pressed]:bg-[var(--state-danger-pressed)]"
  ),
};

const dropdownMenuItemClassName = cn(
  "flex h-[var(--size-48)] w-full cursor-pointer items-center gap-[var(--space-8)] rounded-[var(--radius-12)] px-[var(--space-12)] type-16 outline-none transition-[background-color,color,opacity] duration-150",
  "data-disabled:pointer-events-none data-disabled:opacity-45"
);

export function DropdownMenuItem({
  icon,
  endLabel,
  shortcut,
  tone = "default",
  visualState = "default",
  renderAs = "menuitem",
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  const rightLabel = endLabel ?? shortcut;
  const content = (
    <>
      {icon ? <Icon icon={icon} size={16} strokeWidth={1.8} className="!text-current" /> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {rightLabel ? (
        <span className="shrink-0 type-12 !text-[var(--content-muted)] group-focus/dropdown-menu-item:!text-[var(--content-muted)] group-data-highlighted/dropdown-menu-item:!text-[var(--content-muted)]">
          {rightLabel}
        </span>
      ) : null}
    </>
  );
  const itemClassName = cn(dropdownMenuItemClassName, dropdownMenuItemToneClassName[tone], className);

  if (renderAs === "div") {
    const { disabled, ...divProps } = props as React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean };
    const highlighted = visualState === "hover" || visualState === "active";

    return (
      <div
        {...divProps}
        role="menuitem"
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? "" : undefined}
        data-highlighted={highlighted ? "" : undefined}
        data-visual-state={visualState}
        className={itemClassName}
      >
        {content}
      </div>
    );
  }

  return (
    <BaseDropdownMenuItem
      {...props}
      variant={tone === "danger" ? "destructive" : "default"}
      data-visual-state={visualState}
      className={itemClassName}
    >
      {content}
    </BaseDropdownMenuItem>
  );
}

export type DropdownMenuContentProps = React.ComponentProps<typeof BaseDropdownMenuContent> & {
  contentClassName?: string;
};

export function DropdownMenuContent({ className, contentClassName, ...props }: DropdownMenuContentProps) {
  return (
    <BaseDropdownMenuContent
      {...props}
      className={cn(
        "w-[var(--dropdown-width)] rounded-[var(--radius-20)] !border-0 bg-[var(--popover-surface)] p-[var(--space-8)] text-[var(--content-primary)] !shadow-[var(--shadow-panel)] !ring-0 backdrop-blur-md",
        contentClassName,
        className
      )}
    />
  );
}

export function DropdownMenuTrigger(props: React.ComponentProps<typeof BaseDropdownMenuTrigger>) {
  return <BaseDropdownMenuTrigger {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof BaseDropdownMenuSeparator>) {
  return (
    <BaseDropdownMenuSeparator
      {...props}
      className={cn("my-[var(--space-8)] h-px bg-[var(--divider-subtle)]", className)}
    />
  );
}

export type DropdownMenuProps = React.ComponentProps<typeof BaseDropdownMenu> & {
  trigger?: React.ReactElement<Record<string, unknown>>;
  children: React.ReactNode;
  align?: DropdownMenuContentProps["align"];
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  collisionAvoidance?: DropdownMenuContentProps["collisionAvoidance"];
  collisionPadding?: DropdownMenuContentProps["collisionPadding"];
  collisionBoundary?: DropdownMenuContentProps["collisionBoundary"];
  contentClassName?: string;
};

function DropdownMenuRoot({
  trigger,
  children,
  align = "end",
  side = "bottom",
  sideOffset = 8,
  collisionAvoidance = { side: "flip", align: "flip", fallbackAxisSide: "none" },
  collisionPadding = 8,
  collisionBoundary,
  contentClassName,
  open,
  onOpenChange,
  ...props
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;

  const handleOpenChange: NonNullable<React.ComponentProps<typeof BaseDropdownMenu>["onOpenChange"]> = (...args) => {
    const nextOpen = args[0] as boolean;

    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(...args);
  };

  if (!trigger) {
    return (
      <BaseDropdownMenu {...props} open={open} onOpenChange={onOpenChange}>
        {children}
      </BaseDropdownMenu>
    );
  }

  const triggerProps = trigger.props as Record<string, unknown>;
  const triggerWithState = React.cloneElement(trigger, {
    "aria-expanded": isOpen,
    ...(triggerProps.hasMenu ? { open: isOpen } : {}),
  });

  return (
    <BaseDropdownMenu {...props} open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger render={triggerWithState} />
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionAvoidance={collisionAvoidance}
        collisionPadding={collisionPadding}
        collisionBoundary={collisionBoundary}
        contentClassName={contentClassName}
      >
        {children}
      </DropdownMenuContent>
    </BaseDropdownMenu>
  );
}

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
});

export type DropdownItemTone = DropdownMenuItemTone;
export type DropdownItemVisualState = DropdownMenuItemVisualState;
export type DropdownItemRenderAs = DropdownMenuItemRenderAs;
export type DropdownItemProps = DropdownMenuItemProps;
export type DropdownProps = DropdownMenuProps;

export const DropdownItem = DropdownMenuItem;
export const DropdownSeparator = DropdownMenuSeparator;
export const Dropdown = DropdownMenu;