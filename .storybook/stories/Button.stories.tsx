import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button, type ButtonTone, type VisualState } from "@/components/keepnoto/product-components";

const tones: Array<{ label: string; tone: ButtonTone; text: string }> = [
  { label: "Primary", tone: "primary", text: "Save link" },
  { label: "Secondary", tone: "secondary", text: "Edit" },
  { label: "Secondary danger", tone: "secondaryDanger", text: "Delete" },
  { label: "Ghost", tone: "ghost", text: "Cancel" },
];

const states: Array<{ label: string; visualState: VisualState; disabled?: boolean }> = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Selected", visualState: "selected" },
  { label: "Disabled", visualState: "default", disabled: true },
];

const meta = {
  title: "Product/Atoms/Button",
  component: Button,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="bg-transparent p-6 text-[var(--content-primary)]">
      <div className="grid grid-cols-[160px_repeat(5,176px)] gap-3">
        <div />
        {states.map((state) => (
          <div key={state.label} className="text-xs font-medium text-[var(--content-muted)]">
            {state.label}
          </div>
        ))}
        {tones.map((tone) => (
          <div key={tone.tone} className="contents">
            <div className="flex h-12 items-center text-sm font-semibold text-[var(--content-primary)]">
              {tone.label}
            </div>
            {states.map((state) => (
              <Button
                key={`${tone.tone}-${state.label}`}
                tone={tone.tone}
                visualState={state.visualState}
                disabled={state.disabled}
                className="h-12 w-40"
              >
                {tone.text}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
};
