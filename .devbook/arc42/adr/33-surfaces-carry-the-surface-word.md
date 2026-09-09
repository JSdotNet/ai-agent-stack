# 33. Surfaces Carry the Surface Word

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#surface", ".devbook/arc42/05-building-block-view.md#surface-plugins", ".devbook/arc42/adr/15-three-surfaces-one-contract.md"]
```

The three surface plugins are `delivery-surface-dashboard`, `delivery-surface-collector`, and
`delivery-surface-canvas`. They were `delivery-dashboard`, `delivery-collector`, and
`delivery-canvas` until this date, and a grep for those strings finds only this record.

The stem rule says a plugin takes its subsystem's stem and the things inside are named for what
they are — and what these three are is one thing, in three implementations. `dashboard`,
`collector`, and `canvas` name the implementation; `surface` names the contract all three
answer, `delivery.surface.*@1`, and it was the one word the plugin names did not carry. The
marketplace listed a dashboard and a collector beside an engine, a bridge, and a lane, and
nothing in the name said the first two were interchangeable and the rest were not.

Only the plugins are renamed. The inner `mcp/<name>/` and `extensions/<name>/` folders follow,
because they are named after the plugin they ship in, and so does everything derived from the
name: the tool namespaces (`mcp__plugin_delivery-surface-dashboard_delivery-surface-dashboard__*`
and the shorter `mcp__delivery-surface-dashboard__*`), the environment variables
(`DELIVERY_SURFACE_DASHBOARD_STATE_DIR`, `DELIVERY_SURFACE_COLLECTOR_STATE_DIR`, and the idle
and token-limit overrides beside them), and the default state directory under the host's
configuration folder. The tool names inside the namespace do not move: the contract names
them, not the plugin.

The shared viewers and run store the three still carry as separate copies are not touched. A
shared source folder for them is a separate change, and if it comes it takes the same stem —
`delivery-surface` — rather than a fourth plugin, because
[a surface is never a dependency](15-three-surfaces-one-contract.md).

Consequence: run files written under the old state directories are not read from the new ones,
and nothing migrates them. Nothing needs to: no repository has bound a surface by its new name
yet, and the old folder is left where it is rather than moved. Plugin versions stay at `0.1.0`,
since a rename changes which entry a host installs, not what the entry does.
