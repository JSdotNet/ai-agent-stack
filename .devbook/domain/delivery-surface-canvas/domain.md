# Delivery Surface Canvas

```meta
index: root
type: domain
related: [".devbook/domain/context-map.md#delivery-surface-canvas", ".devbook/arc42/09-architecture-decisions.md#delivery-surface-canvas-ships-the-canvas-only"]
```

What this context is responsible for: that a diagram or a document written to a file can be
looked at, live, beside the file — and that looking at it creates nothing anyone could mistake
for a record.

Inside the boundary: the two viewers, the navigation between views, and the transport that puts
them on a canvas panel.

Outside it: everything else. It tracks no runs, exports nothing, persists nothing, and knows
nothing about what produced the content it is handed. It answers one capability group and is the
one plugin here that ships a single host's manifest and takes no marketplace entry.

## View

```meta
type: aggregate
related: [".devbook/domain/delivery-surface-canvas/naming.md#view"]
```

What is currently shown on a canvas, and the history behind it. It is the only aggregate here,
and it is deliberately ephemeral: a view is a preview of a file that already exists, so storing
one would create a second, staler copy of something one call can re-render.

The history is the only state that is not derivable from the current call, which is exactly why
the aggregate exists at all rather than the render being a pure function.

### Invariants

| Rule | Enforced at | Evidence |
|---|---|---|
| Nothing is persisted; a view is re-rendered rather than restored | render | untested |
| Rendered source is the same source written to disk — the file stays the record | render | untested |
| `push` leaves a breadcrumb the Back button walks; `replace` updates in place and is the default | `render_diagram()`, `render_markdown()` | untested |
| The declared tool surface is exactly two names | extension start | untested |
| Navigation and view inspection are served over the extension's own origin, never as extra actions | page load | untested |
| The canvas server checks a per-instance token, because it outlives the panel that opened it | request handling | untested |

### Navigation Mode

```meta
type: enum
```

`push` or `replace`. `push` drills into a related view and leaves a breadcrumb; `replace` — the
default — updates what is on screen. Two values and no third: a mode that cleared the history
would make the Back button lie, and one that merged views would make the breadcrumb meaningless.

### Breadcrumb

```meta
type: entity
related: [".devbook/domain/delivery-surface-canvas/naming.md#view"]
```

One step in the history a `push` left behind, identified by its position. It exists so a
drill-down can be stepped back, and it dies with the panel — which is the whole extent of this
context's memory.

## Canvas Transport

```meta
type: domain-service
related: [".devbook/domain/delivery-surface-canvas/naming.md#canvas", ".devbook/tech/hosts.md#copilot-extension-sdk"]
```

Registers the two canvases, serves the viewer pages on a loopback origin at an ephemeral port,
and pushes view changes to the open page.

Invocation semantics: event-triggered — it starts when a canvas opens. It is a service rather
than behaviour on [View](#view) because it is the one part of this context that knows a host
exists, and keeping that knowledge in one place is what lets the viewers themselves stay plain
pages.

**This is the plugin's only transport, and it is why the contract matches operation names rather
than a transport.** The two operations arrive as canvas actions rather than namespaced tools, and
the surface contract is still satisfied — a surface is not required to be an MCP server.
