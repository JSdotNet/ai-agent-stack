---
name: prototype
description: "Prototype requested features as one clickable, standalone HTML file on this repository's demo template, in its own design system — tokens, component library, Storybook — or revise an existing demo with its screen ids kept. Use when: 'prototype this', 'mock it up', 'show me what it could look like', 'change this demo', a feature needs a clickable sketch before it is built, or a spec needs a visual to review."
goal: "Return one standalone HTML file per request — every style, script, and image inline, nothing fetched — built on the repository's demo template when it has one and in its design system, naming the guideline, token, or story each convention came from. Given an existing demo, return its revision with every screen id and anchor that still exists kept, and list the ones removed or renamed. Write into no .devbook/ folder and change no source file."
---

# Prototype a Feature

Turn a feature request into a clickable HTML sketch that looks like this product, or revise a
demo that already exists. **Edit this file** — where the conventions live and what a prototype
shows are yours; the goal in the wrapper is not.

## Read the conventions

<!-- Where this repository's look is written down. Replace the example rows; delete a row the
     repository does not have. -->

| Source | Where | Take from it |
| --- | --- | --- |
| Demo template | wherever the repository keeps it, e.g. `.devbook/design/demo-template.html` | the managed region, copied verbatim; the control panel and every line of script |
| Design system | `.devbook/design/` — principles, tokens, component guidelines; `src/Orders.Web/theme/tokens.css` | colour, type, spacing, and radius tokens; component anatomy and states; the do/don't rules |
| Storybook | `src/Orders.Web/**/*.stories.tsx`, run with `npm run storybook` | each component's rendered markup, its variants, and the copy and states the stories show |
| Existing screens | `src/Orders.Web/Pages/` | layout, navigation, and how screens are composed |

1. **Use the design system when the repository has one**, then the stories of every component
   the feature needs. A token or component the design system names wins over one a story or a
   screen improvises. With Storybook running, take a component's markup from its rendered
   story rather than redrawing it.
2. **Match the feature to components that exist.** Compose from them; invent a component
   only when none fits, and say which and why.
3. **Missing source:** no design system and no story for what is needed gets a plain,
   accessible default — say which convention was guessed.

## Design it

Use the host's design skill for the visual work when the session has one: `/design` on Claude
Code, which drafts the screens as artboards on a canvas, or Impeccable on Copilot, whose
`critique` and `polish` run over the file once it is written. Hand it the conventions above as
the brief's constraints: where it and the design system disagree, the design system wins. A
canvas is not the deliverable — write the file from the artboards that were chosen. When the
host will not let this skill invoke it, ask the person to type it, and wait.

## Build it

- **Start from the template**, or from the existing demo when one is given. Keep the managed
  region between `template:begin` and `template:end` byte-for-byte; never edit it here. No
  template: build the app part alone and say the template is missing.
- **Screens as markup.** Each screen or state is a `<section id="…" data-screen>`, a state
  variant carries `data-state`, and an element someone may comment on carries
  `data-anchor`. Move between screens with `href="#id"`; use `<dialog>`, `popover`, and
  native form validation. No `<script>` outside the template except `demo-model`.
- **`demo-model`** lists every screen id and anchor, and the flags, roles, and viewports the
  panel switches, named by the same `key` as the repository's settings, flags, and actors.
- **Revising a demo:** keep every id and anchor that still exists; rename none without cause.
- One `.html` file. Styles inline, images as inline SVG or `data:` URIs. No `<link>`, no CDN,
  no web font, no fetch — it opens from disk with the network off.
- Data is hard-coded and realistic; empty, loading, and error states as the design system
  defines them. Semantic HTML, labelled controls, visible focus, the contrast it requires.

## Deliver

- Open it in the host's inline browser when it has one; otherwise give the path.
- Report in a few lines: the path, the screens shown, per convention the guideline, token, or
  story it came from, every convention guessed, and — for a revision — the ids and anchors
  removed or renamed.

## Never

- Write into `.devbook/`. A demo reaches it only through a change.
- Change a source file, a story, or a guideline to make the prototype fit. A gap is a finding.
- Load anything from the network, or split the prototype across files.
- Present the prototype as the implementation.
