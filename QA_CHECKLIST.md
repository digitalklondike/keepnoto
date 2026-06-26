# Keepnoto QA Checklist

Use this checklist before finishing development work. Run checks when they are relevant to the files changed, and explain any skipped checks.

## Required Checks When Relevant

Use Windows-safe PowerShell commands:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run storybook`
- `npm.cmd run build-storybook`

Run Storybook checks after Storybook, design system, or reusable UI component changes. Use `npm.cmd run storybook` to verify Storybook starts, and `npm.cmd run build-storybook` before committing major design system work.

## UI Quality Checks

For UI changes, verify:

- Layout is not broken.
- Responsive behavior is acceptable.
- Spacing is consistent.
- Typography hierarchy is clear.
- Hover, focus, active, and disabled states are considered.
- Empty, loading, and error states are considered when relevant.
- Light and dark theme compatibility is checked once themes exist.
- UI follows `DESIGN_DIRECTION.md` and `.agents/skills/keepnoto-visual-design/SKILL.md`.

## Storybook Checks

- Reusable components should eventually have stories.
- Stories should show important variants and states.
- Storybook should start successfully after Storybook-related changes.
- `npm.cmd run build-storybook` should pass before committing major design system work.
- Storybook should remain focused on reusable components and patterns, not full product page dumping.

## Code Quality Checks

- No random hardcoded colors, spacing, shadows, or radii when tokens/components should be used.
- No duplicated one-off components when a reusable component makes sense.
- No unnecessary dependencies without asking.
- No console errors.
- No TypeScript errors.
- Keep changes scoped to the task.

## Git And Reporting Checklist

After each task, report:

- Changed files.
- What was done.
- How to test.
- Checks run.
- Checks not run and why.
- Risks or follow-up questions.

Prefer Windows / VS Code PowerShell command examples in reports and instructions.