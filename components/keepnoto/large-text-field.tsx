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
  textareaClassName,
  value,
  visualState = "default",
  ...props
}, ref) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(() => String(defaultValue ?? ""));
  const currentValue = String(isControlled ? value ?? "" : internalValue);
  const characterCount = Math.min(currentValue.length, maxLength);
  const accessibleLabel = props["aria-label"] ?? "Long text field";

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setInternalValue(event.currentTarget.value);
    }

    onChange?.(event);
  };

  return (
    <label
      data-state={visualState}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "group relative flex min-h-[var(--large-text-field-min-height)] w-full rounded-[var(--radius-20)] bg-[var(--panel-surface)] px-[var(--space-16)] pb-[var(--large-text-field-counter-space)] pt-[var(--space-16)] text-[var(--content-primary)] backdrop-blur-[var(--blur-soft)] transition-[background-color,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "hover:bg-[var(--control-surface)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)] active:bg-[var(--control-surface)]",
        "data-[state=hover]:bg-[var(--control-surface)] data-[state=pressed]:bg-[var(--control-surface)] data-[state=focused]:ring-2 data-[state=focused]:ring-[var(--focus-ring)]",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45",
        className
      )}
    >
      <span className="sr-only">{accessibleLabel}</span>
      <Textarea
        {...props}
        ref={ref}
        defaultValue={defaultValue}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        value={value}
        className={cn(
          "min-h-[var(--large-text-field-textarea-min-height)] resize-none rounded-none border-0 bg-transparent p-[var(--space-0)] type-16 text-[var(--content-primary)] shadow-none outline-none placeholder:text-[var(--content-muted)] focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed",
          textareaClassName
        )}
      />
      <span
        aria-live="polite"
        className="pointer-events-none absolute bottom-[var(--space-12)] right-[var(--space-16)] type-12-semibold text-[var(--content-muted)]"
      >
        {characterCount}/{maxLength}
      </span>
    </label>
  );
});
