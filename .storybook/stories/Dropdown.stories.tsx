import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/keepnoto/dropdown";
import { Button, Icons } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/Atoms/Dropdown",
  component: Dropdown,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

function DropdownExample() {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="bg-transparent p-[var(--space-32)] text-[var(--content-primary)]">
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        align="start"
        trigger={
          <Button tone="secondary" className="h-[var(--size-48)] px-[var(--space-24)]">
            Link actions
          </Button>
        }
      >
        <DropdownItem icon={Icons.edit}>Edit link</DropdownItem>
        <DropdownItem icon={Icons.bookmark} endLabel="Saved">
          Save to library
        </DropdownItem>
        <DropdownItem icon={Icons.external}>Open in new window</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={Icons.archive} tone="danger">
          Delete link
        </DropdownItem>
      </Dropdown>
    </div>
  );
}

export const Default: Story = {
  render: () => <DropdownExample />,
};