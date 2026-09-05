---
name: create-infographic
description: Create a branded infographic from a Markdown file or direct prompt, outputting a pure SVG asset with optional motion guidance.
---

# Create Infographic

## Purpose

Use this skill to turn existing Markdown content or a new natural-language brief into a reusable infographic asset.

The first version should generate a **pure SVG** file by default so the result is portable, documentation-friendly, and easy to review in source control.

## Trigger Conditions

Use when the user asks to:

- create an infographic from an existing Markdown file
- create an infographic from a fresh prompt or concept
- convert a proposal, explanation, article, process, or KPI summary into a visual asset
- produce a documentation-friendly SVG that can optionally include light animation

## Inputs

Ask for the following when not already provided:

- **Input mode**: Markdown file path or direct prompt
- **Source**:
  - Markdown path to read and summarize, or
  - prompt describing the infographic goal and content
- **Audience**: Who should understand this at a glance?
- **Primary message**: What is the one thing the infographic must communicate?
- **Style guide**: Brand/style guide path or rules to follow, if available
- **Animation preference**: Static only, or subtle animation when useful
- **Output location**: Where should the SVG be saved (default: `documents/infographics/`)?

## Required Resources

Load and apply these files before generating the infographic:

1. `instructions/documentation/infographics.instructions.md`
2. `resources/infographics/svg-style-guide.md`
3. `resources/infographics/renderer-and-layout-guide.md`

## Workflow

1. **Confirm the source mode**
   - If the user provided a Markdown path, read the file and extract the message, sections, facts, steps, tables, and repeated themes.
   - If the user provided a direct prompt, normalize it into the same structured brief.

2. **Build an infographic brief**
   - Capture:
     - audience
     - primary message
     - supporting facts or KPIs
     - desired tone
     - output path
     - style constraints
     - motion preference
   - If key facts are missing, use `[TODO: clarify]` rather than inventing content.

3. **Choose the layout pattern**
   - Use the renderer/layout resource to map the content to one primary pattern:
     - timeline
     - process flow
     - comparison
     - KPI snapshot
     - hierarchy
     - roadmap

4. **Apply style guidance**
   - Use the supplied style guide first.
   - If no style guide is supplied, use the fallback SVG style guide resource.
   - Keep the visual system restrained: limited colors, limited visual motifs, and clear hierarchy.

5. **Generate the SVG**
   - Create a self-contained SVG with:
     - `viewBox`
     - `<title>`
     - `<desc>`
     - embedded `<style>`
     - grouped sections with `<g>`
   - Preserve the source meaning accurately.
   - Prefer concise text, labels, cards, dividers, arrows, and callouts over long paragraphs.

6. **Handle animation carefully**
   - Default to static-safe output.
   - If animation is requested or clearly useful, add subtle SVG/CSS animation only where it reinforces meaning.
   - Do not make animation the only way to understand the infographic.

7. **Save and confirm**
   - Save the SVG to the agreed location.
   - Tell the user where it was saved and note any assumptions or TODO placeholders.

## Library Strategy

- **Version 1 uses no required runtime rendering library.**
- Generate the SVG directly through the skill workflow and guidance files.
- **Mermaid** is optional inspiration for simple flow-style sections, but it is not the default renderer or output format.
- **D3** and **Markvis-like** workflows are future options if the plugin later needs executable, data-heavy rendering.

## Output

- One infographic SVG file ready to commit or embed
- A short note describing:
  - output path
  - selected layout pattern
  - any missing facts captured as TODOs
  - whether motion was included
