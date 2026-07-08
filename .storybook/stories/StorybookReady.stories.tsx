import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Infrastructure/Storybook Ready",
  parameters: {
    layout: "centered",
  },
  render: () => (
    <main className="max-w-sm rounded-[var(--radius-16)] border border-[var(--border-soft)] bg-[var(--panel-surface)] p-[var(--space-24)] text-[var(--content-primary)] shadow-[var(--shadow-soft)]">
      <p className="type-12-semibold uppercase text-[var(--content-muted)]">
        Keepnoto Storybook
      </p>
      <h1 className="mt-[var(--space-8)] type-title">Ready for design system work</h1>
      <p className="mt-[var(--space-12)] type-16 text-[var(--content-muted)]">
        This placeholder confirms Storybook loads the app global styles. Replace it when real shared components are added.
      </p>
    </main>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};