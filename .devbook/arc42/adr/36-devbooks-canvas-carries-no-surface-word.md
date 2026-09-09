# 36. devbook's Canvas Carries No Surface Word

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#surface", ".devbook/arc42/adr/33-surfaces-carry-the-surface-word.md", ".devbook/arc42/adr/5-devbook-still-ships-the-graph-canvas.md"]
```

`devbook`'s extension folder is `devbook-graph`, not `devbook-surface-canvas`. It was
`devbook-canvas` until this date, and a grep for that string now finds only this record, the one
sentence it amends in [devbook Still Ships the Graph
Canvas](5-devbook-still-ships-the-graph-canvas.md), and the plugin's upgrade note.

[Surfaces Carry the Surface Word](33-surfaces-carry-the-surface-word.md) put the contract word in the
middle of the three delivery surfaces because they answer `delivery.surface.*@1` and are
substitutable for one another — nothing in `delivery-dashboard` said the dashboard and the
collector were interchangeable and the engine beside them was not. That reason does not reach
this extension. It answers no operation group, no run resolves it from the live tool list, and
it substitutes for nothing, so the word it would carry marks a membership it does not have.
What it does have in common with `delivery-surface-canvas` is only the host mechanism, and
naming the mechanism is what made the two look like one kind: `devbook-canvas` beside
`delivery-surface-canvas` reads as a second implementation of the render group, which it is not.

So the name states the subject instead. `devbook-graph` draws the reference graph the `meta`
blocks describe, and the second canvas the extension registers is `devbook-chapter` — one
chapter's Markdown beside its parsed block and a metadata lint. That id was also `devbook-canvas`,
so the string named both the whole extension and one of the two canvases inside it.

Consequence: the [surface term](../../domain/plugin-authoring/domain.md#surface) still counts four
surfaces, and the stem rule now reads with the scope it always had — the contract word marks
interchangeability, so a surface interchangeable with nothing does not carry it. The lift this
folder is still waiting on takes the new name with it, and the blocker is unchanged: the three
relative imports into `tools/devbook-meta/`, per
[devbook Still Ships the Graph Canvas](5-devbook-still-ships-the-graph-canvas.md).
