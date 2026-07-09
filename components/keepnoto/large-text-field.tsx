"use client";

import * as React from "react";

import { SAVED_REASON_INPUT_MAX_LENGTH } from "@/components/keepnoto/design-constants";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type LargeTextFieldVisualState = "default" | "hover" | "focused" | "pressed";

export type LargeTextFieldProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "maxLength"> & {
  className?: string;
  maxLength?: number;
  textareaClassName?: string;
  visualState?: LargeTextFieldVisualState;
};

export const LargeTextField = React.forwardRef<HTMLTextAreaElement, LargeTextFieldProps>(function LargeTextField({
  className,
  defaultValue,
  disabled,
  maxLength = SAVED_REASON_INPUT_MAX_LENGTH,
  onChange,
  onScroll,
  textareaClassName,
  value,
  visualState = "default",
  ...props
}, ref) {
  const isControlled = value !== undefined;
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const scrollbarTrackRef = React.useRef<HTMLDivElement | null>(null);
  const scrollbarPointerIdRef = React.useRef<number | null>(null);
  const [internalValue, setInternalValue] = React.useState(() => String(defaultValue ?? ""));
  const [scrollbarState, setScrollbarState] = React.useState({
    thumbHeight: 0,
    thumbTop: 0,
    visible: false,
  });
  const currentValue = String(isControlled ? value ?? "" : internalValue);
  const accessibleLabel = props["aria-label"] ?? "Long text field";

  const setTextareaRef = React.useCallback((node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;

    if (typeof ref === "function") {
      ref(node);
      return;
    }

    if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const updateScrollbar = React.useCallback(() => {
    const textarea = textareaRef.current;
    const track = scrollbarTrackRef.current;

    if (!textarea || !track) {
      return;
    }

    const maxScrollTop = textarea.scrollHeight - textarea.clientHeight;

    if (maxScrollTop <= 1) {
      setScrollbarState({ thumbHeight: 0, thumbTop: 0, visible: false });
      return;
    }

    const trackHeight = track.clientHeight;
    const thumbHeight = Math.max(24, Math.round((textarea.clientHeight / textarea.scrollHeight) * trackHeight));
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = Math.round((textarea.scrollTop / maxScrollTop) * maxThumbTop);

    setScrollbarState({ thumbHeight, thumbTop, visible: true });
  }, []);

  const scrollToPointer = React.useCallback((clientY: number) => {
    const textarea = textareaRef.current;
    const track = scrollbarTrackRef.current;

    if (!textarea || !track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const maxScrollTop = textarea.scrollHeight - textarea.clientHeight;
    const maxThumbTop = Math.max(1, rect.height - scrollbarState.thumbHeight);
    const nextThumbTop = Math.min(Math.max(0, clientY - rect.top - scrollbarState.thumbHeight / 2), maxThumbTop);

    textarea.scrollTop = (nextThumbTop / maxThumbTop) * maxScrollTop;
    updateScrollbar();
  }, [scrollbarState.thumbHeight, updateScrollbar]);

  const handleScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    scrollbarPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollToPointer(event.clientY);
  };

  const handleScrollbarPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (scrollbarPointerIdRef.current !== event.pointerId) {
      return;
    }

    scrollToPointer(event.clientY);
  };

  const stopScrollbarDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (scrollbarPointerIdRef.current !== event.pointerId) {
      return;
    }

    scrollbarPointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setInternalValue(event.currentTarget.value);
    }

    onChange?.(event);
    window.requestAnimationFrame(updateScrollbar);
  };

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    onScroll?.(event);
    updateScrollbar();
  };

  React.useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(updateScrollbar);

    return () => window.cancelAnimationFrame(frame);
  }, [currentValue, updateScrollbar]);

  React.useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateScrollbar);
    observer.observe(textarea);

    return () => observer.disconnect();
  }, [updateScrollbar]);

  return (
    <label
      data-state={visualState}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "group relative flex min-h-[var(--large-text-field-min-height)] w-full rounded-[var(--radius-20)] bg-[var(--panel-surface)] p-[var(--space-16)] text-[var(--content-primary)] backdrop-blur-[var(--blur-soft)] transition-[background-color,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "hover:bg-[var(--control-surface)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)] active:bg-[var(--control-surface)]",
        "data-[state=hover]:bg-[var(--control-surface)] data-[state=pressed]:bg-[var(--control-surface)] data-[state=focused]:ring-2 data-[state=focused]:ring-[var(--focus-ring)]",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45",
        className
      )}
    >
      <span className="sr-only">{accessibleLabel}</span>
      <Textarea
        {...props}
        ref={setTextareaRef}
        defaultValue={defaultValue}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        onScroll={handleScroll}
        value={value}
        className={cn(
          "keepnoto-scrollbar min-h-[var(--large-text-field-textarea-min-height)] resize-none rounded-none border-0 bg-transparent p-[var(--space-0)] pr-[var(--scrollbar-lane)] type-16 text-[var(--content-primary)] shadow-none outline-none placeholder:text-[var(--content-muted)] focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed",
          textareaClassName
        )}
      />
      <span
        ref={scrollbarTrackRef}
        aria-hidden="true"
        className={cn(
          "keepnoto-scrollbar-track bottom-[var(--space-16)] right-[var(--scrollbar-track-edge-inset)] top-[var(--space-16)] transition-opacity",
          scrollbarState.visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onPointerDown={handleScrollbarPointerDown}
        onPointerMove={handleScrollbarPointerMove}
        onPointerUp={stopScrollbarDrag}
        onPointerCancel={stopScrollbarDrag}
      >
        {scrollbarState.visible ? (
          <span
            className="keepnoto-scrollbar-thumb"
            style={{ height: scrollbarState.thumbHeight, transform: `translateY(${scrollbarState.thumbTop}px)` }}
          />
        ) : null}
      </span>
    </label>
  );
});