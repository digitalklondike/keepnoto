import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SavedReason } from "@/components/keepnoto/product-components";

const meta = {
  title: "Product/Atoms/SavedReason",
  component: SavedReason,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SavedReason>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[var(--preview-card-demo-width)] max-w-[calc(100vw-var(--space-48))] rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)]">
      <SavedReason reason="The cleanest explanation of magic links and OAuth providers I've found. The session refresh flow finally clicked for me here - coming back when I wire auth into the side project next weekend." />
    </div>
  ),
};

export const Short: Story = {
  render: () => (
    <div className="w-[var(--preview-card-demo-width)] max-w-[calc(100vw-var(--space-48))] rounded-[var(--radius-32)] bg-[var(--panel-surface)] p-[var(--space-24)]">
      <SavedReason reason="Useful when I need the auth flow close by." />
    </div>
  ),
};
