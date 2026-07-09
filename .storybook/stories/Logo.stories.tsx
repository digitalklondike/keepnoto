import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BrandLogo } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/Atoms/Logo",
  component: BrandLogo,
  parameters: { layout: "centered" },
  args: {
    size: 32,
  },
  render: (args) => (
    <div className="bg-transparent p-[var(--space-24)]">
      <BrandLogo {...args} />
    </div>
  ),
} satisfies Meta<typeof BrandLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};