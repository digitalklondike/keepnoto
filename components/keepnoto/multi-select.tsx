"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { Icon, Icons } from "@/components/keepnoto/product-components";
import { FLOATING_COLLISION_PADDING, FLOATING_SIDE_OFFSET } from "@/components/keepnoto/design-constants";
import { Tooltip, useOverflowState } from "@/components/keepnoto/tooltip";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

export type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  onCreateOption?: (label: string) => void;
  placeholder?: string;
  createLabel?: (query: string) => string;
  disabled?: boolean;
  defaultOpen?: boolean;
  defaultQuery?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  inputClassName?: string;
  maxOptionLength?: number;
};

function normalizeLabel(value: string, maxLength?: number) {
  const normalizedValue = value.trim().replace(/\s+/g, " ");

  return typeof maxLength === "number" ? normalizedValue.slice(0, maxLength) : normalizedValue;
}

function toOptionValue(label: string) {
  return normalizeLabel(label).toLowerCase();
}

function SelectedTagLabel({ label }: { label: string }) {
  const { ref, overflowing } = useOverflowState<HTMLSpanElement>(label);
  const content = <span ref={ref} className="min-w-0 truncate">{label}</span>;

  return overflowing ? (
    <Tooltip label={label} side="top">
      {content}
    </Tooltip>
  ) : content;
}
function getOptionLabel(options: MultiSelectOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  onCreateOption,
  placeholder = "Choose tags",
  createLabel = (query) => `Create "${query}"`,
  disabled,
  defaultOpen = false,
  defaultQuery = "",
  open: controlledOpen,
  onOpenChange,
  className,
  inputClassName,
  maxOptionLength,
}: MultiSelectProps) {
  const listboxId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const tagsRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLDivElement | null>(null);
  const popupRef = React.useRef<HTMLDivElement | null>(null);
  const optionsScrollRef = React.useRef<HTMLDivElement | null>(null);
  const optionsScrollbarTrackRef = React.useRef<HTMLDivElement | null>(null);
  const optionsScrollbarPointerIdRef = React.useRef<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean | ((currentOpen: boolean) => boolean)) => {
      const resolvedOpen = typeof nextOpen === "function" ? nextOpen(controlledOpen ?? internalOpen) : nextOpen;

      if (controlledOpen === undefined) {
        setInternalOpen(resolvedOpen);
      }

      onOpenChange?.(resolvedOpen);
    },
    [controlledOpen, internalOpen, onOpenChange]
  );
  const [query, setQuery] = React.useState(defaultQuery);
  const [visibleCount, setVisibleCount] = React.useState(value.length);
  const [optionsScrollbarState, setOptionsScrollbarState] = React.useState({
    thumbHeight: 0,
    thumbTop: 0,
    visible: false,
  });


  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open, setOpen]);

  const normalizedQuery = normalizeLabel(query, maxOptionLength).toLowerCase();
  const selectedOptions = React.useMemo(
    () => value.map((selectedValue) => ({ value: selectedValue, label: getOptionLabel(options, selectedValue) })),
    [options, value]
  );
  const filteredOptions = React.useMemo(() => {
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, options]);
  const canCreate = Boolean(normalizedQuery && filteredOptions.length === 0 && onCreateOption);

  const updateOptionsScrollbar = React.useCallback(() => {
    const scrollElement = optionsScrollRef.current;
    const trackElement = optionsScrollbarTrackRef.current;

    if (!scrollElement || !trackElement) {
      return;
    }

    const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;

    if (maxScrollTop <= 1) {
      setOptionsScrollbarState({ thumbHeight: 0, thumbTop: 0, visible: false });
      return;
    }

    const trackHeight = trackElement.clientHeight;
    const thumbHeight = Math.max(24, Math.round((scrollElement.clientHeight / scrollElement.scrollHeight) * trackHeight));
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = Math.round((scrollElement.scrollTop / maxScrollTop) * maxThumbTop);

    setOptionsScrollbarState({ thumbHeight, thumbTop, visible: true });
  }, []);

  const scrollOptionsToPointer = React.useCallback((clientY: number) => {
    const scrollElement = optionsScrollRef.current;
    const trackElement = optionsScrollbarTrackRef.current;

    if (!scrollElement || !trackElement) {
      return;
    }

    const rect = trackElement.getBoundingClientRect();
    const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;
    const maxThumbTop = Math.max(1, rect.height - optionsScrollbarState.thumbHeight);
    const nextThumbTop = Math.min(Math.max(0, clientY - rect.top - optionsScrollbarState.thumbHeight / 2), maxThumbTop);

    scrollElement.scrollTop = (nextThumbTop / maxThumbTop) * maxScrollTop;
    updateOptionsScrollbar();
  }, [optionsScrollbarState.thumbHeight, updateOptionsScrollbar]);

  const handleOptionsScrollbarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    optionsScrollbarPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollOptionsToPointer(event.clientY);
  };

  const handleOptionsScrollbarPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (optionsScrollbarPointerIdRef.current !== event.pointerId) {
      return;
    }

    scrollOptionsToPointer(event.clientY);
  };

  const stopOptionsScrollbarDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (optionsScrollbarPointerIdRef.current !== event.pointerId) {
      return;
    }

    optionsScrollbarPointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };
  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      const insideRoot = rootRef.current ? path.includes(rootRef.current) : false;
      const insidePopup = popupRef.current ? path.includes(popupRef.current) : false;

      if (!insideRoot && !insidePopup) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, { capture: true });

    return () => document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
  }, [open, setOpen]);

  const updateVisibleCount = React.useCallback(() => {
    const tagsElement = tagsRef.current;
    const measureElement = measureRef.current;

    if (!tagsElement || !measureElement || selectedOptions.length === 0) {
      setVisibleCount(selectedOptions.length);
      return;
    }

    const styles = getComputedStyle(document.documentElement);
    const gap = Number.parseFloat(styles.getPropertyValue("--space-8")) || FLOATING_SIDE_OFFSET;
    const inputReserve = selectedOptions.length > 0 ? (Number.parseFloat(styles.getPropertyValue("--size-48")) || 48) + gap : 0;
    const availableWidth = Math.max(0, tagsElement.clientWidth - inputReserve);
    const chipElements = Array.from(measureElement.querySelectorAll<HTMLElement>("[data-chip-measure]"));
    const overflowElement = measureElement.querySelector<HTMLElement>("[data-overflow-measure]");

    if (chipElements.length !== selectedOptions.length || !overflowElement) {
      setVisibleCount(selectedOptions.length);
      return;
    }

    const chipWidths = chipElements.map((element) => element.offsetWidth);

    for (let count = selectedOptions.length; count >= 0; count -= 1) {
      const hiddenCount = selectedOptions.length - count;
      const visibleWidth = chipWidths.slice(0, count).reduce((total, width) => total + width, 0);
      const overflowWidth = hiddenCount > 0 ? overflowElement.offsetWidth : 0;
      const gapCount = Math.max(0, count - 1) + (hiddenCount > 0 && count > 0 ? 1 : 0);
      const neededWidth = visibleWidth + overflowWidth + gapCount * gap;

      if (neededWidth <= availableWidth) {
        setVisibleCount(count);
        return;
      }
    }

    setVisibleCount(0);
  }, [selectedOptions]);

  React.useLayoutEffect(() => {
    updateVisibleCount();
  }, [updateVisibleCount, query]);

  React.useEffect(() => {
    const tagsElement = tagsRef.current;

    if (!tagsElement) {
      return;
    }

    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(tagsElement);

    return () => observer.disconnect();
  }, [updateVisibleCount]);

  React.useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(updateOptionsScrollbar);

    return () => window.cancelAnimationFrame(frame);
  }, [canCreate, filteredOptions.length, open, updateOptionsScrollbar]);

  React.useEffect(() => {
    if (!open || !optionsScrollRef.current) {
      return;
    }

    const observer = new ResizeObserver(updateOptionsScrollbar);
    observer.observe(optionsScrollRef.current);

    return () => observer.disconnect();
  }, [open, updateOptionsScrollbar]);
  const setSelected = (nextValue: string, selected: boolean) => {
    if (selected) {
      onValueChange(value.filter((currentValue) => currentValue !== nextValue));
    } else {
      onValueChange([...value, nextValue]);
    }

    setQuery("");
    setOpen(true);
  };

  const removeValue = (nextValue: string) => {
    onValueChange(value.filter((currentValue) => currentValue !== nextValue));
  };

  const createOption = () => {
    const nextLabel = normalizeLabel(query, maxOptionLength);

    if (!nextLabel || !onCreateOption) {
      return;
    }

    const nextValue = toOptionValue(nextLabel);
    onCreateOption(nextLabel);

    if (!value.includes(nextValue)) {
      onValueChange([...value, nextValue]);
    }

    setQuery("");
    setOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !query && value.length > 0) {
      removeValue(value[value.length - 1]);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (canCreate) {
        createOption();
        return;
      }

      const firstOption = filteredOptions[0];

      if (firstOption) {
        setSelected(firstOption.value, value.includes(firstOption.value));
      }
    }

    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  const focusSelectInput = React.useCallback(() => {
    if (disabled) {
      return;
    }

    setOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [disabled, setOpen]);

  const visibleOptions = selectedOptions.slice(0, visibleCount);
  const hiddenCount = Math.max(0, selectedOptions.length - visibleCount);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div
        data-open={open ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        className={cn(
          "group/multi-select flex h-[var(--size-48)] w-full items-center gap-[var(--space-8)] rounded-[var(--radius-round)] bg-[var(--panel-surface)] px-[var(--space-16)] text-[var(--content-primary)] backdrop-blur-[var(--blur-soft)] transition-[background-color,box-shadow,opacity] duration-150 ease-out",
          "hover:bg-[var(--control-surface)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)] data-[open=true]:bg-[var(--control-surface)] data-[open=true]:ring-2 data-[open=true]:ring-[var(--focus-ring)]",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45"
        )}
        onClick={focusSelectInput}
      >
        <div ref={tagsRef} className="flex min-w-0 flex-1 items-center gap-[var(--space-8)] overflow-hidden">
          {visibleOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex h-[var(--size-24)] min-w-0 max-w-[var(--tag-chip-max-width)] shrink-0 items-center gap-[var(--space-4)] rounded-[var(--radius-round)] bg-[var(--tag-fill)] pl-[var(--space-12)] pr-[var(--space-12)] type-12-semibold text-[var(--content-primary)]"
            >
              <SelectedTagLabel label={option.label} />
              <button
                aria-label={`Remove ${option.label}`}
                className="grid size-[var(--space-16)] shrink-0 place-items-center rounded-[var(--radius-round)] p-[var(--space-0)] leading-none text-[var(--content-muted)] transition-colors duration-150 ease-out hover:text-[var(--content-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                onClick={() => removeValue(option.value)}
                type="button"
              >
                <Icon icon={Icons.cancel} size={16} strokeWidth={2} />
              </button>
            </span>
          ))}
          {hiddenCount > 0 ? (
            <span className="inline-flex h-[var(--size-24)] shrink-0 items-center rounded-[var(--radius-round)] bg-[var(--tag-fill)] px-[var(--space-12)] type-12-semibold text-[var(--content-primary)]">
              +{hiddenCount}
            </span>
          ) : null}
          <input
            aria-controls={listboxId}
            aria-expanded={open ? "true" : "false"}
            aria-haspopup="listbox"
            className={cn(
              "min-w-[var(--multi-select-input-min-width)] flex-1 bg-transparent type-16 text-[var(--content-primary)] outline-none placeholder:text-[var(--content-muted)]",
              selectedOptions.length > 0 && "min-w-[var(--multi-select-input-min-width-compact)]",
              inputClassName
            )}
            disabled={disabled}
            ref={inputRef}
            maxLength={maxOptionLength}
            onChange={(event) => {
              setQuery(typeof maxOptionLength === "number" ? event.target.value.slice(0, maxOptionLength) : event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            role="combobox"
            value={query}
          />
        </div>
        <button
          aria-label="Open tag dropdown"
          className="inline-flex size-[var(--size-24)] shrink-0 items-center justify-center rounded-[var(--radius-round)] text-[var(--content-muted)] transition-colors duration-150 ease-out hover:text-[var(--content-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          disabled={disabled}
          onClick={focusSelectInput}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <Icon
            icon={Icons.chevronDown}
            size={20}
            strokeWidth={1.8}
            className={cn("transition-transform duration-150 ease-out", open && "rotate-180")}
          />
        </button>
      </div>

      <div aria-hidden="true" ref={measureRef} className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-[var(--space-8)] whitespace-nowrap">
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            data-chip-measure
            className="inline-flex h-[var(--size-24)] min-w-0 max-w-[var(--tag-chip-max-width)] items-center gap-[var(--space-4)] rounded-[var(--radius-round)] bg-[var(--tag-fill)] pl-[var(--space-12)] pr-[var(--space-12)] type-12-semibold"
          >
            <span>{option.label}</span>
            <span className="inline-flex size-[var(--space-16)]" />
          </span>
        ))}
        <span data-overflow-measure className="inline-flex h-[var(--size-24)] items-center rounded-[var(--radius-round)] px-[var(--space-12)] type-12-semibold text-[var(--content-primary)]">
          +{Math.max(1, selectedOptions.length)}
        </span>
      </div>

      {open ? (
        <BasePopover.Root open={open} onOpenChange={setOpen}>
          <BasePopover.Portal>
            <BasePopover.Positioner
              align="start"
              anchor={rootRef}
              className="z-50"
              collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "none" }}
              collisionPadding={FLOATING_COLLISION_PADDING}
              side="bottom"
              sideOffset={FLOATING_SIDE_OFFSET}
            >
              <BasePopover.Popup ref={popupRef} className="relative max-h-[var(--dropdown-max-height)] w-(--anchor-width) min-w-[var(--dropdown-width)] origin-(--transform-origin) overflow-hidden rounded-[var(--radius-20)] bg-[var(--popover-surface)] p-[var(--space-8)] text-[var(--content-primary)] shadow-[var(--shadow-panel)] backdrop-blur-[var(--blur-panel)] transition-[opacity,transform] duration-200 ease-out data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0">
                <div
                  ref={optionsScrollRef}
                  id={listboxId}
                  role="listbox"
                  className="keepnoto-scrollbar flex max-h-[calc(var(--dropdown-max-height)_-_var(--space-16))] flex-col gap-[var(--space-4)] overflow-x-hidden overflow-y-auto overscroll-contain"
                  onScroll={updateOptionsScrollbar}
                >
          {filteredOptions.map((option) => {
            const selected = value.includes(option.value);

            return (
              <button
                key={option.value}
                aria-selected={selected}
                className="flex h-[var(--size-48)] w-full shrink-0 items-center gap-[var(--space-8)] rounded-[var(--radius-12)] px-[var(--space-12)] type-16 text-[var(--content-primary)] outline-none transition-[background-color,opacity] duration-150 ease-out hover:bg-[var(--state-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] active:bg-[var(--state-pressed)]"
                onClick={() => setSelected(option.value, selected)}
                role="option"
                type="button"
              >
                <span className="min-w-0 flex-1 truncate text-left">{option.label}</span>
                {selected ? <Icon icon={Icons.check} size={16} strokeWidth={2} className="text-[var(--accent-start)]" /> : null}
              </button>
            );
          })}
          {canCreate ? (
            <button
              className="flex h-[var(--size-48)] w-full shrink-0 items-center gap-[var(--space-8)] rounded-[var(--radius-12)] px-[var(--space-12)] type-16 text-[var(--accent-start)] outline-none transition-[background-color,opacity] duration-150 ease-out hover:bg-[var(--state-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] active:bg-[var(--state-pressed)]"
              onClick={createOption}
              type="button"
            >
              <Icon icon={Icons.add} size={16} strokeWidth={2} />
              <span className="min-w-0 flex-1 truncate text-left">{createLabel(normalizeLabel(query, maxOptionLength))}</span>
            </button>
          ) : null}
          {filteredOptions.length === 0 && !canCreate ? (
            <div className="flex h-[var(--size-48)] shrink-0 items-center px-[var(--space-12)] type-16 text-[var(--content-muted)]">
              No tags found
            </div>
          ) : null}
                </div>
                <div
                  ref={optionsScrollbarTrackRef}
                  aria-hidden="true"
                  className={cn(
                    "keepnoto-scrollbar-track bottom-[var(--space-16)] right-[var(--scrollbar-track-edge-inset)] top-[var(--space-16)] transition-opacity",
                    optionsScrollbarState.visible ? "opacity-100" : "pointer-events-none opacity-0"
                  )}
                  onPointerDown={handleOptionsScrollbarPointerDown}
                  onPointerMove={handleOptionsScrollbarPointerMove}
                  onPointerUp={stopOptionsScrollbarDrag}
                  onPointerCancel={stopOptionsScrollbarDrag}
                >
                  {optionsScrollbarState.visible ? (
                    <span
                      className="keepnoto-scrollbar-thumb"
                      style={{ height: optionsScrollbarState.thumbHeight, transform: `translateY(${optionsScrollbarState.thumbTop}px)` }}
                    />
                  ) : null}
                </div>
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        </BasePopover.Root>
      ) : null}
    </div>
  );
}