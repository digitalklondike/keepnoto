import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const radii = [
  ["sm", "var(--radius-sm)"],
  ["md", "var(--radius-md)"],
  ["lg", "var(--radius-lg)"],
  ["xl", "var(--radius-xl)"],
  ["2xl", "var(--radius-2xl)"],
] as const;

const meta = {
  title: "Foundation/Radius",
  parameters: {
    layout: "centered",
  },
  render: () => (
    <section className="w-[min(760px,calc(100vw-2rem))] space-y-6 text-foreground">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Soft radius scale</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Keepnoto uses gentle corners for product surfaces, with pills reserved
          for compact labels and icon controls.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {radii.map(([name, value]) => (
          <div key={name} className="space-y-3">
            <div
              className="h-28 border bg-card shadow-soft"
              style={{ borderRadius: value }}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">radius-{name}</p>
              <code className="text-xs text-muted-foreground">{value}</code>
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
