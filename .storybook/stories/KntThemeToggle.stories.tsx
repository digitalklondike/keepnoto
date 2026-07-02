import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KntThemeToggle } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/KntThemeToggle",
  component: KntThemeToggle,
  parameters: { layout: "centered" },
  args: { theme: "light" },
} satisfies Meta<typeof KntThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {};

export const Dark: Story = {
  args: { theme: "dark" },
};

export const Pressed: Story = {
  args: { theme: "dark", pressed: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
