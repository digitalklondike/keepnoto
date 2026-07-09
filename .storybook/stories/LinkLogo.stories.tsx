import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LinkLogo } from "@/components/keepnoto/product-components";

const logoRows = [
  {
    label: "Image",
    props: {
      src: "/mock-sites/supabase-logo.svg",
      alt: "Supabase logo",
      fallback: "Supabase",
      color: "var(--favicon-1)",
    },
  },
  {
    label: "Fallback",
    props: {
      fallback: "Linear",
      color: "var(--favicon-2)",
    },
  },
  {
    label: "Fallback dark",
    props: {
      fallback: "React",
      color: "var(--favicon-5)",
    },
  },
] as const;

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Product/Atoms/LinkLogo",
  component: LinkLogo,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LinkLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-16)] bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      <div className="grid grid-cols-[120px_repeat(3,var(--size-48))] items-center gap-[var(--space-16)]">
        <div />
        {sizes.map((size) => (
          <div key={size} className="type-12-semibold text-[var(--content-muted)]">
            {size}
          </div>
        ))}
        {logoRows.map((row) => (
          <div key={row.label} className="contents">
            <div className="type-12-semibold text-[var(--content-primary)]">{row.label}</div>
            {sizes.map((size) => (
              <LinkLogo key={`${row.label}-${size}`} {...row.props} size={size} />
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
};