# Architecture Decisions

```meta
status: active
number: 9
```

## Marketplace Named jsdotnet

```meta
status: active
date: 2026-09-02
related: [".devbook/domain/plugin-authoring/naming.md#marketplace"]
```

The marketplace is `jsdotnet`, not `jsdotnet-copilot` — this repository is not Copilot-specific.
The name is a per-machine primary key, so it only has to stay distinct from the other
marketplaces a user has added, and it is not renamed after release: a rename orphans every
installed `plugin@jsdotnet` reference and the cache directory keyed by it.

Consequence: a plugin ported here from `JSdotNet/Copilot` keeps its own name, so a user who has
both marketplaces added sees two installables. Superseding that repository means removing its
marketplace, not renaming plugins.

## One Folder Per Plugin

```meta
status: active
date: 2026-09-02
related: [".devbook/arc42/05-building-block-view.md#plugin-folder", ".devbook/domain/plugin-authoring/naming.md#plugin"]
```

Every plugin is self-contained under `plugins/<name>/`, with its own manifests and assets. It
installs and works alone, or it declares what it needs and lets the host enforce that.

Three ways to couple, and only the first is a dependency:

| Coupling | Use it for | Mechanism |
| --- | --- | --- |
| Hard dependency | A lower layer the plugin cannot work without | Declared with a version range; the host resolves it, and an illegal combination becomes unreachable. |
| Bridge plugin | Something that needs two stacks at once | Its own plugin, depending on both. Neither side learns about the other. |
| Surface capability | A dashboard, a canvas, a collector | Named capability resolved from the live tool list, no-op when absent. Never a dependency. |

A role, a tracker, or a specialist agent is bound per repository and is never a dependency: one
missing specialist must not take every skill that names it down with it.

## One Authored Copy Per Asset

```meta
status: active
date: 2026-09-02
related: [".devbook/tech/technology-graph.md#copilot-plugin-api"]
```

An asset is written once and read by both hosts, relying on both ignoring keys they do not
know. The cost is paid in the authored file: the tool list carries both hosts' tool ids, a
model pin must be a value both accept, and anything one host ignores — `handoffs`, `applyTo` —
is restated in prose or by path.

## No Generated Sync Layer

```meta
status: active
date: 2026-09-02
related: [".devbook/tech/technology-graph.md#powershell"]
```

A generator that derived the Claude-side files from the Copilot ones was written, verified, and
then dropped: it bought consistency for a plugin set that does not exist yet, and it made every
Claude manifest a file nobody was allowed to edit. Both manifests are hand-authored instead.

Consequence: what the generator used to lint — a missing description, an unloadable model pin,
a handoff the body never mentions — is now a review responsibility, written down in
[CLAUDE.md](../../CLAUDE.md). Revisit once the number of plugins makes that unreliable.

## devbook Ships the Folder Flows

```meta
status: active
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#flow-skill", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin"]
```

The layered design puts the five folder-writing skills — one per adopted folder — in
`devbook-flows`, an L2b bridge depending on both `devbook` and `delivery`, and the graph
renderer in `devbook-canvas`, an L3 surface. `devbook` as ported holds all of them, still under
the `orch-*` prefix, and the canvas as an in-plugin extension.

The canvas already carries its target name: the extension was renamed `knowledge-canvas` →
`devbook-canvas` ahead of the move, because a name is free to change now and a package id is
not once anything resolves it. Only its placement still diverges.

That placement is not free, though, and the rename is what made the cost visible. The canvas
imports `graph.mjs`, `outline.mjs`, and `metadata.mjs` out of `tools/knowledge-meta/` by
relative path — deliberately, so the rendered graph and the committed index are the same code —
and those three paths are what a lift breaks. So the move is not a move plus a manifest: the
generator modules have to become something a separate plugin can import first. `devbook` still
imports nothing from the canvas, which is the direction that matters for L0.

That is a knowing divergence, not an oversight. The port's brief was the schema and the two
lifecycle skills; splitting the plugin needs `delivery` to exist first, since a bridge that
cannot name what it bridges to is a plugin with a dangling dependency.

