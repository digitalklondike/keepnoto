"use client";

import * as React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("Keepnoto global error", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="auth-canvas flex h-dvh w-dvw items-center justify-center overflow-hidden p-[var(--space-24)]">
          <section className="flex w-[var(--auth-panel-width)] max-w-full flex-col items-center gap-[var(--space-24)] rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-32)] text-center">
            <div className="flex flex-col gap-[var(--space-8)]">
              <h1 className="type-title text-[var(--content-primary)]">Keepnoto could not load</h1>
              <p className="type-16 text-[var(--content-muted)]">Please retry. Your library data is not removed by this error.</p>
            </div>
            <button className="h-[var(--size-48)] w-full rounded-[var(--radius-round)] bg-[var(--accent-start)] type-16-semibold text-[var(--white)]" onClick={reset} type="button">
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
