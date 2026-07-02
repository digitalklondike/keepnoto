import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Archive01Icon,
  Bookmark02Icon,
  Folder01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

import { KntSidebar } from "@/components/keepnoto/product-components";

const items = [
  { label: "Library", icon: Bookmark02Icon },
  { label: "Collections", icon: Folder01Icon },
  { label: "Archive", icon: Archive01Icon },
  { label: "Settings", icon: Settings01Icon, disabled: true },
];

const meta = {
  title: "Product/KntSidebar",
  component: KntSidebar,
  parameters: { layout: "centered" },
  args: { items, activeLabel: "Library" },
} satisfies Meta<typeof KntSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActiveCollection: Story = {
  args: { activeLabel: "Collections" },
};

export const WithDisabledItem: Story = {
  args: { activeLabel: "Archive" },
};
