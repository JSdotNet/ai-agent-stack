# Design

```meta
status: draft
index: root
```

Design guidance for the surfaces this repository's plugins render. Nothing here is implemented
yet: both chapters below are `draft` and record the intent, so the first surface that ships is
reviewed against something written down rather than against itself.

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
status: draft
```

The rendered view of something already true in the repository — a graph, a diagram, a document.
A canvas is a projection: it reads generated or checked-in content and never becomes the source
of it, so a viewer can be absent without any knowledge being lost.
