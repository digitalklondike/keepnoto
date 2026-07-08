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
<!-- BEGIN:keepnoto-context7-rules -->
# Context7 usage

Use Context7 before changing or configuring external libraries, frameworks, or APIs where documentation may change over time.

Use Context7 for Next.js routing, App Router, metadata, server/client component patterns; Storybook setup, addons, stories, preview/main configuration; React patterns that depend on current library behavior; animation libraries such as Motion or Framer Motion; UI, icon, form, and validation libraries; authentication, database, storage, payments, or API integrations; and dependency installation, upgrades, or configuration changes.

Do not use Context7 for simple copy changes, project documentation edits, local product decisions, or visual direction decisions.

When Context7 is used, the final report must mention what documentation was checked and what decision it informed.
<!-- END:keepnoto-context7-rules -->
<!-- BEGIN:keepnoto-qa-rules -->
# QA Rules

Before finishing any development task, read `QA_CHECKLIST.md`.

After every task, report which checks were run. If a check was not run, explain why.

Use Windows-safe commands in reports and instructions because this project is developed on Windows / VS Code PowerShell. Prefer commands such as `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run storybook`, and `npm.cmd run build-storybook`.
<!-- END:keepnoto-qa-rules -->
<!-- BEGIN:keepnoto-design-rules -->
# Design Skill Usage

Do not change app code when the task is only to create or update agent instructions or skills.

Keepnoto project docs, tokens, components, layout direction, and Storybook are the design system source of truth. Never let a skill replace Keepnoto colors, typography, spacing, components, layout, product decisions, or tokens unless explicitly requested.

Before UI work, read `DESIGN_DIRECTION.md`, `UI_ARCHITECTURE.md`, and `.agents/skills/keepnoto-visual-design/SKILL.md`.

Use design skills by role, not all at once for normal UI tasks:

- Impeccable: primary UI critique and polish layer for hierarchy, layout, spacing, visual quality, and interaction clarity.
- Taste Skill: anti-slop frontend check only; use it to detect generic AI-looking patterns, not to create a new design direction.
- Emil Kowalski: motion only; use for animation, transitions, easing, hover states, enter/exit states, and animation review.

Prefer small targeted improvements over full redesigns. When building new UI, use existing Keepnoto tokens and components first. If a missing reusable pattern is needed, document it and add it to the design system before using it in product screens.

Keep Storybook components and design tokens as the implementation source of truth.

Before finishing UI work, run a visual review pass for hierarchy, spacing, typography, contrast, responsiveness, empty states, hover/focus states, and whether the screen feels like Keepnoto rather than generic SaaS.

After each task, report changed files, what was done, how to test, checks run, checks not run and why, and risks or follow-up questions.
<!-- END:keepnoto-design-rules -->