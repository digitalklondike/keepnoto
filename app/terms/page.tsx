import type { Metadata } from "next";
import { LegalPage } from "@/components/keepnoto/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | Keepnoto",
  description: "The terms for using Keepnoto.",
};

const lastUpdated = "July 10, 2026";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated={lastUpdated}>
      <p className="text-[var(--content-muted)]">
        Keepnoto is a tool for saving and organizing links with personal context. By using it, you agree to these simple terms.
      </p>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">Your saved content</h2>
        <p>You are responsible for the links, notes, tags, and other content you save in Keepnoto. Make sure you have the right to save and use that content.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">Acceptable use</h2>
        <p>Do not use Keepnoto for illegal, harmful, abusive, or fraudulent activity, or to store content that violates the rights of others.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">MVP availability</h2>
        <p>Keepnoto is an MVP. Features may change, the service may be unavailable from time to time, and there may be bugs while we improve it.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">No warranty</h2>
        <p>Keepnoto is provided as-is and as available, without warranties of any kind. Please keep your own copies of anything important to you.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">Contact</h2>
        <p>For questions about these terms, contact <a className="underline decoration-[var(--border-subtle)] underline-offset-4 hover:text-[var(--content-primary)]" href="mailto:support@keepnoto.app">support@keepnoto.app</a>.</p>
      </section>
    </LegalPage>
  );
}
