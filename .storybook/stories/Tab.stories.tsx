import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tab, type VisualState } from "@/components/keepnoto/product-components";

const states: Array<{
  label: string;
  visualState: VisualState;
  selected?: boolean;
  disabled?: boolean;
  hasMenu?: boolean;
  showHash?: boolean;
  count?: number;
  children: string;
}> = [
  { label: "Default tag", visualState: "default", showHash: true, count: 31, children: "design" },
  { label: "Hover tag", visualState: "hover", showHash: true, count: 31, children: "design" },
  { label: "Pressed tag", visualState: "pressed", showHash: true, count: 31, children: "design" },
  { label: "Selected tag", visualState: "default", selected: true, showHash: true, count: 31, children: "design" },
  { label: "Disabled tag", visualState: "default", disabled: true, showHash: true, count: 31, children: "design" },
  { label: "All links", visualState: "default", selected: true, children: "All links" },
  { label: "More", visualState: "default", hasMenu: true, children: "More" },
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
    <div className="bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      <div className="grid grid-cols-[112px_220px] items-center gap-[var(--space-12)]">
        {states.map((state) => (
          <div key={state.label} className="contents">
            <div className="type-12-semibold text-[var(--content-muted)]">{state.label}</div>
            <Tab
              visualState={state.visualState}
              selected={state.selected}
              disabled={state.disabled}
              hasMenu={state.hasMenu}
              showHash={state.showHash}
              count={state.count}
            >
              {state.children}
            </Tab>
          </div>
        ))}
      </div>
    </div>
  ),
};