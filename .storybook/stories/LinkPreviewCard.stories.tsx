import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LinkPreviewCard } from "@/components/keepnoto/product-components";

const preview = {
  title: "Supabase Docs",
  description: "Production-ready backend for app developers.\nPostgres, Auth, Storage and Edge Functions.",
  url: "supabase.com/docs/guides/auth",
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