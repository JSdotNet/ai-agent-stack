---
name: prototype
description: "Settle one design question that talk will not settle with a throwaway, clickable, standalone HTML prototype, and return the answer beside it — a state model someone can drive through its edge cases, or structurally different screen variants on this repository's demo template and in its design system — or revise an existing demo with its screen ids kept. Use when: 'prototype this', 'mock it up', 'show me what it could look like', 'does this state model hold', 'change this demo', a Step 0 prototype, a lifecycle with edge cases nobody can hold in their head, or a screen someone needs to see more than one way. DO NOT USE FOR: finding why existing code misbehaves (diagnose)."
goal: "Answer the one design question named up front, and return that answer — the question, what the prototype showed, and where the answer lands next — beside one standalone HTML file, every style, script, and image inline and nothing fetched. A logic question gets a model anyone can drive: a labelled state panel, free-play controls, and guided walkthroughs in the domain's own terms. A visual question gets two or more structurally different variants on the repository's demo template when it has one and in its design system, naming the guideline, token, or story each convention came from. Given an existing demo, keep every screen id and anchor that still exists and list the ones removed or renamed. The prototype is never merged: write into no .devbook/ folder and change no source file."
---

# Prototype a Design Question

Write throwaway code that answers one question, then keep the answer. **Edit this file** — where
the conventions live and what a prototype shows are yours; the goal in the wrapper is not.

## Name the question

State the question in one sentence before writing anything: *does the refund lifecycle survive a
partial cancel?*, *list or board for the dispatch screen?* In a change, it is the
`## Step 0 — Prototype: <question>` heading. No question, no prototype — ask for one. Then pick
the kind the question is:

- **Logic** — a state model, lifecycle, or rule set with edge cases nobody can hold in their head.
- **Visual** — a screen or flow someone needs to see more than one way.

A question that is both is two prototypes. A bug in existing code is `diagnose`, not this.

## Read the conventions

<!-- Where this repository's language and look are written down. Replace the example rows;
     delete a row the repository does not have. -->

| Source | Where | Take from it |
| --- | --- | --- |
| Domain model | `.devbook/domain/<context>/` — `domain.md`, its `domain.invariants.md`, the ubiquitous language | states, events, and invariants, named as the chapter names them (logic) |
| Demo template | wherever the repository keeps it, e.g. `.devbook/design/demo-template.html` | the managed region, copied verbatim; the control panel and every line of script (visual) |
| Design system | `.devbook/design/` — principles, tokens, component guidelines; `src/Orders.Web/theme/tokens.css` | colour, type, spacing, and radius tokens; component anatomy and states; the do/don't rules |
| Storybook | `src/Orders.Web/**/*.stories.tsx`, run with `npm run storybook` | each component's rendered markup, its variants, and the copy and states the stories show |
| Existing screens | `src/Orders.Web/Pages/` | layout, navigation, and how screens are composed |

- A token or component the design system names wins over one a story or a screen improvises.
  With Storybook running, take a component's markup from its rendered story.
- Compose from components that exist; invent one only when none fits, and say which and why.
- No source for what is needed gets a plain, accessible default — say which convention was guessed.

## Write it throwaway

Throwaway is how the code is written: no tests, no persistence, no real API, no abstraction
beyond what the question needs, error handling only where the question is about errors. It fits
one sitting. Reaching for a test or a database means the prototyping has stopped; sprawl means
the question was too big — stop, split it, and say so.

A designer, product owner, or domain expert must be able to operate it from its labels alone.

One `.html` file. Styles inline, images as inline SVG or `data:` URIs. No `<link>`, no CDN, no
web font, no fetch — it opens from disk with the network off.

## Logic: a model to drive

- **The model apart from the page.** One `<script id="model">` holds state, the events, and a
  pure `next(state, event)` — no DOM in it — so a model the answer validates reads straight
  into the real code. Rendering lives in its own script.
- **State panel.** Every field of the current state, labelled in the domain's terms, and each
  invariant with a live held/broken mark.
- **Free play.** One button per event, disabled with the reason when the state refuses it.
- **Walkthroughs.** One tab per scenario the question turns on, stepping through named events —
  the happy path first, then each edge case, the one that settles the question last.
- Styled plainly; the demo template and design system are optional here.

## Visual: variants that disagree

- **Two or more variants that differ in structure** — layout, navigation, what is on one screen
  versus several — never three tints of one card grid. Name each by its idea.
- Use the host's design skill for the visual work when the session has one: `/design` on Claude
  Code, or Impeccable's `critique` and `polish` on Copilot. The design system wins where they
  disagree, and a canvas is not the deliverable. When the host will not let this skill invoke
  it, ask the person to type it, and wait.
- **Start from the template**, or from the existing demo when one is given. Keep the managed
  region between `template:begin` and `template:end` byte-for-byte. No template: build the app
  part alone and say the template is missing.
- **Screens as markup.** Each screen or state is a `<section id="…" data-screen>`, a state
  variant carries `data-state`, a design variant `data-variant`, and an element someone may
  comment on `data-anchor`. Move between screens with `href="#id"`; use `<dialog>`, `popover`,
  and native form validation. No `<script>` outside the template except `demo-model`.
- **`demo-model`** lists every screen id and anchor, the variants, and the flags, roles, and
  viewports the panel switches, named by the same `key` as the repository's settings, flags,
  and actors. Where the panel does not switch variants, give each variant's screens their own
  ids, `<screen>--<variant>`, and link them.
- **Revising a demo:** keep every id and anchor that still exists; rename none without cause.
- Data is hard-coded and realistic; empty, loading, and error states as the design system
  defines them. Semantic HTML, labelled controls, visible focus, the contrast it requires.

## Deliver

- Open it in the host's inline browser when it has one; otherwise give the path.
- **The answer first:** the question, what the prototype showed, and where it lands next — a
  decision record or a design delta through `flow-spec`, or the change's next step. A person
  reads the prototype and decides; the answer is a proposal until they do.
- Then the path, the screens or walkthroughs shown, per convention the guideline, token, or
  story it came from, every convention guessed, and — for a revision — the ids and anchors
  removed or renamed.

## Never

- Write into `.devbook/`. The answer reaches it only through a change.
- Change a source file, a story, or a guideline to make the prototype fit. A gap is a finding.
- Merge the prototype, harden it, or present it as the implementation.
- Load anything from the network, or split the prototype across files.
