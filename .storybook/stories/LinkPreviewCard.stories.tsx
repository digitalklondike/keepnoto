import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LinkPreviewCard } from "@/components/keepnoto/product-components";

const preview = {
  title: "Supabase Docs",
  description: "Production-ready backend for app developers.\nPostgres, Auth, Storage and Edge Functions.",
  url: "supabase.com/docs/guides/auth",
  previewImageSrc: "/mock-sites/supabase-preview.svg",
  previewImageAlt: "Supabase Docs preview",
  logoSrc: "/mock-sites/supabase-logo.svg",
  logoAlt: "Supabase logo",
  logoFallback: "supabase.com",
  externalHref: "https://supabase.com/docs/guides/auth",
};

const meta = {
  title: "Product/Atoms/LinkPreviewCard",
  component: LinkPreviewCard,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LinkPreviewCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ResourcePreview: Story = {
  render: () => (
    <div className="flex w-[var(--preview-card-demo-width)] p-[var(--space-24)] text-[var(--content-primary)]">
      <LinkPreviewCard {...preview} />
    </div>
  ),
};
export const TransparentLogo: Story = {
  render: () => (
    <div className="flex w-[var(--preview-card-demo-width)] p-[var(--space-24)] text-[var(--content-primary)]">
      <LinkPreviewCard
        title="Droplet"
        description="A logo with a transparent background keeps the preview surface clean."
        url="droplet.example"
        logoSrc="/mock-sites/transparent-logo.svg"
        logoAlt="Droplet logo"
        logoFallback="droplet.example"
      />
    </div>
  ),
};
