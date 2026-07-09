import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  LargeTextField,
  type LargeTextFieldVisualState,
} from "@/components/keepnoto/large-text-field";
import { SAVED_REASON_INPUT_MAX_LENGTH } from "@/components/keepnoto/design-constants";

const states: Array<{
  label: string;
  value?: string;
  disabled?: boolean;
  visualState?: LargeTextFieldVisualState;
}> = [
  { label: "Default" },
  { label: "Focused", visualState: "focused" },
  { label: "With value", value: "Useful reference for the auth flow I want to revisit before wiring the side project." },
  { label: "Near limit", value: "A".repeat(SAVED_REASON_INPUT_MAX_LENGTH - 18) },
  { label: "Disabled", disabled: true, value: "Already saved with context." },
];

const meta = {
  title: "Product/Atoms/LargeTextField",
  component: LargeTextField,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LargeTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

function StatefulLargeTextField({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <LargeTextField
      aria-label="Why saved"
      maxLength={SAVED_REASON_INPUT_MAX_LENGTH}
      onChange={(event) => setValue(event.currentTarget.value)}
      placeholder="Why will this link be useful later?"
      value={value}
    />
  );
}

export const States: Story = {
  render: () => (
    <div className="flex w-[var(--save-link-dialog-width)] flex-col gap-[var(--space-12)] bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      {states.map((state) => (
        <div key={state.label} className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-[var(--space-16)]">
          <div className="pt-[var(--space-16)] type-12-semibold text-[var(--content-muted)]">{state.label}</div>
          {state.disabled || state.visualState ? (
            <LargeTextField
              aria-label={state.label}
              defaultValue={state.value}
              disabled={state.disabled}
              maxLength={SAVED_REASON_INPUT_MAX_LENGTH}
              placeholder="Why will this link be useful later?"
              visualState={state.visualState}
            />
          ) : (
            <StatefulLargeTextField defaultValue={state.value} />
          )}
        </div>
      ))}
    </div>
  ),
};