`delivery` has since landed, so the blocker is gone and this is now simply outstanding work.
Until it is done, `devbook` is not L0-clean and the claim that it works with only itself
installed stays untested — the five skills that would break it are the ones that reference a
dashboard. Closing it is one release: move the five into `devbook-flows` depending on both
`devbook` and `delivery`, rename them `flow-*`, replace their dashboard references with the
surface contract, and lift `devbook-canvas` into its own plugin — a rename it no longer needs,
but an import boundary it still does.

## Flat Knowledge Folders Only

```meta
status: active
date: 2026-09-03
related: [".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

The convention permits two layouts: five root-level dot-folders, or all five nested under one
`.devbook/` parent with the dots dropped. A repository picks one and never mixes them.

The generator understands only the flat one. `KNOWLEDGE_FOLDERS` lists `.arc42`, `.domain`,
`.tech`, `.design`, `.ai`, and every reference in the corpus is a path starting with one of
them, so a `.devbook/domain/…` address resolves to nothing.

Consequence, and it is a sharp one: **this repository uses the nested layout, so the plugin it
ships cannot check its own knowledge.** The chapters here are written to the convention and
validated by reading, not by running `devbook-check` on them. Close it by teaching the folder
resolution both prefixes — the addresses are already just repository paths, so nothing about
the schema changes.

## approved Is a Status Rung

```meta
status: active
date: 2026-09-03
```

The approval gate's decision lives in the chapter as `status: approved`, one shared rung on top
of each folder's own ladder, with `approved-by` and `approved-at` beside it.

The design says both "a rung on top of its ordinary status ladder" and lists `approved` in the
table of metadata fields. Only one can be built. A rung was chosen: a chapter has one lifecycle
state, and a separate boolean field beside `status` would let a chapter claim `draft` and
approved at once — which is exactly the ambiguity the gate exists to remove.

Consequence: every other repository's schema assumes this shape, so it is a hard break to
revisit later. Confirm it with whoever owns the gate design before this is depended on. The
implementation is one `APPROVED_STATUS` constant appended to each ladder, so reversing it is a
migration and not a rewrite.

## Comments Are Findings Until the Fence Lands

```meta
status: active
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#extension-namespace", ".devbook/arc42/09-architecture-decisions.md#devbook-ships-the-folder-flows"]
```

`devbook-collaboration` records a comment as one single-line finding in the chapter's
`ext.devbook-collaboration.open-<n>` key. No author, no replies, no quoted passage, no thread.

The design it implements has a richer answer: a second fenced `annotation` block in the chapter
body, carrying `author`, `date`, `kind`, `quote`, and a `replies` list, anchored by position and
swept when resolved. That block is an L0 feature — it belongs to `devbook`, and `devbook` has
not built it. Two ways to reach it were open, and both were refused. Building the fence from
here would put a schema element into `devbook`'s files from a plugin above it, which is the one
thing the layering forbids. Building a threaded store inside `ext` instead would be a rival
implementation of a mechanism already designed, with a migration owed to every repository that
adopted it.

So the third option: record the smallest thing that survives a session. A finding is one key
because the block grammar splits a bracketed list on every comma, including inside quotes — a
sentence written as a list entry comes back in pieces — and one key per finding gives each its
own line and its own diff hunk, which is what the fence design wanted from threads anyway.

Consequence: a question here loses who asked it and cannot be replied to in place; the exchange
happens in the pull request, and only the unresolved residue stays on the chapter. Close this
when `devbook` ships the fence — the migration is one pass, since every `open-<n>` becomes one
fence with `body` set from the line and `author` unknown.

## The Point Set Is Closed

```meta
status: active
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#extension-point", ".devbook/arc42/05-building-block-view.md#stack-config"]
```

`delivery` declares eleven extension points and a repository fills them. It never adds one, and
it never defines a stage.

The line is that configuration chooses among behaviour the engine already implements. A stage
is a prompt, not a program — "apply TDD", "escalate instead of continuing when the request
needs a new architectural decision" — so encoding one as JSON either drops the prose, which
makes the stage useless, or buries paragraphs in strings, which is a worse Markdown file with
no diff readability and nowhere to say why. A per-repository stage DSL would also re-create,
once per repository, exactly the drift that merging 27 duplicated skills into one engine just
removed.

The escape hatch is already there and is better: a repository that genuinely needs a different
shape writes a repo-native `flow-*` skill, which takes precedence for the categories it covers
and can still reuse `phase-*` and the service contracts.

Consequence: a repository whose need is not expressible as a provider, a gate, or a policy
switch has to write a skill, not file a feature request for a config key. If that turns out to
be common, the answer is a new point in the closed set — added here, deliberately — never an
open one.

## One Config File, Two Kinds of Key

```meta
status: active
date: 2026-09-03
related: [".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/domain/plugin-authoring/naming.md#stamp"]
```

`.github/ai-agent-stack.json` carries both the engine's four keys — `bindings`, `extensions`,
`policy`, `gates` — and every component's `components.<name>` entry, in one committed file that
nobody but the owner writes into.

The alternative was a second file for the engine. One file wins because the two halves are read
by the same people at the same moment: whoever decides which folders devbook adopts is
deciding, in the same sitting, which tracker the flows post to. Two files would also give the
repository two places to disagree with itself about what is installed.

`policy` keys are closed enums or numbers with documented defaults, so an absent key means the
engine's own choice rather than undefined, and an unknown key is rejected by name rather than
ignored — the same discipline `claude plugin validate --strict` applies to a manifest, which is
what makes the file safe to hand-edit. `pr.base` is the single exception to the closed-enum
rule and is validated as a git ref instead.

Consequence: two components can conflict on the file itself when both write it in one session.
Each writes only its own key, so the conflict is textual rather than semantic, but nothing
enforces that yet beyond the rule being written down.

## Extension Points and Gates Live in the Surface Contract

```meta
status: active
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md#the-point-set-is-closed"]
```

One instruction file — `surface-contract.instructions.md` — holds the point set, the gates
mechanism, the stack config, the host slots, and the surface capability with its reporting
contract. It replaces three files that came across from the two host plugins:
`orch-dashboard-contract`, `dashboard-usage`, and `canvas-usage`.

The layered design treats the surface capability and the extension points as separate concerns,
and splitting them would honour "state each rule in exactly one file" more literally. They are
together because they are one subject stated from one side: everything outside the engine that
a flow talks to, and the terms on which it does. A run reads them at the same moment — once,
before the first stage transition — so splitting would buy a second file to keep in step and no
reduction in what any run loads.

Consequence: it is the largest instruction file in the plugin and it is read early in every
run, so a section added to it is paid for on every turn of every flow. Split it the moment a
part of it stops being read at that same moment — the reading-order table in `flow-phases` is
where that would be recorded.

## A Tracker Is a Binding, Not a Phase Name

```meta
status: active
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#tracker"]
```

The closing phase that reports a finished run to the work item is **Work Item Update**, not
GitHub Issue Update. The ported skills named GitHub in the phase itself, in the stage list every
one of them passes to `start_run`, and in their prose.

A phase that names one implementation cannot be bound to another. `bindings["delivery.tracker"]`
is the whole point: GitHub issues, Jira tickets, and `.backlog/` chapters are three
implementations of `find_item`, `read_item`, `create_item`, `comment`, `transition`, and
`link_change`, and a repository that plans work as Markdown has been doing the third all along.

Consequence: the stage name changed in 32 skills at once, so a run resumed from state written
before this release finds a stage name that no longer matches. Nothing resumes across it,
because nothing has run yet — which is the one moment this rename is free.

## delivery Ships No Surface

```meta
status: active
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin"]
```

The MCP server that backed the run dashboard stays in `JSdotNet/Copilot` and is not ported
here. `delivery` resolves a surface from the live tool list and no-ops when none answers.

That is the design working, not a gap in it: a surface is a separate L3 plugin precisely so the
engine neither depends on it nor knows which one answered. Porting the server into `delivery`
would have made the engine own its own viewer, which is the coupling the contract exists to
prevent.

Consequence, and it is a real one: **installing `delivery` today gives no live run timeline at
all.** Every run reports that no surface is bound, produces its file artifacts, and continues.
The `flow-runner` allowlist keeps the legacy `orch-dashboard` tool patterns beside the new ones
for one version, so an existing dashboard installation still answers. Close this by landing
`delivery-dashboard`; the second implementation is what will prove the contract is a contract.

