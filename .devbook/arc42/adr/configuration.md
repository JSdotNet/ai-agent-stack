# Configuration

```meta
date: 2026-09-29
status: proposed
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/08-crosscutting-concepts.md#stamp", ".devbook/arc42/building-blocks/devbook-config.md#engine-configuration", ".devbook/arc42/adr/flow-engine.md", ".devbook/arc42/adr/install.md"]
```

A repository's wiring is one committed file, `.devbook/config.json`: the engine's four keys —
`bindings`, `extensions`, `policy`, `gates` — beside every component's `components.<name>`
entry and a committed `id`. Unknown keys are rejected by name. A `config.local.json`
outside every clone overlays the engine keys at two layers — the user's devbook config
directory, and `repos/<id>/` under it — and may add a gate but never remove one. How
the application starts is not configuration: it is the repository's own `run` recipe.

## Proposed

```meta
```

**The `phases` map, the configuration half of Per-Phase Delivery Config** (see
[Flow Engine](flow-engine.md#proposed)). Not yet decided. The engine keys become `bindings`,
`phases`, `policy`, and `gates`, and a top-level `areas` key joins them.

- **One complete map per flow.** `phases.<flow>.<phase>[:<qualifier>]` holds `agent`,
  `skill`, `model`, `effort`, `mcp`, `before`, `after`, and a few phase-specific options.
  The qualifier is the folder in `flow-spec`, and in `flow-code` the kind or the area. Each
  field resolves on its own, most specific key first, then the session. An absent field
  inherits the session. The committed file must list exactly the phases its flow has. An
  overlay names only what it changes, and the overlay's value wins field by field.
- **Three mechanisms fold in.** `extensions` maps to phase `skill`, `agent`, and hook
  fields. `bindings["delivery.roles"]` becomes the `agent` of the phases a role drafted.
  `bindings["delivery.mcp"]` becomes each phase's `mcp`. The categories in the personal
  `model-selection.md` become `model` entries in the user overlay. The migration does the
  rewrite. Once it lands, the checker rejects the old keys by name and points at
  `delivery:update`. A role bound to a bare plugin name resolves to that plugin's single
  agent. A plugin with more than one agent is reported, never guessed.
- **Model and effort in the committed file.** Today a model is personal only. The proposal
  makes committed values team defaults that the overlay always overrides, so nobody's
  personal choice is taken away.
- **Gates attach to phase ids**, not to points. An overlay still only adds a gate.
  `personal-validation` refuses every field, in any map, the way
  `policy.gate.personalValidation` is refused today.
- **Doctor rules.** `devbook-config:doctor` resolves a phase's `agent` against the installed
  agents and the repository's own agent folder, and its `skill` against the installed skills.
  An agent id in a `skill` field, and an `agent` field that names an agent-only plugin with
  more than one agent or no agent at all, are warnings that name the fix. An agent id in a
  `skill` field is the gap that left `extensions.implement: csharp-coding:coding` resolving
  to nothing, because the doctor's agent fallback covers roles only. Doctor also flags a map
  left under a retired flow and a leftover `model-selection.md`.

## Why

```meta
```

**One file.** The two halves are read by the same people at the same moment: whoever decides
which folders devbook adopts is deciding, in the same sitting, which tracker the flows post to.
Two files would give the repository two places to disagree with itself. Each component writes
only its own entry, and `policy` keys are closed enums with documented defaults, so an absent
key means the engine's choice and a hand edit is safe.

**Under `.devbook/`.** It was `.github/ai-agent-stack.json`, and `.github/` is one host's
folder — a file both hosts read belongs in neither's. `.devbook/` already holds the
repository's own account of how it works, of which the config is the machine-readable half.
Reading the path is not a dependency on the `devbook` plugin: `delivery` reads it whether or
not a single folder was adopted. There is no fallback path, deliberately; the guide's report
names the old file while it exists.

**The overlay may only tighten.** A file no reviewer sees may not weaken what a reviewer sees:
`gates` append, `policy.pr.required`, `policy.qa.ceiling`, `policy.gate.personalValidation`,
`policy.openspec.scenarios` and `components` are refused, and the check validates the overlay alone and the merged result.
Trusting the overlay because its author could edit the committed file fails on visibility, not
capability — the committed edit shows in review and the overlay never does.

**`ext` is the overlay's `components`.** A plugin that must remember something about one
machine — the environment and model a routine runs with — had no legal key: the engine
rejects every top-level name it does not own, and an overlay may not carry a stamp. `ext.<plugin>.<key>`
is the extension namespace the chapter `meta` block already reserves, applied to the config:
accepted in an overlay only, refused in the committed file, shape-checked as far as being an
object of objects and otherwise opaque to the engine. The owning plugin reads it and asks only
for what is absent, and may write its own namespace there and nothing else. `devbook-config:local`
writes an overlay whole; `devbook-config:init` never does, because an overlay is true of the person running
it and of nobody they set a repository up for.

**Two layers, keyed by a committed id, and none in the clone.** A gitignored file is in no
commit, so a fresh worktree ran at the team's defaults without saying so. A file outside the
clone keyed on the checkout path splits worktrees exactly as the gitignored one does; a
committed `id` survives a move, a re-clone, and a worktree alike, which is how OpenSpec's stores
key a machine to a repository. The location is `$XDG_CONFIG_HOME/devbook` rather than
`~/.claude/`, because the reader is `check.mjs` and Copilot runs it as readily as Claude. `id`
configures nothing and is never renamed — a renamed id orphans every machine's `repos/<old>/`.
The gitignored checkout layer that started the overlay was retired once both user layers
existed: everything personal has a home outside the repository, so the repository has nothing
to ignore, and devbook's `.gitignore` block went with it.

**Runtime facts live in the `run` recipe, not a `runtime` key.** The flow context file had
eight sections; three were answered by config and `.mcp.json`, one spelled `null` in Markdown,
and the rest were facts the start procedure — `run` since 1.12.0 — consumed in its next line. Configuration chooses
among behaviour the engine implements, and how one product's application comes up is prose the
repository owns. Nothing to start is `extensions.app.start: null`.

**A component entry may be hand-written.** The dashboard computes a session title from
`components.delivery-surface-dashboard.sessionNaming.labels`; it materializes nothing and ships
no install skill, so an install skill whose only job is to copy one object would be ceremony.
The owner and the boundary are the same — nobody writes another component's entry. An overlay
cannot change the words, because a stamp is repo-scope and one committed vocabulary is what
makes two developers' session lists readable to each other.

## Rejected

```meta
```

- A second file for the engine keys, and a second supported path for the config.
- Resolving the overlay from the main worktree via `git rev-parse --git-common-dir`: still
  inside a clone, so `git clean -x` and a re-clone take it.
- A `runtime` key for the application's facts, and a per-user file for session-naming words.
- `.agents/` as the config's folder: it holds authored rules that get wrapped, and a file nothing
  wraps would be the odd one in it.

## History

```meta
```

| Date | Change |
| --- | --- |
| 2026-09-29 | `bindings["openspec.grill"]` names the change lane's grill skill, or `null`. The engine carries it and never reads it; `devbook-config:init` writes it with the lane's `spec` and tracker bindings, and `devbook-config:local` may bind one per machine in an overlay. |
| 2026-09-29 | `policy["openspec.scenarios"]`: `advisory` by default, `linked` refusing a change's acceptance while a scenario names no test. Locked against overlays, beside `pr.required` and `qa.ceiling`: what acceptance requires is the repository's. A chore's `run` may carry `--flag` arguments; a service's provider may not. |
| 2026-09-27 | `devbook-config:doctor` resolves every provider id in the effective configuration against the installed skills and the repository's own skill folder: an id migration 015 retired is hard drift naming its successor, any other unresolved id a warning, and an unbound point nothing. The checker still validates shape only. |
| 2026-09-21 | `check.mjs --print` emits the merged configuration; a flow reads that document and never a layer by hand. A session learns of the overlays from delivery's session-start hook on both hosts; the rendered `AGENTS.md` section keeps the contributor rule and the directory, and names no plugin's file. |
| 2026-09-21 | The checkout layer retired: an overlay lives in the user's devbook config directory and never in a clone. `ext.<plugin>.<key>` accepted in an overlay and refused in the committed file; `devbook-config:local` owns writing the overlays. |
| 2026-09-17 | Session-naming labels configured in the dashboard's hand-edited component entry; `null` means no prefix. |
| 2026-09-15 | Overlay gains two layers under the devbook config directory, keyed by a committed `id`. |
| 2026-09-15 | The flow context file and the `repo-flow-context` slot retired; the `start` skill holds the runtime facts, and nothing to start is `app.start: null`. |
| 2026-09-15 | The flow context file moved from `.claude/` to `.devbook/` — superseded the same day by its retirement. |
| 2026-09-07 | `config.local.json` overlay: gates append, three policy keys and `components` refused. |
| 2026-09-07 | The file moves from `.github/ai-agent-stack.json` to `.devbook/config.json`, no fallback. |
| 2026-09-03 | One committed file holds the engine's four keys and every component's stamp. |
