import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const colors = [
  ["Canvas Start", "var(--canvas-start)", "Canvas gradient start"],
  ["Canvas End", "var(--canvas-end)", "Canvas gradient end"],
  ["Content Primary", "var(--content-primary)", "Primary text and icons"],
  ["Content Muted", "var(--content-muted)", "Secondary text"],
  ["Border Soft", "var(--border-soft)", "Chip borders"],
  ["Divider Subtle", "var(--divider-subtle)", "Barely visible separators"],
  ["Panel Glass", "var(--panel-surface)", "Main glass panels"],
  ["Control Glass", "var(--control-surface)", "Secondary controls"],
  ["Primary Start", "var(--accent-start)", "Action gradient start"],
  ["Primary End", "var(--accent-end)", "Action gradient end"],
  ["Danger", "var(--danger)", "Delete action text"],
  ["Tag Fill", "var(--tag-fill)", "Saved-link and metadata tag chips"],
  ["Add Tag Fill", "var(--add-tag-fill)", "Dashed add-tag chip background"],
] as const;

const meta = {
  title: "Foundation/Colors",
  parameters: { layout: "fullscreen" },
  render: () => (
    <main className="min-h-dvh p-8 text-[var(--content-primary)]">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-medium leading-8">Color tokens</h1>
          <p className="mt-2 text-base text-[var(--content-muted)]">
            Tokens used to match the selected Keepnoto library frame.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map(([name, value, description]) => (
            <article key={name} className="rounded-[var(--radius-16)] bg-[var(--panel-surface)] p-4 backdrop-blur-[1px]">
              <div className="h-20 rounded-[var(--radius-12)] border border-[var(--border-soft)]" style={{ background: value }} />
              <h2 className="mt-4 text-base font-semibold">{name}</h2>
              <p className="mt-1 text-sm text-[var(--content-muted)]">{description}</p>
              <code className="mt-3 inline-flex rounded-[var(--radius-10)] bg-[var(--control-surface)] px-2 py-1 text-xs text-[var(--content-muted)]">
                {value}
              </code>
            </article>
          ))}
        </div>
      </section>
    </main>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Palette: Story = {};


