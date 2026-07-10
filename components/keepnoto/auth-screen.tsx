"use client";

import * as React from "react";
import { BrandLogo, Button } from "@/components/keepnoto/product-components";
import { createClient } from "@/lib/supabase/client";

export type AuthScreenProps = {
  error?: string | null;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-[var(--size-20)]" viewBox="0 0 24 24">
      <path d="M21.35 12.24c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.5h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z" fill="#4285F4" />
      <path d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.71-5.46-4.02H3.3v2.52A9.75 9.75 0 0 0 12 21.75Z" fill="#34A853" />
      <path d="M6.54 13.85A5.87 5.87 0 0 1 6.23 12c0-.64.11-1.26.31-1.85V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.37l3.24-2.52Z" fill="#FBBC05" />
      <path d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.8C16.83 3.21 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.63l3.24 2.52C7.31 7.84 9.46 6.13 12 6.13Z" fill="#EA4335" />
    </svg>
  );
}

export function AuthScreen({ error }: AuthScreenProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [requestError, setRequestError] = React.useState<string | null>(null);

  const continueWithGoogle = async () => {
    setIsSubmitting(true);
    setRequestError(null);

    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setRequestError("Google sign-in could not start. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-canvas relative flex h-dvh w-dvw items-center justify-center overflow-hidden p-[var(--space-24)] text-[var(--content-primary)]">
      <section className="relative flex w-[var(--auth-panel-width)] max-w-full flex-col items-center rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)] backdrop-blur-[var(--blur-panel)] sm:p-[var(--space-40)]">
        <div className="flex size-[var(--size-48)] items-center justify-center">
          <BrandLogo size={40} />
        </div>
        <div className="mt-[var(--space-24)] flex w-full flex-col items-center gap-[var(--space-8)] text-center">
          <h1 className="type-title text-[var(--content-primary)]">Welcome to Keepnoto</h1>
          <p className="max-w-[var(--auth-copy-width)] type-16 text-[var(--content-muted)]">
            Save links with the context that makes them worth returning to.
          </p>
        </div>
        <div className="mt-[var(--space-32)] flex w-full flex-col gap-[var(--space-16)]">
          <Button className="h-[var(--size-48)] w-full" disabled={isSubmitting} onClick={() => void continueWithGoogle()} tone="secondary" type="button">
            <GoogleMark />
            {isSubmitting ? "Opening Google..." : "Continue with Google"}
          </Button>
          {error || requestError ? <p aria-live="polite" className="text-center type-12 text-[var(--danger)]">{requestError ?? "Sign-in was not completed. Please try again."}</p> : null}
        </div>
      </section>
    </main>
  );
}