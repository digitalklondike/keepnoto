import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bookmark02Icon } from "@hugeicons/core-free-icons";

import { KntSidebarItem } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/KntSidebarItem",
  component: KntSidebarItem,
  parameters: { layout: "centered" },
  args: { label: "Library", icon: Bookmark02Icon },
  render: (args) => (
    <div className="min-w-40 p-8">
      <KntSidebarItem {...args} />
    </div>
  ),
} satisfies Meta<typeof KntSidebarItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HoverLike: Story = {
  args: { className: "bg-secondary text-secondary-foreground" },
};

export const Active: Story = {
  args: { active: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
