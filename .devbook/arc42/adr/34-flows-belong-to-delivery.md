# 34. Flows Belong to Delivery

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#flow-skill", ".devbook/domain/plugin-authoring/domain.md#layer", ".devbook/arc42/adr/2-one-folder-per-plugin.md", ".devbook/arc42/adr/5-devbook-still-ships-the-graph-canvas.md", ".devbook/arc42/tdr/4-delivery-depends-on-devbook.md", ".devbook/ai/02-deliver.md#flow-skills"]
```

`devbook` enforces what a devbook folder holds — the instruction files, the metadata schema,
the check, the generator, the install. `delivery` holds every flow, including one per devbook
folder: `flow-arc42`, `flow-domain`, `flow-tech`, `flow-design`, `flow-ai`. The `devbook-flows`
bridge is removed, and `flow-adr`, `flow-tdr`, `flow-architecture`, and `flow-arc42-content`
are folded into `flow-arc42`.

Three faults, and the name was the smallest. The [naming chapter](../../domain/plugin-authoring/domain.md#flow-skill)
says a plugin takes its subsystem's stem and the things inside are named for what they are;
the bridge held five `flow-*` skills, which are `delivery`'s kind, under `devbook`'s stem.
`.arc42` was written by five flows across two plugins, with the split drawn by which old
specialist skill each came from rather than by the folder — `devbook`'s arc42 rules already
treat a chapter, a decision record, and a debt record as one shape with three templates, and a
proposal not yet decided is a record in `proposed` status. And the bridge was not the bridge
[the coupling table](2-one-folder-per-plugin.md) describes: both foundations named it, and the
Metadata Enforcement stage in each of its flows restated the rules `devbook`'s instruction
files already state, against the one-file rule this repository holds its own authoring to.

The reason no bridge is needed is that the rules reach a session through the host, not through
a flow. An instruction file declares the paths it governs; `devbook:install` materializes
the same files into the repository, as the pair
[A Plugin's Rules Reach a Host Through the Install](37-a-plugins-rules-reach-a-host-through-the-install.md)
describes, so any session reads them by path. A flow needs a governed folder to exist and nothing else, so there is no second stack to
couple. The engine therefore names folders — `.arc42/`, `.domain/`, `.tech/`, `.design/`,
`.ai/` — as it already did in its Documentation Update phase, and never the `devbook` plugin;
`devbook` names the category "the engine's own flow for the folder" and never a skill, the way
`delivery` names the fan-out subsystem and never a `fleet-*` skill.

What each folder flow keeps is the part that is procedure: derive the scope and, for `.arc42`,
the kind; load the instruction files that govern the target path; draft through the role the
folder maps to — `architecture` for `.arc42` and `.tech`, `domain`, `ux`, and `docs` for
`.ai`; run the repository's check with `--check` and never regenerate `_meta/`; close through
the documentation tier. A folder flow in a repository that has not adopted the folder stops and
says so, because adopting a folder is the convention's own install and not a flow's job.

Consequence: `flow-arc42` is the escalation target for a new decision, a cross-cutting
redesign, a boundary question, and accepted debt alike, and the record's kind is settled inside
it. `delivery` ships sixteen flows and `devbook-flows` is no longer published, so a consumer
that had it enabled sees it reported as not installed and finds the same five under the engine.
The L2b bridge row in the [layer table](../../domain/plugin-authoring/domain.md#layer) keeps its
pattern and, for now, no example.

`devbook`'s own assets came to the rule on 2026-09-09. `code-sync-protocol.md` and the
session-start hook already stated the pattern; `assets/routing-snippet.md` did not — it named
the engine outright and routed each folder through one of the five flows by name — and now
states the same three rungs. The `flow-*` strings left in the plugin are sample values in
example data, an annotation `author` and a report-table cell, and route nothing.

What this argument covers is the rules. It does not cover the generator path the five folder
flows name, the devbook rules they restate, or the folder names they are called after, so
`delivery` depends on `devbook` while declaring nothing —
[debt record 4](../tdr/4-delivery-depends-on-devbook.md) logs that and weighs the split into
`delivery-devbook` this decision's shape would otherwise invite.
