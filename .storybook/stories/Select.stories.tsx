import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectVisualState,
} from "@/components/keepnoto/select";
import { Icons } from "@/components/keepnoto/product-components";

const collectionOptions = [
  { value: "all", label: "All links", icon: Icons.link, endLabel: "128" },
  { value: "reading", label: "Reading list", icon: Icons.book, endLabel: "42" },
  { value: "research", label: "Research", icon: Icons.fileImage, endLabel: "18" },
  { value: "tools", label: "Tools", icon: Icons.folder, endLabel: "31" },
];

type SelectStoryState = {
  label: string;
  visualState: SelectVisualState;
  value?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
};

const states: SelectStoryState[] = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Focused", visualState: "focused" },
  { label: "Open", visualState: "focused", value: "reading", defaultOpen: true },
  { label: "With value", visualState: "default", value: "reading" },
  { label: "Disabled", visualState: "default", disabled: true },
];

const meta = {
  title: "Product/Atoms/Select",
  component: Select,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

function SelectStateRow({ state }: { state: SelectStoryState }) {
  const [open, setOpen] = React.useState(state.defaultOpen ?? false);
  const [value, setValue] = React.useState<string | null>(state.value ?? null);

  return (
    <div className="grid grid-cols-[96px_280px] items-center gap-[var(--space-16)]">
      <div className="type-12-semibold text-[var(--content-muted)]">{state.label}</div>
      <Select
        value={value}
        onValueChange={(nextValue) => setValue(nextValue as string | null)}
        open={open}
        onOpenChange={setOpen}
        disabled={state.disabled}
        items={collectionOptions}
      >
        <SelectTrigger visualState={state.visualState} aria-label={`${state.label} collection state`}>
          <SelectValue placeholder="Choose collection" />
        </SelectTrigger>
        <SelectContent>
          {collectionOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} icon={option.icon} endLabel={option.endLabel}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-12)] bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      {states.map((state) => (
        <SelectStateRow key={state.label} state={state} />
      ))}
    </div>
  ),
};
