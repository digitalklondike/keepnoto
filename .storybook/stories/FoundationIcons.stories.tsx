import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive01Icon,
  Bookmark02Icon,
  Folder01Icon,
  Link01Icon,
  Search01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";

const icons = [
  ["Save", Bookmark02Icon],
  ["Search", Search01Icon],
  ["Collection", Folder01Icon],
  ["Source", Link01Icon],
  ["Tag", Tag01Icon],
  ["Archive", Archive01Icon],
] as const;

const meta = {
  title: "Foundation/Icons",
  parameters: {
    layout: "centered",
  },
  render: () => (
    <section className="w-[min(760px,calc(100vw-2rem))] space-y-6 text-foreground">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Rounded HugeIcons
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Use HugeIcons Stroke Rounded with soft 1.5px strokes for Keepnoto
          navigation, actions, metadata, and empty-state cues.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {icons.map(([label, icon]) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-soft"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <HugeiconsIcon
                icon={icon}
                size={20}
                color="currentColor"
                strokeWidth={1.5}
              />
            </span>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const RoundedSet: Story = {};
