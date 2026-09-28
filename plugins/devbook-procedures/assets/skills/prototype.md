---
name: prototype
description: "Prototype requested features as one standalone HTML file in this repository's own design conventions, read from its design guidelines and Storybook. Use when: 'prototype this', 'mock it up', 'show me what it could look like', a feature needs a clickable sketch before it is built, or a spec needs a visual to review."
goal: "Return one standalone HTML file per request — every style, script, and image inline, nothing fetched — that prototypes the requested features in this repository's design conventions, names the guideline and the story each convention came from, and changes no source file."
---

# Prototype a Feature

Turn a feature request into a clickable HTML sketch that looks like this product. **Edit this
file** — where the conventions live, what a prototype shows, and where it lands are yours; the
goal in the wrapper is not.

## Read the conventions

<!-- Where this repository's look is written down. Replace the example rows; delete a row the
     repository does not have. -->

| Source | Where | Take from it |
| --- | --- | --- |
| Design guidelines | `.devbook/design/` — principles, tokens, component guidelines | colour, type, spacing, and radius tokens; component anatomy and states; the do/don't rules |
| Storybook | `src/Orders.Web/**/*.stories.tsx`, run with `npm run storybook` | each component's variants, its props, and the copy and states the stories show |
| Existing screens | `src/Orders.Web/Pages/` | layout, navigation, and how screens are composed |

1. **Read the guidelines first**, then the stories of every component the feature needs. A
   token or a component the guidelines name wins over one a story or a screen improvises.
2. **Match the feature to components that exist.** Compose from them; invent a component
   only when none fits, and say which and why.
3. **Missing source:** a repository without a guideline or a story for what is needed gets a
   plain, accessible default — say which convention was guessed.

## Build it

- One `.html` file. CSS in a `<style>` block, behaviour in a `<script>` block, images as inline
  SVG or `data:` URIs. No `<link>`, no CDN, no web font, no fetch — it opens from disk with the
  network off.
- Tokens as CSS custom properties on `:root`, named as the guidelines name them.
- Clickable where the feature is: navigation between its states, forms that validate, empty,
  loading, and error states the guidelines define. Data is hard-coded and realistic.
- Semantic HTML, labelled controls, visible focus, contrast the guidelines require.

## Deliver

<!-- Where prototypes land. Replace the example. -->

- `.wip/prototypes/<feature>.html`, one file per request, under the worktree root.
- Open it in the host's inline browser when it has one; otherwise give the path.
- Report in a few lines: the path, the features shown, and per convention the guideline or
  story it came from, plus every convention guessed.

## Never

- Change a source file, a story, or a guideline to make the prototype fit. A gap is a finding.
- Load anything from the network, or split the prototype across files.
- Present the prototype as the implementation.
