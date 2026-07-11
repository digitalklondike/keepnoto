# Keepnoto UI Architecture

This document defines how Keepnoto UI should be structured before product screens are built. Keep it practical: create shared foundations first, then compose them into product experiences.

## Design System Flow

Build UI in this order:

1. Design tokens first.
2. Base components second.
3. Composed Keepnoto/product components third.
4. App pages last.
5. Storybook stories alongside reusable components.

Tokens and reusable components should exist before product pages so visual decisions are consistent instead of copied page by page.

## Token System

- Use CSS variables and tokens for visual values.
- Avoid hardcoded colors in components.
- Prefer semantic tokens such as background, surface, text, muted text, border, accent, danger, and focus over raw color names.

## Component Layers

### Base Components

Base components are reusable primitives with clear variants, states, and accessibility behavior:

- Button
- IconButton
- Input
- Textarea
- Select
- Badge
- Tag
- Card
- Modal
- Dropdown
- Tooltip
- Tabs

### Composed Keepnoto Components

Composed components express Keepnoto product patterns and should be built from tokens and base components:

- LinkCard
- CollectionCard
- WhySavedBlock
- TagList
- EmptyState
- SearchBar
- FilterBar
- AppShell
- Sidebar
- TopBar

Page-level components should compose reusable components instead of duplicating UI patterns.

## Storybook Rules

Storybook is the required visual workshop for the Keepnoto design system.

- Document reusable UI components in Storybook.
- Every important reusable component should eventually have a Storybook story.
- Stories should cover variants, sizes, states, and edge cases.
- Keep Storybook focused on reusable components and patterns.
- Do not turn Storybook into a dumping ground for full product pages.

## Styling Rules

- Prefer tokens and reusable classes or components.
- Avoid random one-off styles.
- Avoid page-specific visual decisions that should belong to the design system.
- Do not hardcode random colors, shadows, radii, or spacing in components.
- If a visual pattern repeats, make it reusable.
- Keep component styling aligned with `DESIGN_DIRECTION.md` and `.agents/skills/keepnoto-visual-design/SKILL.md`.

## Build Order

1. Define the token structure.
2. Build base components.
3. Add Storybook stories for base components.
4. Build Keepnoto-specific composed components.
5. Add Storybook stories for composed components.
6. Build product pages from reusable components.

This order keeps Keepnoto calm, consistent, and easier to evolve as the product grows.