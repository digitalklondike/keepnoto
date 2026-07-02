import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const meta = {
  title: "Foundation/Typography",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <main className="min-h-dvh bg-background p-8 text-foreground">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Badge variant="secondary">Inter UI system</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight">
              Saved links should feel useful before they feel organized.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Inter is the only UI font. The scale stays restrained and readable
              for a product where users scan titles, metadata, and saved context.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Label</p>
            <p className="text-sm font-medium">Saved to Product Research</p>
            <p className="text-base">A readable body line for link summaries.</p>
            <p className="text-lg font-semibold">A strong saved-link title.</p>
            <p className="text-2xl font-semibold tracking-tight">
              A calm section heading
            </p>
          </div>
        </div>
        <Card className="self-start bg-note text-note-foreground shadow-card">
          <CardContent className="space-y-3 pt-6">
            <p className="text-xs font-medium text-note-foreground/70">
              Saved reason note
            </p>
            <p className="font-saved-reason text-3xl leading-snug">
              Save this for the onboarding teardown. The empty state has the
              right amount of guidance without feeling heavy.
            </p>
            <p className="text-sm text-note-foreground/75">
              Caveat is reserved for handwritten saved-reason text only.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TypeScale: Story = {};
