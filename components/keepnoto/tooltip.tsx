"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import {
  FLOATING_COLLISION_PADDING,
  FLOATING_SIDE_OFFSET,
  TOOLTIP_DELAY_MS,
  TOOLTIP_INTERACTIVE_CLOSE_DELAY_MS,
} from "@/components/keepnoto/design-constants";

import { cn } from "@/lib/utils";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export type TooltipSurfaceProps = React.HTMLAttributes<HTMLDivElement>;

const tooltipSurfaceClassName =
  "z-50 inline-flex max-w-[var(--tooltip-max-width)] items-center whitespace-normal rounded-[var(--radius-10)] bg-[var(--white)] px-[var(--space-12)] py-[var(--space-8)] type-12-semibold text-[var(--content-primary)] shadow-[var(--shadow-active)]";

export function useOverflowState<TElement extends HTMLElement>(watchValue?: unknown) {
  const ref = React.useRef<TElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);

  const updateOverflowState = React.useCallback(() => {
    const element = ref.current;

    if (!element) {
      setOverflowing(false);
      return;
    }

    setOverflowing(element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);
  }, []);

  React.useLayoutEffect(() => {
    updateOverflowState();

    const element = ref.current;

    if (!element) {
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateOverflowState);
      return () => window.removeEventListener("resize", updateOverflowState);
    }

    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [updateOverflowState, watchValue]);

  return { ref, overflowing };
}
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
  interactive?: boolean;
  className?: string;
  children: TooltipTriggerElement;
};

export function Tooltip({ label, side = "top", delay = TOOLTIP_DELAY_MS, open, interactive = false, className, children }: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const openTimerRef = React.useRef<number | null>(null);
  const closeTimerRef = React.useRef<number | null>(null);
  const isControlled = open !== undefined;
  const tooltipOpen = open ?? internalOpen;

  const clearOpenTimer = React.useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const showTooltip = React.useCallback(() => {
    if (isControlled) {
      return;
    }

    clearOpenTimer();
    clearCloseTimer();
    openTimerRef.current = window.setTimeout(() => {
      setInternalOpen(true);
      openTimerRef.current = null;
    }, delay);
  }, [clearCloseTimer, clearOpenTimer, delay, isControlled]);

  const hideTooltip = React.useCallback(() => {
    if (isControlled) {
      return;
    }

    clearOpenTimer();
    clearCloseTimer();

    if (!interactive) {
      setInternalOpen(false);
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      setInternalOpen(false);
      closeTimerRef.current = null;
    }, TOOLTIP_INTERACTIVE_CLOSE_DELAY_MS);
  }, [clearCloseTimer, clearOpenTimer, interactive, isControlled]);

  React.useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
    },
    [clearCloseTimer, clearOpenTimer]
  );

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
          sideOffset={FLOATING_SIDE_OFFSET}
          collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "none" }}
          collisionPadding={FLOATING_COLLISION_PADDING}
        >
          <BaseTooltip.Popup
            className={cn(
              tooltipSurfaceClassName,
              interactive ? "pointer-events-auto" : "pointer-events-none",
              "origin-(--transform-origin) transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
              className
            )}
            onPointerEnter={interactive ? showTooltip : undefined}
            onPointerLeave={interactive ? hideTooltip : undefined}
          >
            {label}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}