<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


<!-- BEGIN:keepnoto-project-docs -->
# Keepnoto Project Docs

Keepnoto project docs are the source of truth over generic assumptions.

Before product decisions, read `PROJECT_BRIEF.md` and `PRODUCT_PRINCIPLES.md`.

Before planning features, read `MVP_SCOPE.md`.

Before design system work, read `UI_ARCHITECTURE.md`.

Before UI work, read `DESIGN_DIRECTION.md`, `UI_ARCHITECTURE.md`, and `.agents/skills/keepnoto-visual-design/SKILL.md`.

Storybook is the required place to document reusable UI components. Every important reusable component should eventually have a Storybook story.

Create tokens and reusable components before product pages.
<!-- END:keepnoto-project-docs -->
<!-- BEGIN:keepnoto-qa-rules -->
# QA Rules

Before finishing any development task, read `QA_CHECKLIST.md`.

After every task, report which checks were run. If a check was not run, explain why.

Use Windows-safe commands in reports and instructions because this project is developed on Windows / VS Code PowerShell. Prefer commands such as `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run storybook`, and `npm.cmd run build-storybook`.
<!-- END:keepnoto-qa-rules -->
<!-- BEGIN:keepnoto-design-rules -->
# Skill Usage Rules

Do not change app code when the task is only to create or update agent instructions or skills.

For any UI, layout, component, or page work, read `.agents/skills/keepnoto-visual-design/SKILL.md` before making changes. This skill is the product-specific source of truth for Keepnoto UI style.

Use Impeccable and Taste skills as general visual quality layers:

- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/design-taste-frontend/SKILL.md`
- `.agents/skills/gpt-taste/SKILL.md`

Use these for visual polish, hierarchy, spacing, typography, accessibility, and interaction quality. For redesigning an already existing screen, also use `.agents/skills/redesign-existing-projects/SKILL.md`.

Do not blindly follow external or general design skill advice when it conflicts with Keepnoto's visual direction. Keepnoto's product direction always wins over generic advice.

Before finishing UI work, run a visual review pass for:

- Visual hierarchy
- Spacing
- Typography
- Contrast
- Responsiveness
- Empty states
- Hover and focus states
- Whether the screen feels like Keepnoto, not generic SaaS

After each task, report:

- Changed files
- What was done
- How to test
- Checks run
- Checks not run and why
- Risks or follow-up questions
<!-- END:keepnoto-design-rules -->