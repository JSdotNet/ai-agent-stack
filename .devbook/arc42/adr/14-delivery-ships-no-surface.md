# 14. delivery Ships No Surface

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#surface", ".devbook/arc42/adr/2-one-folder-per-plugin.md"]
```

The MCP server that backed the run dashboard stays in `JSdotNet/Copilot` and is not ported
here. `delivery` resolves a surface from the live tool list and no-ops when none answers.

That is the design working, not a gap in it: a surface is a separate L3 plugin precisely so the
engine neither depends on it nor knows which one answered. Porting the server into `delivery`
would have made the engine own its own viewer, which is the coupling the contract exists to
prevent.

Consequence: **installing `delivery` alone gives no live run timeline at all.** Every run
reports that no surface is bound, produces its file artifacts, and continues. That is now a
choice rather than a gap — `delivery-surface-dashboard`, `delivery-surface-canvas`, and `delivery-surface-collector`
ship beside the engine, and enabling one is what makes a run visible. The `flow-runner`
allowlist carried the predecessor dashboard's tool patterns beside the new ones for one
release; they went with the plugin that shipped that server.

See [Three Surfaces, One Contract](15-three-surfaces-one-contract.md) for what each of them
answers.
