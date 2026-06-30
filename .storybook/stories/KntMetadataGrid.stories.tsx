import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KntMetadataGrid } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/KntMetadataGrid",
  component: KntMetadataGrid,
  parameters: { layout: "centered" },
  args: {
    source: "linear.app",
    savedDate: "Jun 24, 2026",
    createdDate: "May 18, 2026",
    type: "Article",
    tags: ["Design", "Workflow", "Reference"],
  },
  render: (args) => (
    <div className="w-[min(520px,calc(100vw-2rem))]">
      <KntMetadataGrid {...args} />
    </div>
  ),
} satisfies Meta<typeof KntMetadataGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTags: Story = {
  args: { tags: [] },
};

export const MissingCreatedDate: Story = {
  args: { createdDate: undefined },
};
