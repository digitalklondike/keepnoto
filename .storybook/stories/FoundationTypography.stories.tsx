import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const typeRows = [
  {
    name: "Title",
    className: "type-title",
    spec: "28 / 36, 500",
    sample: "Library",
  },
  {
    name: "16 Regular",
    className: "type-16",
    spec: "16 / 21, 400",
    sample: "Readable interface text",
  },
  {
    name: "16 Semibold",
    className: "type-16-semibold",
    spec: "16 / 20, 600",
    sample: "Supabase Auth - Documentation",
  },
  {
    name: "12 Regular",
    className: "type-12",
    spec: "12 / 16, 400",
    sample: "supabase.com/docs/guides/auth",
  },
  {
    name: "12 Semibold",
    className: "type-12-semibold",
    spec: "12 / 16, 600",
    sample: "auth",
  },
];

const meta = {
  title: "Foundation/Typography",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <main className="min-h-dvh p-[var(--space-32)] text-[var(--content-primary)]">
      <section className="mx-auto flex max-w-[920px] flex-col gap-[var(--space-24)]">
        <header className="flex flex-col gap-[var(--space-8)]">
          <p className="type-12-semibold uppercase text-[var(--content-muted)]">Typography</p>
          <h1 className="type-title">Inter UI type scale</h1>
          <p className="type-16 max-w-[680px] text-[var(--content-muted)]">
            The UI uses one compact scale: title, 16 regular/semibold, and 12 regular/semibold.
          </p>
        </header>

        <div className="overflow-hidden rounded-[var(--radius-16)] bg-[var(--panel-surface)] backdrop-blur-[var(--blur-soft)]">
          <div className="grid grid-cols-[160px_180px_160px_1fr] gap-[var(--space-16)] border-b border-[var(--border-soft)] px-[var(--space-24)] py-[var(--space-16)] type-12 text-[var(--content-muted)]">
            <span>Name</span>
            <span>Class</span>
            <span>Spec</span>
            <span>Sample</span>
          </div>
          {typeRows.map((row) => (
            <div
              key={row.className}
              className="grid grid-cols-[160px_180px_160px_1fr] items-center gap-[var(--space-16)] border-b border-[var(--border-soft)] px-[var(--space-24)] py-[var(--space-16)] last:border-b-0"
            >
              <span className="type-12 text-[var(--content-muted)]">{row.name}</span>
              <code className="type-12 text-[var(--content-muted)]">.{row.className}</code>
              <span className="type-12 text-[var(--content-muted)]">{row.spec}</span>
              <span className={row.className}>{row.sample}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TypeScale: Story = {};