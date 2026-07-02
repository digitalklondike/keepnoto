import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TextField, type TextFieldVisualState } from "@/components/keepnoto/product-components";

const states: Array<{ label: string; visualState: TextFieldVisualState; value?: string; disabled?: boolean }> = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Focused", visualState: "focused" },
  { label: "With value", visualState: "default", value: "supabase auth" },
  { label: "Disabled", visualState: "default", disabled: true },
];

const meta = {
  title: "Product/Atoms/TextField",
  component: TextField,
  parameters: { layout: "centered" },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-12)] bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      {states.map((state) => (
        <div key={state.label} className="grid grid-cols-[96px_var(--search-width)] items-center gap-[var(--space-16)]">
          <div className="type-12-semibold text-[var(--content-muted)]">{state.label}</div>
          <TextField
            placeholder="Search your library or paste a link to save..."
            visualState={state.visualState}
            defaultValue={state.value}
            disabled={state.disabled}
          />
        </div>
      ))}
    </div>
  ),
};

