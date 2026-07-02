import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KntLinkCard } from "@/components/keepnoto/product-components";

const baseArgs = {
  title: "How Linear designs product surfaces that stay calm at scale",
  domain: "linear.app",
  description:
    "A useful teardown of navigation density, issue detail hierarchy, and the small affordances that keep complex work readable.",
  savedReason:
    "Good reference for making saved links feel curated without adding clutter.",
  logoSrc: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
  previewSrc: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  tags: ["Design", "Product", "Reference"],
};

const meta = {
  title: "Product/KntLinkCard",
  component: KntLinkCard,
  parameters: { layout: "centered" },
  args: baseArgs,
  render: (args) => (
    <div className="w-[min(420px,calc(100vw-2rem))]">
      <KntLinkCard {...args} />
    </div>
  ),
} satisfies Meta<typeof KntLinkCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HoverLike: Story = {
  args: { state: "hover" },
};

export const Pressed: Story = {
  args: { pressed: true },
};

export const Selected: Story = {
  args: { selected: true },
};

export const WithoutPreview: Story = {
  args: { previewSrc: undefined },
};
