# Renderer and Layout Guide

This resource explains how the infographic skill should select a layout and how it should think about rendering choices.

## Rendering Strategy

### Version 1 default

- Generate **pure SVG** directly.
- Do not require a JavaScript charting or rendering library.
- Keep the artifact self-contained and easy to commit, review, and embed.

### Why not add a library first

- The documentation plugin currently ships as Markdown customization assets.
- Adding D3, Markvis, or another executable renderer would introduce a toolchain that the plugin does not otherwise need.
- Direct SVG generation keeps installation and maintenance simple.

### Library positions

- **Mermaid**
  - Good for simple flow and diagram thinking
  - Not the default output format
  - Use only when its visual grammar clearly matches the request
- **D3**
  - Strong future option for rich data-driven infographic rendering
  - Better suited to an executable pipeline than to the current skill-only plugin model
- **Markvis**
  - Useful inspiration for Markdown-to-visualization workflows
  - Not required for version 1 because the skill can extract structure directly from Markdown

## Layout Selection Matrix

| Source shape | Preferred infographic pattern | Notes |
|---|---|---|
| Ordered headings or steps | Process flow / timeline | Best for migrations, onboarding, and procedures |
| Before/after or option table | Comparison | Use side-by-side cards or columns |
| KPI bullets or metrics | KPI snapshot | Highlight a small number of numbers |
| Nested concepts or tiers | Hierarchy | Use stacked layers or grouped sections |
| Decision summary | Roadmap / summary card set | Keep trade-offs short and visible |

## Output Checklist

- Choose one primary pattern.
- Limit the number of colors and shape types.
- Keep text short enough for scanning.
- Make the most important fact visible first.
- Ensure the SVG can stand alone without surrounding explanation.
