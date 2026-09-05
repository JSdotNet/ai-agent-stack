# delivery-canvas

The two viewers: a Mermaid diagram rendered live, and a Markdown document rendered
live, beside the files they were written from.

A surface: where work becomes visible, and nothing else. It declares no dependency,
names no engine, and knows nothing about what produced the content it is handed. It
tracks no runs and exports nothing — a canvas shows content; the lifecycle around that
content belongs to a different implementation of the same contract.

## Installation

A Copilot plugin, and only that. It ships no Claude manifest and is not listed in
`.claude-plugin/marketplace.json`, because a canvas panel is the one thing it needs and
Claude Code has none — there, `delivery-dashboard` answers the render capability. Install
it the way the Copilot CLI installs a plugin; the extension is plain Node with no npm
dependencies beyond the SDK the CLI resolves itself, and starts when the canvas opens.

## What it implements

One capability group, whole:

| Capability | Tools |
|---|---|
| `delivery.surface.render@1` | `render_diagram` · `render_markdown` |

Two names, and only two. Viewer navigation and view inspection are served over the
extension's own HTTP origin instead of being added as extra actions: a surface that
declares more than the contract stops being swappable for one that declares exactly it.

## One page, one way in

`extensions/delivery-canvas/views/` holds one copy of each viewer, and everything else is
transport. `extension.mjs` registers two canvases with `createCanvas`, serves the pages on
`127.0.0.1` at an ephemeral port, and pushes view changes to the open page over SSE.

The canvas server checks a per-instance token, because it outlives the panel that opened
it.

## Rendering

`render_diagram` takes Mermaid source — C4, sequence, state, deployment, aggregate,
context map, domain-event flow, subdomain landscape, wireframes, user flows — and shows
it pannable, with an optional explanation panel beside it. `mode: "push"` drills into a
related diagram and leaves a breadcrumb the Back button walks; `replace`, the default,
updates in place.

`render_markdown` takes Markdown and renders it as formatted HTML, with the same
push/replace navigation.

Both are a live preview beside the file artifact, never a replacement for it. Render the
same source that was written to disk; the file stays the source of truth, and a rendered
view that nobody saved is not a record of anything.

Nothing is persisted. A view is a preview of a file that already exists, so storing it
would only create a second, staler copy of something one call can re-render.
