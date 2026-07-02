import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Icon, Icons } from "@/components/keepnoto/product-components";

const iconSizes = [16, 20, 32] as const;

const meta = {
  title: "Product/Atoms/Icon",
  component: Icon,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: () => (
    <div className="bg-transparent p-6 text-[var(--content-primary)]">
      <div className="grid grid-cols-[80px_80px_80px] items-end gap-6">
        {iconSizes.map((size) => (
          <div key={size} className="flex flex-col items-center gap-3">
            <Icon icon={Icons.link} size={size} strokeWidth={1.8} />
            <span className="type-12-semibold text-[var(--content-muted)]">{size}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};