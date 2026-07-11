import type { Metadata } from "next";
import { LegalPage } from "@/components/keepnoto/legal-page";
import { supportEmail } from "@/lib/support";

export const metadata: Metadata = {
  title: "Privacy Policy | Keepnoto",
  description: "How Keepnoto handles your account and saved-link data.",
};

const lastUpdated = "July 10, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated={lastUpdated}>
      <p className="text-[var(--content-muted)]">
        Keepnoto helps you save links with the context that makes them useful when you return. This policy explains the basic data we use to provide that service.
      </p>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">Information we collect</h2>
        <p>When you sign in with Google, we receive your name, email address, and profile image. We also store the saved links and information you create in Keepnoto, including titles, notes or saved reasons, tags, and timestamps.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">How we use it</h2>
        <p>We use this information to create and secure your account, save and organize your links, and provide the core functionality of Keepnoto.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">Services we use</h2>
        <p>Keepnoto uses Google OAuth for sign-in, Supabase for authentication and data storage, and Vercel to host the application.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">Your data</h2>
        <p>We do not sell your personal data. You can request deletion of your account and saved data by emailing <a className="underline decoration-[var(--border-subtle)] underline-offset-4 hover:text-[var(--content-primary)]" href={`mailto:${supportEmail}`}>{supportEmail}</a> from the email address connected to your account.</p>
      </section>

      <section className="flex flex-col gap-[var(--space-8)]">
        <h2 className="type-16-semibold">Updates</h2>
        <p>We may update this policy as Keepnoto develops. The date at the top of this page shows the latest revision.</p>
      </section>
    </LegalPage>
  );
}
