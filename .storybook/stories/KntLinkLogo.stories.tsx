import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KntLinkLogo } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/KntLinkLogo",
  component: KntLinkLogo,
  parameters: { layout: "centered" },
  args: {
    src: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
    alt: "Notion favicon",
    fallback: "notion.so",
  },
} satisfies Meta<typeof KntLinkLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Image: Story = {};

export const FallbackLetter: Story = {
  args: { src: undefined, fallback: "linear.app" },
};

export const Large: Story = {
  args: { size: "lg", fallback: "read.cv" },
};
