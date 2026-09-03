---
name: ux-design-guidelines
description: Create or maintain a project design system or style guide covering tokens, components, layout, and interaction patterns.
---

# UX Design Guidelines

## Purpose

Use this skill to create a new design system document or update an existing one. The output is a structured Markdown file that serves as the authoritative reference for the project's visual and interaction standards.

## Trigger Conditions

Use when the user asks to:

- create a design system, style guide, or design guidelines document
- add or update a component pattern in an existing design system
- define or refresh design tokens (colours, typography, spacing)
- document interaction patterns or voice and tone standards

## Inputs

Ask for the following when not already provided:

- **Project name** — used in the document title and file name
- **Existing guidelines path** — if updating an existing document, provide the path
- **Brand assets** — primary brand colours, font families, logo guidelines (if available)
- **Platform** — web, mobile, or multi-platform?
- **Scope** — full design system, tokens only, or specific sections to add or update?
- **Output location** — where should the document be saved? (default: `docs/design/design-guidelines.md`)

## Required Resources

Load and apply before generating:

1. `instructions/ux/ux-global-instructions.md`
2. `instructions/ux/design-guidelines-instructions.md`
3. `resources/design/design-principles.md`

### Optional — `/impeccable`

If the `impeccable` skill is installed, invoke `/impeccable` before drafting design token values and component patterns. Use its UI-craft guidance to inform the choices. If not installed, apply the built-in design principles resource as the primary reference.

## Workflow

1. **Confirm the scope**
   - New document or update to an existing one?
   - Which sections are in scope for this session?

2. **Gather brand inputs**
   - If brand colours or fonts are provided, use them.
   - If not, use accessible neutral defaults and mark with `[TODO: define brand tokens]`.

3. **Draft or update the document**
   - Follow the document structure template from `design-guidelines-instructions.md`.
   - For each section, apply the quality rules from that instruction file.
   - Mark missing content with `[TODO: define]` rather than inventing values.

4. **Validate completeness**
   - Run through the quality checklist from `design-guidelines-instructions.md`.
   - Flag any missing required sections explicitly.

5. **Save and confirm**
   - Save to the agreed location.
   - Report which sections were created, updated, or left as TODO.

## Output

- One primary `design-guidelines.md` document (or update to an existing file)
- Short confirmation note: output path, sections covered, and any `[TODO: define]` items

## Quality Checks

- [ ] Colour palette with hex codes and usage rules is present.
- [ ] Typography scale with sizes and weights is defined.
- [ ] Spacing scale with base unit and named steps is documented.
- [ ] At least one component pattern is fully specified with states and variants.
- [ ] Breakpoints are named with pixel ranges.
- [ ] Voice and tone section has at least two concrete copy examples.
- [ ] Missing sections are marked with `[TODO: define]`, not omitted silently.
