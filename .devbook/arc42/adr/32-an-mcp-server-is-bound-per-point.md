# 32. An MCP Server Is Bound Per Point

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/adr/24-the-specialists-leave-the-marketplace.md", ".devbook/arc42/adr/2-one-folder-per-plugin.md", ".devbook/domain/plugin-authoring/domain.md#mcp-server", ".devbook/domain/plugin-authoring/domain.md#extension-point"]
```

`delivery` named two MCP servers by id — a guidelines server and a design server, both
published from `JSdotNet/Copilot` and neither shipped here — and four flows stopped the run for
MCP setup when the guidelines tools were absent. That was the coupling
[the specialists decision](24-the-specialists-leave-the-marketplace.md) removed for agents, still
present for servers, and with a harder failure: a role that does not resolve degrades one
stage, while these stops ended the run.

The servers are now a binding. `bindings["delivery.mcp"]` in `.devbook/config.json`
maps each point of the closed set to the server ids the repository's own MCP configuration
declares, and a stage uses the servers of the point it serves — Scope Discovery and every
intake or drafting stage read `spec`, implementation stages `implement`, Build & Test
`verify`, QA `app.start` and `qa.run`. A server is resolved from the live tool list by
pattern at the stage that uses it, exactly as a surface is; one that does not answer is
reported once and the stage continues on the repository's own instruction files and chapters.
Absent, a point takes the engine default: `microsoft-learn` at `implement` and `verify`,
`aspire` and `playwright` at `app.start` and `qa.run`, nothing anywhere else.

Keyed by point rather than by stage name because the point set is closed and is already how
gates and extensions address a position in a flow: a stage name is a skill's own, so a binding
on one could not be validated and would rot on a rename. A fifth binding rather than a fifth
top-level key because it is the same kind of thing as a role or a tracker — named per
repository, resolved at run time, never a dependency — and the four-key story in the schema,
the guide, and this chapter stays true.

Consequence: a stage that wants a server it cannot name has to say which point it serves, and
the mapping table in `flow-execution-model.md` is where that is decided once. The
engine still names two servers by id, as defaults only, because `microsoft-learn` and
`playwright` are public tools rather than plugins published from another marketplace; a
repository that disagrees binds the point to `null`.
