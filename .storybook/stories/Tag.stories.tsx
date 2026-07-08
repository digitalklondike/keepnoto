import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tag } from "@/components/keepnoto/product-components";

type TagVisualState = "default" | "hover" | "pressed";

const variants = [
  { label: "Tag", props: { children: "auth" } },
  { label: "Long tag", props: { children: "very-long-product-research-tag" } },
  { label: "Add tag", props: { add: true, children: "+ Add tag" } },
];

const states: Array<{ label: string; visualState: TagVisualState; disabled?: boolean }> = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Disabled", visualState: "default", disabled: true },
];

const meta = {
  title: "Product/Atoms/Tag",
  component: Tag,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      <div className="grid grid-cols-[120px_repeat(4,120px)] gap-[var(--space-12)]">
        <div />
        {states.map((state) => (
          <div key={state.label} className="type-12-semibold text-[var(--content-muted)]">
            {state.label}
          </div>
        ))}
        {variants.map((variant) => (
          <div key={variant.label} className="contents">
            <div className="flex h-[var(--size-32)] items-center type-12-semibold text-[var(--content-primary)]">
              {variant.label}
            </div>
            {states.map((state) => (
              <div key={`${variant.label}-${state.label}`} className="flex h-[var(--size-32)] items-center">
                <Tag {...variant.props} visualState={state.visualState} disabled={state.disabled} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
};
