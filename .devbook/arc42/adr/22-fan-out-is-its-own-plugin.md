# 22. Fan-Out Is Its Own Plugin

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#fleet-skill", ".devbook/domain/plugin-authoring/domain.md#layer", ".devbook/arc42/adr/2-one-folder-per-plugin.md"]
```

The three sweep skills that used to sit beside the Claude host profile land in a new `fleet`
plugin, an L1 extension over `delivery`, rather than as more skills inside the engine.

`delivery` states the rule they are the exception to: one item per run, and never a fan-out. A
flow owns a run, a Personal Validation gate, and a user turn, and none of those survives being
split across sessions mid-flow. Shipping the session-spawning mechanism inside the same plugin
would have put it one skill reference away from every flow that must not use it; a separate
plugin makes the reach impossible rather than discouraged.

Consequence: **enabling `delivery` alone gives no fan-out at all**, and that is the intended
resting state. A backlog is worked one issue per session through `start-session-from-issue`
until somebody enables `fleet` on purpose. The dependency runs one way — `fleet` names
`delivery`'s instruction files, skills, and surface contract; nothing in `delivery` names a
`fleet-*` skill, only the subsystem.
