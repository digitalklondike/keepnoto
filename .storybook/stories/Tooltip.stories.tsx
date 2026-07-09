import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tooltip, TooltipSurface, type TooltipSide } from "@/components/keepnoto/tooltip";
import { Tag } from "@/components/keepnoto/product-components";

const sides: TooltipSide[] = ["top", "right", "bottom", "left"];
const triggerClassName = "inline-flex h-[var(--size-40)] items-center justify-center rounded-[var(--radius-round)] bg-[var(--control-surface)] px-[var(--space-16)] type-12-semibold text-[var(--content-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]";

const meta = {
  title: "Product/Atoms/Tooltip",
  component: TooltipSurface,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Tooltip is a small informational surface. The surface max-width is 320px by specification; long text wraps inside it. Placement is handled by Tooltip with top, right, bottom, and left sides, with collision flip/shift behavior.",
      },
    },
  },
} satisfies Meta<typeof TooltipSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Surface: Story = {
  render: () => (
    <div className="flex p-[var(--space-48)]">
      <TooltipSurface>Tooltip label</TooltipSurface>
    </div>
  ),
};

export const Hover: Story = {
  render: () => (
    <div className="flex p-[var(--space-48)]">
      <Tooltip label="Appears on hover" side="top">
        <button type="button" className={triggerClassName}>
          Hover target
        </button>
      </Tooltip>
    </div>
  ),
};

export const Directions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-[var(--space-48)] p-[var(--space-48)]">
      {sides.map((side) => (
        <Tooltip key={side} label={`${side} tooltip`} side={side}>
          <button type="button" className={triggerClassName}>
            {side}
          </button>
        </Tooltip>
      ))}
    </div>
  ),
};
export const Interactive: Story = {
  render: () => (
    <div className="flex p-[var(--space-48)]">
      <Tooltip
        interactive
        label={
          <div className="flex flex-col items-start gap-[var(--space-8)]">
            {["frontend", "docs", "supabase"].map((tag) => (
              <Tag key={tag} aria-label={`Filter by ${tag}`} onClick={() => undefined}>
                {tag}
              </Tag>
            ))}
          </div>
        }
        side="top"
      >
        <button type="button" className={triggerClassName}>
          +3
        </button>
      </Tooltip>
    </div>
  ),
};