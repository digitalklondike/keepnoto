import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const shadows = [
  ["Soft", "var(--shadow-soft)", "Bare separation for quiet controls"],
  ["Card", "var(--shadow-card)", "Saved-link and collection surfaces"],
  ["Panel", "var(--shadow-panel)", "Floating panels and overlays"],
  ["Inner white", "var(--shadow-inner-white)", "Inset highlight for white saved-link surfaces"],
] as const;

const meta = {
  title: "Foundation/Shadows",
  parameters: {
    layout: "centered",
  },
  render: () => (
    <section className="w-[min(860px,calc(100vw-2rem))] space-y-[var(--space-24)] text-foreground">
      <div>
        <h1 className="type-title">Quiet depth</h1>
        <p className="mt-[var(--space-8)] max-w-2xl type-16 text-muted-foreground">
          Shadows are warm and restrained. They clarify hierarchy without making
          saved-link surfaces feel glossy or noisy.
        </p>
      </div>
      <div className="grid gap-[var(--space-20)] md:grid-cols-4">
        {shadows.map(([name, value, description]) => (
          <article
            key={name}
            className="rounded-[var(--radius-16)] border border-[var(--border-soft)] bg-[var(--panel-surface)] p-[var(--space-20)]"
            style={{ boxShadow: value }}
          >
            <p className="type-16-semibold">{name}</p>
            <p className="mt-[var(--space-8)] type-16 text-muted-foreground">
              {description}
            </p>
            <code className="mt-[var(--space-16)] block type-12 text-muted-foreground">
              {value}
            </code>
          </article>
        ))}
      </div>
    </section>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
