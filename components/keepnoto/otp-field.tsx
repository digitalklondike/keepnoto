"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

export type OtpFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
};

export const OtpField = React.forwardRef<HTMLInputElement, OtpFieldProps>(function OtpField(
  { value, onValueChange, invalid = false, className, disabled, ...props },
  ref
) {
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? "");
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  return (
    <label
      className={cn(
        "group relative grid w-full grid-cols-6 items-center justify-center gap-[var(--space-4)] sm:gap-[var(--space-8)]",
        disabled && "opacity-45",
        className
      )}
    >
      <span className="sr-only">Six-digit verification code</span>
      <input
        {...props}
        ref={ref}
        aria-invalid={invalid || undefined}
        autoComplete="one-time-code"
        className="absolute inset-0 z-10 size-full cursor-text opacity-0 disabled:cursor-not-allowed"
        disabled={disabled}
        inputMode="numeric"
        maxLength={OTP_LENGTH}
        onChange={(event) => onValueChange(event.currentTarget.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
        pattern="[0-9]*"
        type="text"
        value={value}
      />
      {digits.map((digit, index) => (
        <span
          aria-hidden="true"
          className={cn(
            "flex aspect-square w-full max-w-[var(--auth-code-cell-size)] items-center justify-center justify-self-center rounded-[var(--radius-12)] bg-[var(--control-surface)] type-title text-[var(--content-primary)] transition-[background-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "group-focus-within:bg-[var(--card-control-hover)]",
            index === activeIndex && "group-focus-within:ring-2 group-focus-within:ring-[var(--focus-ring)]",
            invalid && "ring-2 ring-[var(--danger-muted)]"
          )}
          key={index}
        >
          {digit}
        </span>
      ))}
    </label>
  );
});
