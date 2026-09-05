# ai-agent-stack

The `jsdotnet` plugin marketplace for Claude Code and GitHub Copilot: the devbook knowledge
convention and the delivery flow, as agents, skills, instruction files, hooks, and MCP servers
authored once and loaded by both hosts.

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then `/plugin` and enable what you need. Every plugin installs on its own; the ones that need
a sibling declare it and the host enforces it.

## What is here

| Layer | Plugins | What they give you |
| --- | --- | --- |
| Knowledge | `devbook`, `devbook-collaboration` | Addressed Markdown chapters under `.devbook/` (or five root dot-folders) with parseable `meta` blocks, generated `_meta/` indexes, a reference-graph canvas, converters between chapters and code, and review and approval workflows over them. |
| Delivery | `delivery`, `devbook-flows`, `fleet` | Fifteen `flow-*` procedures that carry a change from request to a validated commit, five more for the knowledge folders, and the fan-out lane that works a backlog across sessions. |
| Surfaces | `delivery-dashboard`, `delivery-collector` (and `delivery-canvas` on Copilot) | Where a run is watched or recorded: a live dashboard, a headless collector, and a diagram and document viewer that is a Copilot canvas rather than an entry in this marketplace. Resolved at run time; none is a dependency. |
| Roles | `arc42`, `csharp-coding`, `qa`, `domain`, `ux`, `documentation`, `spec-builder` | The specialists a flow consults by name, each usable alone: architecture, C# implementation, runtime QA, domain design, UX, documentation, and asset authoring. |

The design lives in `.devbook/`: the vocabulary in `domain/`, the structure and every
recorded decision in `arc42/`, the technology graph in `tech/`, how the repository itself is
built with AI in `ai/`. Start with
[`.devbook/arc42/05-building-block-view.md`](.devbook/arc42/05-building-block-view.md).

## Working on it

Read [CLAUDE.md](CLAUDE.md) first. In short: one authored copy per asset, one logical change
per commit, nothing pushed until asked, and before committing:

```bash
node tools/check-assets.mjs && node plugins/devbook/tools/devbook-meta/build.mjs --check
```

To try a change, add this working copy as a marketplace by path instead of by repository.
