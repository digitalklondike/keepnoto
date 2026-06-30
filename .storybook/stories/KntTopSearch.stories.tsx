import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/ui/badge";
import { KntTopSearch } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/KntTopSearch",
  component: KntTopSearch,
  parameters: { layout: "centered" },
  args: { placeholder: "Search saved links, domains, tags..." },
  render: (args) => (
    <div className="w-[min(560px,calc(100vw-2rem))]">
      <KntTopSearch {...args} />
    </div>
  ),
} satisfies Meta<typeof KntTopSearch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HoverLike: Story = {
  args: { state: "hover" },
};

export const Pressed: Story = {
  args: { state: "pressed", defaultValue: "onboarding" },
};

export const WithAction: Story = {
  args: { action: <Badge variant="secondary">12</Badge>, defaultValue: "design" },
};

export const Disabled: Story = {
  args: { disabled: true, value: "Search unavailable" },
};
