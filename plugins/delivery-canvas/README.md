# delivery-canvas

The two viewers: a Mermaid diagram rendered live, and a Markdown document rendered
live, beside the files they were written from.

A surface: where work becomes visible, and nothing else. It declares no dependency,
names no engine, and knows nothing about what produced the content it is handed. It
tracks no runs and exports nothing — a canvas shows content; the lifecycle around that
content belongs to a different implementation of the same contract.

## Installation

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `delivery-canvas` with `/plugin`. The server is plain Node with no npm
dependencies and starts on the first tool call.

## What it implements

One capability group, whole:

| Capability | Tools |
|---|---|
| `delivery.surface.render@1` | `render_diagram` · `render_markdown` |

Two names, and only two. Viewer navigation and view inspection are served over the
plugin's own HTTP origin instead of being added as extra tools: a surface that declares
more than the contract stops being swappable for one that declares exactly it.

The tools are namespaced by whoever registered the server, so they surface as
`mcp__plugin_delivery-canvas_delivery-canvas__*` when installed as a plugin and as
`mcp__delivery-canvas__*` from a repository's own MCP configuration. Match by pattern,
never by one spelling.

## One page, three ways in

`mcp/delivery-canvas/views/` holds one copy of each viewer, and everything else is
transport:

| Host | How the page arrives |
|---|---|
| Speaks MCP Apps (SEP-1865) | As a `ui://` resource, rendered inline in the conversation, with `app-bridge.js` answering the page's own `fetch` and `EventSource` |
| Speaks MCP | Served on `127.0.0.1` at an ephemeral port; the render tools return the URL |
| Has a canvas panel | `extensions/delivery-canvas/` opens the same file as a canvas, one per viewer |

The extension reads the pages out of `mcp/delivery-canvas/views/` by relative path
rather than keeping a second copy, so a fix to a viewer lands in every transport at
once and the two can never disagree about what a diagram looks like.

There is no authentication on the MCP server's HTTP side: reaching it already requires
local access to the machine. The canvas extension does check a per-instance token,
because a canvas server outlives the panel that opened it.

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

## Developing it

```bash
node dev/render-test.mjs
```

Drives the real server over stdio the way a host does: the declared tool surface, both
viewers, push/replace navigation, the history the Back button walks, and the pages
themselves.
