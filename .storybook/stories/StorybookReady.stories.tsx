import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Infrastructure/Storybook Ready",
  parameters: {
    layout: "centered",
  },
  render: () => (
    <main className="max-w-sm rounded-lg border border-neutral-200 bg-white p-6 text-neutral-900 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
        Keepnoto Storybook
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Ready for design system work</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600">
        This placeholder confirms Storybook loads the app global styles. Replace it when real shared components are added.
      </p>
    </main>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};