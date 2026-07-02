import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KntLinkPreviewCard } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/KntLinkPreviewCard",
  component: KntLinkPreviewCard,
  parameters: { layout: "centered" },
  args: {
    title: "The practical guide to building calmer product dashboards",
    domain: "productsystems.co",
    imageSrc: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
  },
  render: (args) => (
    <div className="w-[min(360px,calc(100vw-2rem))]">
      <KntLinkPreviewCard {...args} />
    </div>
  ),
} satisfies Meta<typeof KntLinkPreviewCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithImage: Story = {};

export const MissingImageFallback: Story = {
  args: { imageSrc: undefined, fallbackLabel: "No preview image" },
};
