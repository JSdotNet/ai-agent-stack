# Design

```meta
status: draft
index: root
```

Design guidance for the surfaces this repository's plugins render. The dashboard below is
`draft` and records intent only, so the surface that ships is reviewed against something
written down rather than against itself. The canvas has an implementation.

## Dashboard

```meta
status: draft
related: [".devbook/ai/adoption-map.md#flow-skills"]
```

The run surface an orchestration reports into: stages, their state, and the evidence attached
to each. It sits beside a conversation rather than replacing it, so it stays readable at
sidebar width, survives the viewer's light and dark theme, and never becomes the only place a
result is recorded.

## Canvas

```meta
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

The rendered view of something already true in the repository — a graph, a diagram, a document.
A canvas is a projection: it reads generated or checked-in content and never becomes the source
of it, so a viewer can be absent without any knowledge being lost.

`devbook-canvas` is the one that ships. It renders `_meta/graph.json` from the same graph module
the generator writes it with, which is what makes the live view and the committed index unable
to disagree — a second implementation of the projection would be a second thing to keep true.
