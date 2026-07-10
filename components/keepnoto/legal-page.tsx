import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <main className="auth-canvas flex min-h-dvh w-full justify-center p-[var(--space-24)] text-[var(--content-primary)] sm:p-[var(--space-40)]">
      <article className="w-full max-w-[720px] py-[var(--space-24)] sm:py-[var(--space-40)]">
        <header className="border-b border-[var(--border-subtle)] pb-[var(--space-24)]">
          <Link href="/login" className="type-12 text-[var(--content-muted)] transition-colors hover:text-[var(--content-primary)]">
            Keepnoto
          </Link>
          <h1 className="mt-[var(--space-16)] type-title text-[var(--content-primary)]">{title}</h1>
          <p className="mt-[var(--space-8)] type-12 text-[var(--content-muted)]">Last updated: {lastUpdated}</p>
        </header>

        <div className="flex flex-col gap-[var(--space-24)] py-[var(--space-32)] type-16 text-[var(--content-primary)]">
          {children}
        </div>

        <footer className="flex flex-wrap gap-x-[var(--space-16)] gap-y-[var(--space-8)] border-t border-[var(--border-subtle)] pt-[var(--space-24)] type-12 text-[var(--content-muted)]">
          <Link href="/privacy" className="transition-colors hover:text-[var(--content-primary)]">Privacy Policy</Link>
          <Link href="/terms" className="transition-colors hover:text-[var(--content-primary)]">Terms of Service</Link>
          <Link href="/login" className="transition-colors hover:text-[var(--content-primary)]">Sign in</Link>
        </footer>
      </article>
    </main>
  );
}
