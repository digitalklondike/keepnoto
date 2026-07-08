import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LinkCard, type LinkCardVisualState } from "@/components/keepnoto/link-card";

const sampleLink = {
  title: "Supabase Auth - Documentation",
  source: "Supabase Docs",
  url: "supabase.com/docs/guides/auth",
  description: "The cleanest explanation of magic links and OAuth providers. The session refresh flow finally clicked.",
  tags: ["auth", "docs", "supabase"],
  savedAt: "2 days ago",
  faviconSrc: "/mock-sites/supabase-logo.svg",
  faviconFallback: "S",
  faviconColor: "var(--favicon-1)",
};

const crowdedLink = {
  ...sampleLink,
  tags: ["auth", "docs", "very-long-product-research-tag", "oauth", "magic links", "sessions", "security"],
};

const shortReasonLink = {
  ...sampleLink,
  description: "Useful auth reference for the weekend build.",
};

const longReasonLink = {
  ...sampleLink,
  title: "OAuth Session Refresh Notes",
  description:
    "The clearest explanation I found for magic links, refresh sessions, and the small edge cases I always forget when wiring auth into side projects.",
};
const states: Array<{ label: string; visualState: LinkCardVisualState; favorite?: boolean }> = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Focused", visualState: "focused" },
  { label: "Active", visualState: "active" },
  { label: "Favorite", visualState: "active", favorite: true },
  { label: "Loading", visualState: "loading" },
];

const meta = {
  title: "Product/Composed/LinkCard",
  component: LinkCard,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LinkCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="bg-transparent p-[var(--space-32)] text-[var(--content-primary)]">
      <div className="grid gap-[var(--space-20)]">
        {states.map((state) => (
          <div key={state.label} className="grid grid-cols-[96px_var(--link-card-width)] items-start gap-[var(--space-16)]">
            <div className="pt-[var(--space-20)] type-12-semibold text-[var(--content-muted)]">{state.label}</div>
            <LinkCard {...sampleLink} visualState={state.visualState} favorite={state.favorite} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ManyTags: Story = {
  render: () => (
    <div className="bg-transparent p-[var(--space-32)] text-[var(--content-primary)]">
      <LinkCard {...crowdedLink} />
    </div>
  ),
};
export const ReasonLengths: Story = {
  render: () => (
    <div className="bg-transparent p-[var(--space-32)] text-[var(--content-primary)]">
      <div className="grid gap-[var(--space-16)]">
        <LinkCard {...shortReasonLink} />
        <LinkCard {...longReasonLink} />
      </div>
    </div>
  ),
};

