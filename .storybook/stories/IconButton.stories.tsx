import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { IconButton, Icons, type ButtonTone, type IconButtonSurface, type VisualState } from "@/components/keepnoto/product-components";

const pageTones: Array<{ label: string; tone: ButtonTone; icon: typeof Icons.link }> = [
  { label: "Primary", tone: "primary", icon: Icons.external },
  { label: "Secondary", tone: "secondary", icon: Icons.bookmark },
  { label: "Secondary danger", tone: "secondaryDanger", icon: Icons.archive },
  { label: "Ghost", tone: "ghost", icon: Icons.share },
];

const cardTones: Array<{ label: string; tone: ButtonTone; icon: typeof Icons.link }> = [
  { label: "Primary", tone: "primary", icon: Icons.external },
  { label: "Secondary", tone: "secondary", icon: Icons.bookmark },
  { label: "Secondary danger", tone: "secondaryDanger", icon: Icons.archive },
];

const states: Array<{ label: string; visualState: VisualState; active?: boolean; disabled?: boolean }> = [
  { label: "Default", visualState: "default" },
  { label: "Hover", visualState: "hover" },
  { label: "Pressed", visualState: "pressed" },
  { label: "Selected", visualState: "default", active: true },
  { label: "Disabled", visualState: "default", disabled: true },
];

const surfaces: Array<{
  label: string;
  surface: IconButtonSurface;
  description: string;
  tones: Array<{ label: string; tone: ButtonTone; icon: typeof Icons.link }>;
}> = [
  {
    label: "Page surface",
    surface: "page",
    description: "On the paper/page background: quiet controls stay transparent.",
    tones: pageTones,
  },
  {
    label: "Card surface",
    surface: "card",
    description: "Inside a card/panel: controls get a soft white surface. Ghost is not used here.",
    tones: cardTones,
  },
];

const meta = {
  title: "Product/Atoms/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-40)] bg-transparent p-[var(--space-24)] text-[var(--content-primary)]">
      {surfaces.map((surface) => (
        <section key={surface.surface} className="flex flex-col gap-[var(--space-16)]">
          <div className="flex flex-col gap-[var(--space-4)]">
            <h3 className="type-16-semibold text-[var(--content-primary)]">{surface.label}</h3>
            <p className="type-12 text-[var(--content-muted)]">{surface.description}</p>
          </div>
          <div className="grid grid-cols-[168px_repeat(5,72px)] gap-[var(--space-12)]">
            <div />
            {states.map((state) => (
              <div key={state.label} className="type-12-semibold text-[var(--content-muted)]">
                {state.label}
              </div>
            ))}
            {surface.tones.map((tone) => (
              <div key={`${surface.surface}-${tone.tone}`} className="contents">
                <div className="flex h-[var(--size-48)] items-center type-12-semibold text-[var(--content-primary)]">
                  {tone.label}
                </div>
                {states.map((state) => (
                  <IconButton
                    key={`${surface.surface}-${tone.tone}-${state.label}`}
                    icon={tone.icon}
                    label={`${surface.label} ${tone.label} ${state.label}`}
                    tone={tone.tone}
                    surface={surface.surface}
                    visualState={state.visualState}
                    active={state.active}
                    disabled={state.disabled}
                    tooltipSide="right"
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-[var(--space-16)]">
        <div className="flex flex-col gap-[var(--space-4)]">
          <h3 className="type-16-semibold text-[var(--content-primary)]">Plain icon</h3>
          <p className="type-12 text-[var(--content-muted)]">No background, default tone only. Tooltip can be disabled separately.</p>
        </div>
        <div className="grid grid-cols-[168px_repeat(5,72px)] items-center gap-[var(--space-12)]">
          <div />
          {states.map((state) => (
            <div key={state.label} className="type-12-semibold text-[var(--content-muted)]">
              {state.label}
            </div>
          ))}
          <div className="flex h-[var(--size-48)] items-center type-12-semibold text-[var(--content-primary)]">
            Default
          </div>
          {states.map((state) => (
            <IconButton
              key={`plain-${state.label}`}
              icon={Icons.share}
              label={`Plain icon ${state.label}`}
              mode="plain"
              visualState={state.visualState}
              active={state.active}
              disabled={state.disabled}
              tooltipSide="right"
            />
          ))}
        </div>
        <div className="flex items-center gap-[var(--space-16)]">
          <span className="w-[168px] type-12-semibold text-[var(--content-primary)]">Tooltip disabled</span>
          <IconButton icon={Icons.share} label="Plain icon without tooltip" mode="plain" tooltip={false} />
        </div>
      </section>
    </div>
  ),
};