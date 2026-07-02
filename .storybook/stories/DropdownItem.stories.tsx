import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DropdownMenuItem, type DropdownMenuItemTone, type DropdownMenuItemVisualState } from "@/components/keepnoto/dropdown";
import { Icons } from "@/components/keepnoto/product-components";

const states: Array<{ label: string; visualState: DropdownMenuItemVisualState; disabled?: boolean }> = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Active", visualState: "active" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Disabled", visualState: "default", disabled: true },
];

const variants: Array<{
  label: string;
  tone?: DropdownMenuItemTone;
  icon?: typeof Icons.edit;
  endLabel?: string;
  text: string;
}> = [
  { label: "Icon + right label", icon: Icons.edit, endLabel: "E", text: "Edit link" },
  { label: "Icon only", icon: Icons.external, text: "Open link" },
  { label: "Right label only", endLabel: "12", text: "Recently saved" },
  { label: "Text only", text: "Copy URL" },
  { label: "Danger", tone: "danger", icon: Icons.archive, text: "Delete link" },
];

const meta = {
  title: "Product/Atoms/Dropdown Item",
  component: DropdownMenuItem,
  parameters: { layout: "centered" },
} satisfies Meta<typeof DropdownMenuItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="min-h-screen p-[var(--space-32)] text-[var(--content-primary)]">
      <div className="flex w-[520px] flex-col gap-[var(--space-24)] rounded-[var(--radius-20)] border border-[var(--border-soft)] bg-[var(--workbench-panel)] p-[var(--space-24)] shadow-[var(--shadow-card)] backdrop-blur-md">
        {variants.map((variant) => (
          <section key={variant.label} className="flex flex-col gap-[var(--space-8)]">
            <h3 className="type-12-semibold text-[var(--content-muted)]">{variant.label}</h3>
            <div className="flex w-[360px] flex-col gap-[var(--space-4)] rounded-[var(--radius-16)] bg-[var(--workbench-panel-soft)] p-[var(--space-8)]">
              {states.map((state) => (
                <div key={`${variant.label}-${state.label}`} className="flex items-center gap-[var(--space-12)]">
                  <span className="w-16 shrink-0 type-12 text-[var(--content-muted)]">{state.label}</span>
                  <DropdownMenuItem
                    renderAs="div"
                    icon={variant.icon}
                    endLabel={variant.endLabel}
                    tone={variant.tone}
                    visualState={state.visualState}
                    disabled={state.disabled}
                    className="w-[260px]"
                  >
                    {variant.text}
                  </DropdownMenuItem>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  ),
};