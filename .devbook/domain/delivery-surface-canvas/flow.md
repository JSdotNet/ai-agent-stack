# Delivery Surface Canvas

```meta
type: flow
related: [".devbook/domain/delivery-surface-canvas/domain.md#view", ".devbook/domain/delivery-surface-canvas/domain.md#canvas-transport"]
```

> One flow: a view arriving, being navigated, and disappearing. Structure is in
> [model.md](model.md).

## A View's Life

Everything below dies with the panel. That is not a limitation being worked around — it is what
keeps a preview from becoming a record.

```mermaid
stateDiagram-v2
    [*] --> Opened: the canvas opens, and the transport registers two canvases
    Opened --> Showing: render_diagram or render_markdown
    Showing --> Showing: replace - updates in place, the default
    Showing --> Drilled: push - a related view, a breadcrumb left behind
    Drilled --> Drilled: push again
    Drilled --> Showing: Back walks the breadcrumbs
    Showing --> [*]: the panel closes, nothing kept
    Drilled --> [*]: the panel closes, the history with it
```

- **`replace` is the default because most renders are an update, not a descent.** A default of
  `push` would grow a history nobody asked for and make Back mean something different each time.
- **Nothing survives the panel.** A view is a preview of a file that already exists, so persisting
  one would create a second, staler copy of something one call can re-render.
- **The transport outlives the panel and the view does not**, which is the whole reason the canvas
  server checks a per-instance token: it is reachable after the thing that opened it is gone.

## Where It Fits Among the Three

The same resolution every caller performs, from this surface's side. One group answered, two
unanswered, and no fallback of its own.

```mermaid
flowchart LR
    caller(["A caller resolving the surface"]) --> render{"render@1?"}
    render -->|"answered here"| draw["Mermaid or Markdown, live, beside the file"]
    caller --> lifecycle{"lifecycle@1?"}
    lifecycle -->|"unanswered here"| elsewhere["Another implementation, or nothing"]
    caller --> export{"export@1?"}
    export -->|"unanswered here"| elsewhere
    draw --> file["The file on disk stays the record"]
```

- **One group, whole.** Answering render badly and lifecycle worse would make this substitutable
  for nothing, which is the failure the three-implementation split exists to avoid.
- **It answers on one host only, and that is a property of the group.** Its transport is a canvas
  panel and there is no equivalent on the other host — where the
  [dashboard](../delivery-surface-dashboard/domain.md) answers the same group instead.
- **A caller finding no render group renders nowhere and says so once.** Absence is a normal
  outcome for every group, including this one.
