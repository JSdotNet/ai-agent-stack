# Delivery Surface Canvas

```meta
type: naming
related: [".devbook/domain/context-map.md#delivery-surface-canvas"]
```

> Three terms. The kernel vocabulary — surface, capability group, plugin — is defined once in
> [Plugin Authoring's registry](../plugin-authoring/naming.md).

## View

```meta
type: term
date: 2026-09-08
aliases: [render, panel content]
related: [".devbook/domain/delivery-surface-canvas/domain.md#view"]
```

What is currently drawn, and the breadcrumbs behind it. `push` descends into a related view and
leaves one; `replace`, the default, updates in place.

The history is the entire memory of this context and dies with the panel — which is why *view* is
a thing here at all rather than the render being a pure function of its input.

## Canvas

```meta
type: term
date: 2026-09-08
aliases: [panel, extension canvas]
related: [".devbook/domain/delivery-surface-canvas/domain.md#canvas-transport", ".devbook/tech/hosts.md#copilot-extension-sdk"]
```

The host panel a viewer page is registered into, and this plugin's only transport. Two are
registered: one for diagrams, one for documents.

It is the reason the surface contract matches operation names and never a transport. These two
operations arrive as canvas actions rather than as namespaced tools, and the contract is still
satisfied — a surface is not required to be an MCP server.

## Preview

```meta
type: term
date: 2026-09-08
aliases: [live view, rendered artifact]
related: [".devbook/domain/delivery-surface-canvas/features.md#stay-a-preview"]
```

What every render here produces, and what none of them is allowed to stop being: a live view of a
file that already exists on disk.

Rendering the same source that was written, and storing none of it, is what keeps a surface from
becoming a second answer to what a run produced. A rendered view nobody saved is not a record of
anything.
