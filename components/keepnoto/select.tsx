"use client";

import * as React from "react";
import type { IconSvgElement } from "@hugeicons/react";

import {
  Select as BaseSelect,
  SelectContent as BaseSelectContent,
  SelectGroup as BaseSelectGroup,
  SelectGroupLabel as BaseSelectGroupLabel,
  SelectItem as BaseSelectItem,
  SelectItemIndicator as BaseSelectItemIndicator,
  SelectItemText as BaseSelectItemText,
  SelectList as BaseSelectList,
  SelectPositioner as BaseSelectPositioner,
  SelectSeparator as BaseSelectSeparator,
  SelectTrigger as BaseSelectTrigger,
  SelectValue as BaseSelectValue,
} from "@/components/ui/select";
import { FLOATING_COLLISION_PADDING, FLOATING_SIDE_OFFSET } from "@/components/keepnoto/design-constants";
import { Icon, Icons } from "@/components/keepnoto/product-components";
import { cn } from "@/lib/utils";

export type SelectVisualState = "default" | "hover" | "focused" | "pressed";
export type SelectTriggerProps = React.ComponentProps<typeof BaseSelectTrigger> & {
  visualState?: SelectVisualState;
};

const selectTriggerClassName = cn(
  "group/select-trigger flex h-[var(--size-48)] min-w-[var(--select-min-width)] items-center justify-between gap-[var(--space-12)] rounded-[var(--radius-round)] px-[var(--space-16)] type-16 text-[var(--content-primary)] backdrop-blur-[var(--blur-soft)] transition-[background-color,box-shadow,opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "bg-[var(--panel-surface)] hover:bg-[var(--control-surface)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] active:scale-[0.99] active:bg-[var(--control-surface)]",
  "data-[state=hover]:bg-[var(--control-surface)] data-[state=focused]:ring-2 data-[state=focused]:ring-[var(--focus-ring)] data-[state=pressed]:scale-[0.99] data-[state=pressed]:bg-[var(--control-surface)] data-[state=open]:bg-[var(--control-surface)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--focus-ring)]",
  "disabled:pointer-events-none disabled:opacity-45"
);

export function SelectTrigger({ visualState = "default", className, children, ...props }: SelectTriggerProps) {
  return (
    <BaseSelectTrigger
      {...props}
      render={(triggerProps, state) => {
        const triggerState = state.open ? "open" : visualState;

        return (
          <button
            {...triggerProps}
            data-state={triggerState}
            className={cn(selectTriggerClassName, triggerProps.className, className)}
          >
            <span className="min-w-0 flex-1 truncate text-left">{children}</span>
            <Icon
              icon={Icons.chevronDown}
              size={20}
              strokeWidth={1.8}
              className={cn("shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]", state.open && "rotate-180")}
            />
          </button>
        );
      }}
    />
  );
}

export type SelectValueProps = React.ComponentProps<typeof BaseSelectValue>;

export function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <BaseSelectValue
      {...props}
      className={cn(
        "block min-w-0 truncate text-[var(--content-primary)] data-[placeholder]:text-[var(--content-muted)]",
        className
      )}
    />
  );
}

export type SelectContentProps = React.ComponentProps<typeof BaseSelectContent> &
  Pick<
    React.ComponentProps<typeof BaseSelectPositioner>,
    "align" | "alignOffset" | "side" | "sideOffset" | "collisionAvoidance" | "collisionPadding" | "collisionBoundary"
  > & {
    contentClassName?: string;
  };

export function SelectContent({
  children,
  className,
  contentClassName,
  align = "start",
  side = "bottom",
  sideOffset = FLOATING_SIDE_OFFSET,
  collisionAvoidance = { side: "flip", align: "flip", fallbackAxisSide: "none" },
  collisionPadding = FLOATING_COLLISION_PADDING,
  collisionBoundary,
  ...props
}: SelectContentProps) {
  return (
    <BaseSelectPositioner
      align={align}
      side={side}
      sideOffset={sideOffset}
      collisionAvoidance={collisionAvoidance}
      collisionPadding={collisionPadding}
      collisionBoundary={collisionBoundary}
    >
      <BaseSelectContent
        {...props}
        className={cn(
          "w-(--anchor-width) min-w-[var(--dropdown-width)] origin-(--transform-origin) rounded-[var(--radius-20)] !border-0 bg-[var(--popover-surface)] p-[var(--space-8)] text-[var(--content-primary)] !shadow-[var(--shadow-panel)] !ring-0 backdrop-blur-[var(--blur-panel)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
          contentClassName,
          className
        )}
      >
        <BaseSelectList className="flex flex-col gap-[var(--space-4)]">{children}</BaseSelectList>
      </BaseSelectContent>
    </BaseSelectPositioner>
  );
}

