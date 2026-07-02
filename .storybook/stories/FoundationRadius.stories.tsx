import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const radii = [
  ["8", "var(--radius-8)"],
  ["10", "var(--radius-10)"],
  ["12", "var(--radius-12)"],
  ["16", "var(--radius-16)"],
  ["20", "var(--radius-20)"],
  ["round", "var(--radius-round)"],
] as const;

const meta = {
  title: "Foundation/Radius",
  parameters: {
    layout: "centered",
  },
  render: () => (
    <section className="w-[min(760px,calc(100vw-2rem))] space-y-[var(--space-24)] text-foreground">
      <div>
        <h1 className="type-title">Radius</h1>
        <p className="mt-[var(--space-8)] type-16 text-[var(--content-muted)]">
          Primitive radius values: numeric corners plus one fully round value.
        </p>
      </div>

      <div className="grid gap-[var(--space-16)] sm:grid-cols-2 lg:grid-cols-3">
        {radii.map(([name, value]) => (
          <div key={name} className="space-y-[var(--space-8)]">
            <div
              className="h-24 border border-[var(--border-soft)] bg-[var(--panel-surface)] shadow-soft"
              style={{ borderRadius: value }}
            />
            <div>
              <p className="type-16-semibold">radius-{name}</p>
              <code className="type-12 text-[var(--content-muted)]">{value}</code>
            </div>
          </div>
        ))}
      </div>
    </section>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scale: Story = {};