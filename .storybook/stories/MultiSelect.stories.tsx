import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MultiSelect, type MultiSelectOption } from "@/components/keepnoto/multi-select";

const initialOptions: MultiSelectOption[] = [
  { value: "auth", label: "auth" },
  { value: "design", label: "design" },
  { value: "docs", label: "docs" },
  { value: "frontend", label: "frontend" },
  { value: "react", label: "react" },
  { value: "supabase", label: "supabase" },
  { value: "very-long-product-research-tag", label: "very-long-product-research-tag" },
  { value: "systems", label: "systems" },
];

type MultiSelectStoryState = {
  label: string;
  value: string[];
  disabled?: boolean;
  defaultOpen?: boolean;
  defaultQuery?: string;
};

const states: MultiSelectStoryState[] = [
  { label: "Default", value: [] },
  { label: "With tags", value: ["auth", "docs"] },
  { label: "Overflow", value: ["auth", "design", "docs", "frontend", "react", "supabase"] },
  { label: "Dropdown", value: ["auth", "docs"], defaultOpen: true },
  { label: "Search tags", value: ["auth"], defaultOpen: true, defaultQuery: "rea" },
  { label: "Create tag", value: ["design"], defaultOpen: true, defaultQuery: "tools" },
  { label: "Disabled", value: ["auth", "docs"], disabled: true },
];

const meta = {
  title: "Product/Atoms/MultiSelect",
  component: MultiSelect,
  parameters: { layout: "centered" },
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

function StatefulMultiSelect({
  defaultOpen = false,
  defaultQuery = "",
  defaultValue = [],
  disabled = false,
}: {
  defaultOpen?: boolean;
  defaultQuery?: string;
  defaultValue?: string[];
  disabled?: boolean;
}) {
  const [options, setOptions] = React.useState(initialOptions);
  const [value, setValue] = React.useState(defaultValue);

  return (
    <MultiSelect
      defaultOpen={defaultOpen}
      defaultQuery={defaultQuery}
      disabled={disabled}
      onCreateOption={(label) => {
        const nextValue = label.trim().toLowerCase();

        if (!nextValue || options.some((option) => option.value === nextValue)) {
          return;
        }

        setOptions((currentOptions) => [...currentOptions, { value: nextValue, label: nextValue }]);
      }}
      onValueChange={setValue}
      options={options}
      placeholder="Choose or create tags"
      value={value}
    />
  );
}

export const States: Story = {
  render: () => (
    <div className="flex w-[var(--save-link-dialog-width)] flex-col gap-[var(--space-12)] bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      {states.map((state) => (
        <div
          key={state.label}
          className="grid grid-cols-[112px_minmax(0,1fr)] items-start gap-[var(--space-16)] data-[open=true]:min-h-[360px]"
          data-open={state.defaultOpen ? "true" : undefined}
        >
          <div className="pt-[var(--space-16)] type-12-semibold text-[var(--content-muted)]">{state.label}</div>
          <StatefulMultiSelect
            defaultOpen={state.defaultOpen}
            defaultQuery={state.defaultQuery}
            defaultValue={state.value}
            disabled={state.disabled}
          />
        </div>
      ))}
    </div>
  ),
};
