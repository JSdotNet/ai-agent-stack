---
applyTo: '**/infographics/*.svg'
description: Rules for authoring SVG infographics — concise visual storytelling with accessible structure, style-guide alignment, and optional motion.
---

# Infographic Instructions

## Purpose

- Apply these rules when editing any file under `**/infographics/*.svg`.
- Audience: readers who need a fast, scannable visual summary of a concept, process, comparison, or data story.
- Focus on accurate content, strong information hierarchy, accessibility, and portable SVG output.

## Scope

- This folder is for **Infographics** only.
- Final outputs must be self-contained **SVG** assets.
- Use animation only when it adds meaning and the target environment can support it.

## Required SVG Structure

1. Root `<svg>` element with `xmlns`, a stable `viewBox`, and width/height only when needed.
2. A `<title>` and `<desc>` that explain the infographic for assistive technologies.
3. An embedded `<style>` block for design tokens, typography, layout helpers, and optional motion classes.
4. Section grouping with `<g>` elements (for example `header`, `summary`, `comparison`, `footer`) so the layout stays understandable and editable.
5. No required external assets, fonts, scripts, or runtime dependencies.

## Content Rules

- Preserve the source meaning accurately; do not invent statistics, dates, or decisions.
- Reduce the message to one primary headline and a small set of supporting facts.
- Prefer a single dominant visual pattern per infographic:
  - timeline
  - process flow
  - comparison
  - KPI snapshot
  - hierarchy
  - roadmap
- Use `[TODO: clarify]` only when required source information is missing and the gap cannot be resolved safely.

## Visual Style Rules

- Follow the provided style guide first. If none is provided, use the plugin's fallback infographic style resource.
- Keep typography consistent: one headline style, one body style, and one label style per asset.
- Use a limited palette with clear semantic roles (background, primary, accent, neutral, warning only if needed).
- Keep spacing consistent on a simple grid so callouts and cards align cleanly.
- Use icons and shapes sparingly; they should reinforce meaning, not decorate empty space.

## Accessibility Rules

- Ensure readable contrast between text and background.
- Use text labels rather than color-only distinction.
- Keep text large enough to remain readable when the SVG is embedded in documentation.
- Make reading order obvious from top to bottom or left to right.
- Avoid dense paragraphs; convert long prose into short labels, bullets, or callouts.

## Motion Rules

- Default to a static-safe design.
- Use animation only for:
  - reveal sequencing
  - showing direction of flow
  - emphasizing one key metric or transition
- Avoid flashing, rapid looping, or motion-only meaning.
- If animation is used, keep it subtle and ensure the infographic still works without it.

## Library Guidance

- The preferred first implementation is **library-free SVG generation** driven by the skill instructions.
- **Mermaid** may be used as a conceptual aid for simple flow patterns, but the final artifact should still be SVG.
- **D3** or **Markvis-like** approaches are future options if the plugin later grows an executable rendering pipeline.

## Final Checklist

- [ ] SVG is self-contained and portable.
- [ ] Title, description, and visual hierarchy are present.
- [ ] Source facts are accurate and concise.
- [ ] Style guide or fallback style rules were applied consistently.
- [ ] Animation, if present, is subtle and non-essential.
