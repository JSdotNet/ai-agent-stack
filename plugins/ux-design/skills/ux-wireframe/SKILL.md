---
name: ux-wireframe
description: Create low-, mid-, or high-fidelity wireframes as SVG or Mermaid diagrams for screens, components, or flows.
---

# UX Wireframe

## Purpose

Use this skill to produce wireframe artifacts for new screens, redesigns, or component explorations. Outputs are SVG files by default; Mermaid is the alternative for simple navigation structures.

## Trigger Conditions

Use when the user asks to:

- create a wireframe, mockup, or screen sketch
- sketch a UI layout for a feature or user story
- visualise a navigation structure or component arrangement
- produce a deliverable for design review or developer handoff

## Inputs

Ask for the following when not already provided:

- **Screen or component name** — what is being designed?
- **Platform** — web, mobile (iOS/Android), or desktop?
- **Fidelity level** — low, mid, or high?
- **User goal** — what task is the user completing on this screen?
- **Key elements** — what UI regions or components must appear?
- **Design tokens / style guide** — path to project guidelines, if available
- **Output location** — where should the SVG be saved? (default: `docs/design/wireframes/`)

## Required Resources

Load and apply before generating:

1. `instructions/ux/ux-global-instructions.md`
2. `instructions/ux/wireframe-instructions.md`
3. `resources/wireframe/wireframe-patterns.md`

If a project style guide or design guidelines document exists, load that too.

## Workflow

1. **Confirm the brief**
   - Clarify screen name, platform, fidelity, user goal, and required elements.
   - If anything is missing, ask focused questions before proceeding.

2. **Select a layout pattern**
   - Use `resources/wireframe/wireframe-patterns.md` to pick an appropriate base layout (dashboard, form, list-detail, card grid, wizard, etc.).

3. **Apply fidelity rules**
   - Low: boxes and labels only — no icons, no real content, no colour.
   - Mid: realistic labels, form fields, buttons, and state annotations.
   - High: full design tokens from the project style guide.

4. **Generate the SVG**
   - Create a self-contained SVG with `viewBox`, `<title>`, `<desc>`, embedded `<style>`, and grouped regions.
   - Follow the colour, font, and annotation rules from `wireframe-instructions.md`.

5. **Annotate**
   - Label all regions and interactive elements.
   - Note interactions, placeholders, and open questions.
   - Add ARIA or focus-order annotations where meaningful.

6. **Save and confirm**
   - Save to the agreed location.
   - Confirm output path, fidelity applied, and any `[TODO: clarify]` items.

## Output

- One SVG wireframe file per screen or component
- Short confirmation note: output path, layout pattern used, fidelity level, open questions

## Quality Checks

- [ ] `viewBox`, `<title>`, and `<desc>` are present.
- [ ] All screen regions are labelled.
- [ ] Interactive elements are annotated with actions or targets.
- [ ] Fidelity level is reflected in file name or companion README.
- [ ] Placeholder content is marked.
- [ ] Accessibility annotations are included where meaningful.
