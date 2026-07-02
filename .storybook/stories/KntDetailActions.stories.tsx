import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KntDetailActions } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/KntDetailActions",
  component: KntDetailActions,
  parameters: { layout: "centered" },
} satisfies Meta<typeof KntDetailActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
