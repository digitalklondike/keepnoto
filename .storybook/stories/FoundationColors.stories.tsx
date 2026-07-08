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
  ["Saved Reason Ink", "var(--saved-reason-ink)", "Handwritten saved-reason annotation"],
  ["Add Tag Fill", "var(--add-tag-fill)", "Dashed add-tag chip background"],
] as const;

const meta = {
  title: "Foundation/Colors",
  parameters: { layout: "fullscreen" },
  render: () => (
    <main className="min-h-dvh p-[var(--space-32)] text-[var(--content-primary)]">
      <section className="mx-auto flex max-w-5xl flex-col gap-[var(--space-24)]">
        <div>
          <h1 className="type-title">Color tokens</h1>
          <p className="mt-[var(--space-8)] type-16 text-[var(--content-muted)]">
            Tokens used to match the selected Keepnoto library frame.
          </p>
        </div>
        <div className="grid gap-[var(--space-16)] sm:grid-cols-2 lg:grid-cols-3">
          {colors.map(([name, value, description]) => (
            <article key={name} className="rounded-[var(--radius-16)] bg-[var(--panel-surface)] p-[var(--space-16)] backdrop-blur-[var(--blur-soft)]">
              <div className="h-20 rounded-[var(--radius-12)] border border-[var(--border-soft)]" style={{ background: value }} />
              <h2 className="mt-[var(--space-16)] type-16-semibold">{name}</h2>
              <p className="mt-[var(--space-4)] type-12 text-[var(--content-muted)]">{description}</p>
              <code className="mt-[var(--space-12)] inline-flex rounded-[var(--radius-10)] bg-[var(--control-surface)] px-[var(--space-8)] py-[var(--space-4)] type-12 text-[var(--content-muted)]">
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


