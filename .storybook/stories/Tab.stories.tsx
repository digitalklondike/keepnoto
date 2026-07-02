import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tab, type VisualState } from "@/components/keepnoto/product-components";

const states: Array<{ label: string; visualState: VisualState; selected?: boolean; disabled?: boolean; hasMenu?: boolean }> = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Selected", visualState: "default", selected: true },
  { label: "Disabled", visualState: "default", disabled: true },
  { label: "More", visualState: "default", hasMenu: true },
];

const meta = {
  title: "Product/Atoms/Tab",
  component: Tab,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="bg-transparent p-6 text-[var(--content-primary)]">
      <div className="grid grid-cols-[96px_160px] items-center gap-3">
        {states.map((state) => (
          <div key={state.label} className="contents">
            <div className="text-xs font-medium text-[var(--content-muted)]">{state.label}</div>
            <Tab
              visualState={state.visualState}
              selected={state.selected}
              disabled={state.disabled}
              hasMenu={state.hasMenu}
            >
              {state.hasMenu ? "More" : "auth"}
            </Tab>
          </div>
        ))}
      </div>
    </div>
  ),
};

