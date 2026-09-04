# SVG Infographic Style Guide

Default visual guidance for infographic generation when the user does not provide a stronger project- or brand-specific style guide.

## Style Source Precedence

Apply style inputs in this order:

1. Explicit style guide file or prompt from the user
2. Repository-specific brand or design documentation near the target output
3. This fallback guide

## Design Tokens

Use named roles rather than hard-coded visual intent:

- `--color-bg`
- `--color-surface`
- `--color-primary`
- `--color-accent`
- `--color-text`
- `--color-muted`
- `--color-success`
- `--color-warning`

If the user does not supply colors, prefer a restrained palette with one primary hue, one accent hue, neutral text, and a light background.

## Typography

- Headline: short, outcome-focused, high contrast
- Section label: compact and scannable
- Body copy: minimal; convert paragraphs into bullets or callouts where possible
- Number styling: emphasize KPI values with larger weight/size than surrounding labels

## Layout

- Use a simple spacing grid and align cards, columns, and dividers consistently.
- Keep the number of sections small enough to understand at a glance.
- Leave visible whitespace between major sections.
- Prefer one dominant reading direction per infographic.

## Icon and Shape Usage

- Use icons only when they speed up recognition.
- Reuse a small shape vocabulary (cards, pills, arrows, dividers, badges).
- Avoid mixing too many illustration styles in one asset.

## Content Density

- One headline
- Three to seven core facts or steps
- Minimal prose
- One clear takeaway or call to action

## Motion

- Default to static output.
- If animation is needed, prefer gentle opacity or position changes over complex motion.
- Keep animation meaningful, not decorative.
- The infographic must remain understandable when motion is removed.