export type SelectItemVisualState = "default" | "hover" | "active" | "pressed" | "selected";
export type SelectItemRenderAs = "option" | "div";
export type SelectItemProps = React.ComponentProps<typeof BaseSelectItem> & {
  icon?: IconSvgElement;
  endLabel?: string;
  visualState?: SelectItemVisualState;
  renderAs?: SelectItemRenderAs;
};

const selectItemClassName = cn(
  "group/select-item flex h-[var(--size-48)] w-full cursor-pointer items-center gap-[var(--space-8)] rounded-[var(--radius-12)] px-[var(--space-12)] type-16 outline-none transition-[background-color,color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "!text-[var(--content-primary)] data-highlighted:!text-[var(--content-primary)] data-[selected]:!text-[var(--content-primary)] data-highlighted:[&_*]:!text-inherit",
  "hover:bg-[var(--state-hover)] data-highlighted:bg-[var(--state-hover)] data-[visual-state=hover]:bg-[var(--state-hover)] data-[visual-state=active]:bg-[var(--state-hover)] data-[selected]:bg-[var(--state-hover)]",
  "active:bg-[var(--state-pressed)] data-[visual-state=pressed]:bg-[var(--state-pressed)]",
  "data-disabled:pointer-events-none data-disabled:opacity-45"
);

export function SelectItem({
  icon,
  endLabel,
  visualState = "default",
  renderAs = "option",
  className,
  children,
  ...props
}: SelectItemProps) {
  const itemClassName = cn(selectItemClassName, className);

  if (renderAs === "div") {
    const { disabled, ...divProps } = props as React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean };
    const highlighted = visualState === "hover" || visualState === "active";

    return (
      <div
        {...divProps}
        role="option"
        aria-disabled={disabled || undefined}
        aria-selected={visualState === "selected" || undefined}
        data-disabled={disabled ? "" : undefined}
        data-highlighted={highlighted ? "" : undefined}
        data-selected={visualState === "selected" ? "" : undefined}
        data-visual-state={visualState}
        className={itemClassName}
      >
        {icon ? <Icon icon={icon} size={16} strokeWidth={1.8} className="!text-current" /> : null}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {endLabel ? <span className="shrink-0 type-12 !text-[var(--content-muted)]">{endLabel}</span> : null}
        {visualState === "selected" ? (
          <span className="ml-auto flex size-[var(--size-24)] shrink-0 items-center justify-center text-[var(--accent-start)]">
            <Icon icon={Icons.check} size={16} strokeWidth={2} />
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <BaseSelectItem {...props} data-visual-state={visualState} className={itemClassName}>
      {icon ? <Icon icon={icon} size={16} strokeWidth={1.8} className="!text-current" /> : null}
      <BaseSelectItemText className="min-w-0 flex-1 truncate">{children}</BaseSelectItemText>
      {endLabel ? <span className="shrink-0 type-12 !text-[var(--content-muted)]">{endLabel}</span> : null}
      <BaseSelectItemIndicator className="ml-auto flex size-[var(--size-24)] shrink-0 items-center justify-center text-[var(--accent-start)]">
        <Icon icon={Icons.check} size={16} strokeWidth={2} />
      </BaseSelectItemIndicator>
    </BaseSelectItem>
  );
}

export function SelectGroup(props: React.ComponentProps<typeof BaseSelectGroup>) {
  return <BaseSelectGroup {...props} />;
}

export function SelectGroupLabel({ className, ...props }: React.ComponentProps<typeof BaseSelectGroupLabel>) {
  return (
    <BaseSelectGroupLabel
      {...props}
      className={cn("px-[var(--space-12)] py-[var(--space-8)] type-12-semibold text-[var(--content-muted)]", className)}
    />
  );
}

export function SelectSeparator({ className, ...props }: React.ComponentProps<typeof BaseSelectSeparator>) {
  return (
    <BaseSelectSeparator
      {...props}
      className={cn("my-[var(--space-8)] h-px bg-[var(--divider-subtle)]", className)}
    />
  );
}

export const SelectRoot = BaseSelect;
export const Select = Object.assign(BaseSelect, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
  Separator: SelectSeparator,
});

