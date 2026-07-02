"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export type TooltipSurfaceProps = React.HTMLAttributes<HTMLDivElement>;

const tooltipSurfaceClassName = "pointer-events-none z-50 inline-flex max-w-[var(--tooltip-max-width)] items-center whitespace-normal rounded-[var(--radius-10)] bg-[var(--white)] px-[var(--space-12)] py-[var(--space-8)] type-12-semibold text-[var(--content-primary)] shadow-[var(--shadow-active)]";

type TooltipTriggerElement = React.ReactElement<{
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}>;

export function TooltipSurface({ className, children, ...props }: TooltipSurfaceProps) {
  return (
    <div {...props} className={cn(tooltipSurfaceClassName, className)}>
      {children}
    </div>
  );
}

export type TooltipProps = {
  label: React.ReactNode;
  side?: TooltipSide;
  delay?: number;
  open?: boolean;
  className?: string;
  children: TooltipTriggerElement;
};

export function Tooltip({ label, side = "top", delay = 250, open, className, children }: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const openTimerRef = React.useRef<number | null>(null);
  const isControlled = open !== undefined;
  const tooltipOpen = open ?? internalOpen;

  const clearOpenTimer = React.useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const showTooltip = React.useCallback(() => {
    if (isControlled) {
      return;
    }

    clearOpenTimer();
    openTimerRef.current = window.setTimeout(() => {
      setInternalOpen(true);
      openTimerRef.current = null;
    }, delay);
  }, [clearOpenTimer, delay, isControlled]);

  const hideTooltip = React.useCallback(() => {
    if (isControlled) {
      return;
    }

    clearOpenTimer();
    setInternalOpen(false);
  }, [clearOpenTimer, isControlled]);

  React.useEffect(() => clearOpenTimer, [clearOpenTimer]);

  const trigger = React.cloneElement(children, {
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      children.props.onPointerEnter?.(event);
      showTooltip();
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      children.props.onPointerLeave?.(event);
      hideTooltip();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(event);
      showTooltip();
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(event);
      hideTooltip();
    },
  });

  return (
    <BaseTooltip.Root open={tooltipOpen}>
      <BaseTooltip.Trigger render={trigger} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={8}
          collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "none" }}
          collisionPadding={8}
        >
          <BaseTooltip.Popup
            className={cn(
              tooltipSurfaceClassName,
              "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity",
              className
            )}
          >
            {label}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
