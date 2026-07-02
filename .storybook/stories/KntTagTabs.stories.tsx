import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KntTagTabs } from "@/components/keepnoto/product-components";

const tabs = [
  { label: "All", count: 48 },
  { label: "Design", count: 16 },
  { label: "Research", count: 12 },
  { label: "Tools", count: 9 },
  { label: "Reading", count: 0, disabled: true },
];

const meta = {
  title: "Product/KntTagTabs",
  component: KntTagTabs,
  parameters: { layout: "centered" },
  args: { tabs, activeLabel: "All" },
} satisfies Meta<typeof KntTagTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { activeLabel: "Design" },
};

export const WithDisabled: Story = {
  args: { activeLabel: "Tools" },
};
