"use client";

import * as React from "react";
import { OtpField } from "@/components/keepnoto/otp-field";
import { BrandLogo, Button, Icon, Icons, TextField } from "@/components/keepnoto/product-components";

const LOCAL_PREVIEW_CODE = "246810";
const RESEND_DELAY_SECONDS = 60;

type AuthStep = "email" | "code";

export type AuthScreenProps = {
  onAuthenticated: (email: string) => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [step, setStep] = React.useState<AuthStep>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [secondsUntilResend, setSecondsUntilResend] = React.useState(0);
  const codeInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (secondsUntilResend <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => setSecondsUntilResend((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timeoutId);
  }, [secondsUntilResend]);

  React.useEffect(() => {
    if (step === "code") {
      codeInputRef.current?.focus();
    }
  }, [step]);

  const submitEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setEmail(normalizedEmail);
    setCode("");
    setError(null);
    setSecondsUntilResend(RESEND_DELAY_SECONDS);
    setStep("code");
  };

  const submitCode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (code.length !== 6) {
      setError("Enter the six-digit code from your email.");
      return;
    }

    if (process.env.NODE_ENV !== "development") {
      setError("Email verification will be available after authentication is connected.");
      return;
    }

    if (code !== LOCAL_PREVIEW_CODE) {
      setError("That code is not correct. Try again.");
      return;
    }

    setError(null);
    onAuthenticated(email);
  };

  const resendCode = () => {
    if (secondsUntilResend > 0) {
      return;
    }

    setCode("");
    setError(null);
    setSecondsUntilResend(RESEND_DELAY_SECONDS);
    codeInputRef.current?.focus();
  };

  return (
    <main className="auth-canvas relative flex h-dvh w-dvw items-center justify-center overflow-hidden p-[var(--space-24)] text-[var(--content-primary)]">
      <section className="relative flex w-[var(--auth-panel-width)] max-w-full flex-col items-center rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)] backdrop-blur-[var(--blur-panel)] sm:p-[var(--space-40)]">
        <div className="flex size-[var(--size-48)] items-center justify-center">
          <BrandLogo size={40} />
        </div>

        <div className="mt-[var(--space-24)] flex w-full flex-col items-center gap-[var(--space-8)] text-center">
          <h1 className="type-title text-[var(--content-primary)]">
            {step === "email" ? "Welcome to Keepnoto" : "Check your inbox"}
          </h1>
          <p className="max-w-[var(--auth-copy-width)] type-16 text-[var(--content-muted)]">
            {step === "email"
              ? "Save links with the context that makes them worth returning to."
              : `Enter the six-digit code sent to ${email}.`}
          </p>
        </div>

        {step === "email" ? (
          <form className="mt-[var(--space-32)] flex w-full flex-col gap-[var(--space-16)]" onSubmit={submitEmail}>
            <label className="flex flex-col gap-[var(--space-8)]">
              <span className="type-label text-[var(--content-muted)]">Email</span>
              <TextField
                aria-invalid={Boolean(error) || undefined}
                autoComplete="email"
                autoFocus
                className="w-full bg-[var(--control-surface)]"
                icon={Icons.mail}
                inputMode="email"
                onChange={(event) => {
                  setEmail(event.currentTarget.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>
            {error ? <p aria-live="polite" className="type-12 text-[var(--danger)]">{error}</p> : null}
            <Button className="h-[var(--size-48)] w-full" tone="primary" type="submit">
              Continue
            </Button>
            <p className="text-center type-12 text-[var(--content-muted)]">We will email you a one-time sign-in code.</p>
          </form>
        ) : (
          <form className="mt-[var(--space-32)] flex w-full flex-col gap-[var(--space-16)]" onSubmit={submitCode}>
            <OtpField
              ref={codeInputRef}
              aria-label="Verification code"
              invalid={Boolean(error)}
              onValueChange={(nextCode) => {
                setCode(nextCode);
                setError(null);
              }}
              value={code}
            />
            {process.env.NODE_ENV === "development" ? (
              <p className="text-center type-12 text-[var(--content-muted)]">Local preview code: {LOCAL_PREVIEW_CODE}</p>
            ) : null}
            {error ? <p aria-live="polite" className="text-center type-12 text-[var(--danger)]">{error}</p> : null}
            <Button className="h-[var(--size-48)] w-full" disabled={code.length !== 6} tone="primary" type="submit">
              <Icon icon={Icons.check} size={20} strokeWidth={2} aria-hidden="true" />
              Continue to library
            </Button>
            <div className="flex items-center justify-between gap-[var(--space-16)]">
              <button
                className="type-12-semibold text-[var(--content-muted)] transition-colors hover:text-[var(--content-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
                type="button"
              >
                Use another email
              </button>
              <button
                className="type-12-semibold text-[var(--content-muted)] transition-colors hover:text-[var(--content-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={secondsUntilResend > 0}
                onClick={resendCode}
                type="button"
              >
                {secondsUntilResend > 0 ? `Resend in ${secondsUntilResend}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
