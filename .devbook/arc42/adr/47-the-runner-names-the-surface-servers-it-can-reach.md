# 47. The Runner Names the Surface Servers It Can Reach

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/15-three-surfaces-one-contract.md", ".devbook/arc42/adr/16-a-surface-declares-only-the-contracts-tool-names.md", ".devbook/domain/plugin-authoring/domain.md#surface", ".devbook/arc42/adr/58-the-runner-opens-no-browser-pane.md"]
```

`flow-runner`'s `tools` list names four exact MCP server ids — both spellings of
`delivery-surface-dashboard` and both of `delivery-surface-collector` — although
[the surface contract](../../../plugins/delivery/resources/surface-contract.md) resolves a
surface by matching the contract's operation names against the live tool list and forbids
matching by literal tool name. This is the one sanctioned exception, and it is forced — where
its argument stops is [record 58](58-the-runner-opens-no-browser-pane.md).

**An allowlist cannot hold a pattern.** `tools` is an exact-match allowlist the host enforces
before the agent runs, and `.agents/rules/agents.md` requires both spellings of every server
because the prefix depends on whether the server arrived through a plugin or a repository's own
`.mcp.json`. Neither host accepts a glob there. An agent whose allowlist omits a server cannot
call it however correctly it resolved it a moment earlier, so the four ids are not a second
resolution rule competing with the contract — they are the permission that leaves the contract
something to resolve.

**The contract still decides.** The runner matches operation names, binds each capability group
independently in the fixed priority order, and no-ops when nothing answers. Two servers produce
four ids; the third surface, `delivery-surface-canvas`, arrives as host canvas actions rather
than a server and needs no id of its own.

Consequence: a fourth plugin implementing `delivery.surface.lifecycle@1` is unreachable until
someone adds its two spellings to the runner's `tools` list. "Surface plugins declare nothing,
which is exactly what makes them swappable" is true of the two already listed and false of the
next one, and the cap lives in a plugin the new surface has no relationship with. Close it when
a host allows a prefix match in `tools`; until then a new surface ships with a one-line change
to `delivery` beside it, and that line is part of the surface's own release.
