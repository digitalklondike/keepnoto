"use client";

import * as React from "react";

import { BrandLogo, Button } from "@/components/keepnoto/product-components";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("Keepnoto route error", error);
  }, [error]);

  return (
    <main className="auth-canvas flex h-dvh w-dvw items-center justify-center overflow-hidden p-[var(--space-24)]">
      <section className="flex w-[var(--auth-panel-width)] max-w-full flex-col items-center gap-[var(--space-24)] rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-32)] text-center">
        <BrandLogo size={40} />
        <div className="flex flex-col gap-[var(--space-8)]">
          <h1 className="type-title text-[var(--content-primary)]">Keepnoto hit a snag</h1>
          <p className="type-16 text-[var(--content-muted)]">Your saved links are still safe. Try loading this view again.</p>
        </div>
        <Button className="h-[var(--size-48)] w-full" onClick={reset} tone="primary" type="button">
          Try again
        </Button>
      </section>
    </main>
  );
}
