import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const shadows = [
  ["Soft", "var(--shadow-soft)", "Bare separation for quiet controls"],
  ["Card", "var(--shadow-card)", "Saved-link and collection surfaces"],
  ["Panel", "var(--shadow-panel)", "Floating panels and overlays"],
] as const;

const meta = {
  title: "Foundation/Shadows",
  parameters: {
    layout: "centered",
  },
  render: () => (
    <section className="w-[min(860px,calc(100vw-2rem))] space-y-6 text-foreground">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Quiet depth</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Shadows are warm and restrained. They clarify hierarchy without making
          saved-link surfaces feel glossy or noisy.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {shadows.map(([name, value, description]) => (
          <article
            key={name}
            className="rounded-xl border bg-card p-5"
            style={{ boxShadow: value }}
          >
            <p className="text-base font-semibold">{name}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            <code className="mt-4 block text-xs text-muted-foreground">
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
