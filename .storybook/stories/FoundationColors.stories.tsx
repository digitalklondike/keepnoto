import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const colors = [
  ["Background", "var(--background)", "App canvas"],
  ["Foreground", "var(--foreground)", "Primary text"],
  ["Surface", "var(--surface)", "Quiet layout bands"],
  ["Raised", "var(--surface-raised)", "Cards and panels"],
  ["Primary", "var(--primary)", "Primary action and selection"],
  ["Accent", "var(--accent)", "Warm emphasis"],
  ["Muted", "var(--muted)", "Subtle controls"],
  ["Note", "var(--note)", "Saved reason surface"],
  ["Success", "var(--success)", "Positive state"],
  ["Warning", "var(--warning)", "Attention state"],
  ["Destructive", "var(--destructive)", "Destructive state"],
  ["Border", "var(--border)", "Dividers and outlines"],
] as const;

const meta = {
  title: "Foundation/Colors",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <main className="min-h-dvh bg-background p-8 text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="space-y-2">
          <Badge variant="secondary">Keepnoto tokens</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Warm, quiet color system
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            shadcn variables stay intact while Keepnoto adds semantic surfaces
            for saved links, collections, and saved-reason notes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map(([name, value, description]) => (
            <Card key={name} className="shadow-soft">
              <CardHeader>
                <div
                  className="h-20 rounded-lg border"
                  style={{ background: value }}
                />
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {value}
                </code>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Palette: Story = {};
