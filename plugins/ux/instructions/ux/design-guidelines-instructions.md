---
applyTo: '**/design/guidelines/**'
description: Rules for authoring and maintaining design system and style guide documents.
---

# Design Guidelines Instructions

## Purpose

Define the structure, content, and quality standards for project design system and style guide documents.

## What a Design Guideline Document Must Cover

Every design guideline document must include the following sections. Mark missing sections with `[TODO: define]`.

### 1. Design Tokens

Document the foundational values the design system is built on:

- **Colour palette** — primary, secondary, neutral, semantic (success, warning, error, info) colours with hex codes and usage rules.
- **Typography** — font families, sizes (scale), weights, and line-height values. Include a clear type scale (e.g., Display, H1–H4, Body, Caption, Label).
- **Spacing scale** — base unit (e.g., 4 px or 8 px) and named steps (e.g., `xs`, `sm`, `md`, `lg`, `xl`, `2xl`).
- **Border radius** — corner radius values per component tier.
- **Elevation / shadow** — shadow depth levels (e.g., `none`, `low`, `medium`, `high`) with CSS-compatible values.
- **Motion** — duration and easing presets for transitions and animations (e.g., `fast: 150ms ease`, `standard: 300ms ease-in-out`).

### 2. Component Patterns

Document reusable UI components with:

- **Purpose** — what problem the component solves.
- **Anatomy** — named sub-elements (e.g., label, icon, helper text, error message).
- **States** — default, hover, focus, active, disabled, error, loading.
- **Variants** — size variants (sm/md/lg), type variants (filled/outlined/ghost).
- **Accessibility requirements** — ARIA role, keyboard interaction, contrast requirements.
- **Do / Don't** — concrete examples of correct and incorrect usage.

### 3. Layout and Grid

- Document the grid system: columns, gutters, and margins at each breakpoint.
- Define named breakpoints with pixel values (e.g., `mobile: 0–767px`, `tablet: 768–1023px`, `desktop: 1024px+`).
- Specify maximum content width and centring behaviour.

### 4. Interaction Patterns

- Document recurring interaction patterns: form validation, empty states, loading states, error handling, and success confirmation.
- Specify standard patterns for navigation (tabs, breadcrumbs, drawers, modals).

### 5. Iconography

- Define the icon library source and usage rules.
- Specify minimum icon size and required accessible label approach.
- Document icon colour rules relative to background.

### 6. Voice and Tone

- Define the product's language personality (e.g., friendly and direct, formal and precise).
- Provide examples of correct and incorrect copy for common UI patterns (buttons, error messages, empty states, confirmation dialogs).

## Document Structure Template

```markdown
# [Project Name] Design Guidelines

## Version and Ownership

## Design Tokens
### Colour
### Typography
### Spacing
### Elevation
### Motion

## Component Patterns
### [Component Name]

## Layout and Grid

## Interaction Patterns

## Iconography

## Voice and Tone
```

## File Naming and Storage

- When the repository has a `.design/` knowledge folder, write guidelines there as one chapter
  per topic — `design-principles.md`, `color-scheme.md`, `typography-and-layout.md`,
  `interaction-guidelines.md`, `accessibility.md`, `component-libraries.md` — each opening with
  a fenced `meta` block, and `README.md` as the entry point. Follow that folder's own
  instruction file for structure and status; do not invent a second layout beside it.
- Otherwise ask for a path, defaulting to `docs/design/`, with `design-guidelines.md` as the
  entry point and one file per topic for large systems.
- Guidelines only. Wireframes, user flows, prototypes, and screenshots are artifacts produced
  from these rules and are stored with the other deliverables, never in `.design/`.

## Quality Checks

- [ ] Colour palette documented with hex codes and usage rules.
- [ ] Typography scale defined with all size and weight values.
- [ ] Spacing scale defined with a base unit.
- [ ] Each component has states, variants, and accessibility requirements.
- [ ] Breakpoints are named and pixel ranges are explicit.
- [ ] Voice and tone section includes concrete examples.
- [ ] Missing sections are marked with `[TODO: define]`.
