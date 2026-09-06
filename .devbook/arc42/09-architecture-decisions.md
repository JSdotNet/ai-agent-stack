# Architecture Decisions

```meta
number: 9
related: [".devbook/arc42/11-risks-and-technical-debt.md"]
```

Decisions taken and defensible. A record that ends in options rather than a choice is debt,
not a decision, and lives in [chapter 11](11-risks-and-technical-debt.md) instead.

## Marketplace Named jsdotnet

```meta
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
date: 2026-09-02
related: [".devbook/tech/hosts.md#copilot-plugin-api"]
```

An asset is written once and read by both hosts, relying on both ignoring keys they do not
know. The cost is paid in the authored file: the tool list carries both hosts' tool ids, a
model pin must be a value both accept, and anything one host ignores — `handoffs`, `applyTo` —
is restated in prose or by path.

## No Generated Sync Layer

```meta
date: 2026-09-02
related: [".devbook/tech/tooling.md#powershell"]
```

A generator that derived the Claude-side files from the Copilot ones was written, verified, and
then dropped: it bought consistency for a plugin set that does not exist yet, and it made every
Claude manifest a file nobody was allowed to edit. Both manifests are hand-authored instead.

Consequence: what the generator used to lint — a missing description, an unloadable model pin,
a handoff the body never mentions — is now a review responsibility, written down in
[CLAUDE.md](../../CLAUDE.md). Revisit once the number of plugins makes that unreliable.

**Revisited, 2026-09-05.** Seventeen plugins and 161 budgeted assets made it unreliable: a
review found five role agents still carrying tools a decision one day earlier said were gone.
The lint is back as `tools/check-assets.mjs`, but as a checker over hand-authored files, not a
generator that owns them — it reports, it writes nothing, and both manifests stay hand-authored.
That is the half of the original that was worth keeping.

## devbook Still Ships the Graph Canvas

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin"]
```

The layered design puts the five folder-writing skills — one per adopted folder — in
`devbook-flows`, an L2b bridge depending on both `devbook` and `delivery`, and the graph
renderer in `devbook-canvas`, an L3 surface. The flows have moved; the canvas has not.

**The flow half is closed.** `orch-domain`, `orch-tech`, `orch-design`,
`orch-arc42-content`, and `orch-ai` are now `flow-domain`, `flow-tech`, `flow-design`,
`flow-arc42-content`, and `flow-ai` in `devbook-flows`, which declares both dependencies and
is demoted without either. `orch-backlog` was not carried over: `.backlog` is gone, so the
sixth flow the design named has nothing to write. Their dashboard references became the
surface contract, and each declares its own documentation/config tier, because the engine
never enumerates a skill in a layer above it. `devbook` now names no flow by name: its
converters resolve the write path — repo-native skill, folder flow, `flow-fallback`, or the
instruction files — through one section of `assets/code-sync-protocol.md`.

**The canvas half is not, and the reason is an import boundary rather than a rename.** The
extension was renamed `knowledge-canvas` → `devbook-canvas` ahead of the move, because a name
is free to change before anything resolves it. But it imports `graph.mjs`, `outline.mjs`, and
`metadata.mjs` out of `tools/devbook-meta/` by relative path — deliberately, so the rendered
graph and the committed index are the same code — and those three paths are what a lift
breaks. So that move is not a move plus a manifest: the generator modules have to become
something a separate plugin can import first. `devbook` still imports nothing from the canvas,
which is the direction that matters for L0.

Consequence: `devbook` is L0-clean on the skill side and can now be installed alone, which the
five dashboard-referencing skills previously made untrue. It still ships a surface inside its
own folder, so the claim that a surface is never packaged with what it renders stays
unenforced here. Close it by lifting `devbook-canvas` into its own plugin once the generator
modules have a published shape to import.

## Flat Knowledge Folders Only

```meta
date: 2026-09-03
related: [".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

The convention permits two layouts: five root-level dot-folders, or all five nested under one
`.devbook/` parent with the dots dropped. A repository picks one and never mixes them.

The generator understands only the flat one. `DEVBOOK_FOLDERS` lists `.arc42`, `.domain`,
`.tech`, `.design`, `.ai`, and every reference in the corpus is a path starting with one of
them, so a `.devbook/domain/…` address resolves to nothing.

**Closed, 2026-09-04, in `devbook` 1.2.0.** The fix was the one this decision named: the
folder resolution now recognizes both prefixes. `folderKindForPath` strips an optional
`.devbook/` and matches the five names either way, discovery probes both spellings and reports
which layout it found, and everything downstream works off the path it is handed — so scopes,
`_meta/` output paths, and references needed no change at all. Contract version 7, additive,
no migration. `nested-layout.test.mjs` holds the same corpus written both ways and asserts the
two produce the same nodes and the same edges.

It cost more than the prose suggested in exactly one place: a repository containing *both*
layouts. The generator now indexes both and raises an error saying addresses will not agree
until one is moved, rather than silently indexing half a corpus — which is what the old code
did to this repository, and why the gap went unnoticed.

What that gap actually hid is the argument for having closed it. The first real run over
`.devbook/` found eleven defects nothing had ever reported: two invalid `status` values, eight
missing `type` fields, and one `type` naming a kind the schema had no word for. A convention
that cannot check the repository that ships it will accumulate exactly that, and reading is not a
substitute — every one of those files had been read several times.

## approved Is a Status Rung

```meta
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
date: 2026-09-04
related: [".devbook/domain/plugin-authoring/naming.md#extension-namespace", ".devbook/arc42/09-architecture-decisions.md#devbook-still-ships-the-graph-canvas"]
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
happens in the pull request, and only the unresolved residue stays on the chapter.

**Superseded in part, 2026-09-04.** `devbook` 1.1.0 ships the fence: the schema and placement
rule in `devbook-annotations.instructions.md`, the parse and lint in `metadata.mjs`, the
derived `_meta/annotations.json`, and `annotations.mjs` as the one writer. So the premise this
decision rested on — that L0 has not built it — no longer holds, and the reason to keep findings
in `ext` is gone with it.

What is *not* done is the L1 half. `devbook-collaboration` still writes
`ext.devbook-collaboration.open-<n>`, and until it moves, a repository with both plugins has two
places to leave a comment. The migration is the one this decision already named: every
`open-<n>` becomes one fence with `body` set from the line and `author` unknown, placed against
the chapter rather than a passage, because a finding never recorded which passage it was about.
Close this decision in the change that ships it.

Two divergences from the design were taken deliberately. It says "knowledge-base is at 0.14.0;
this is the next minor — or devbook 0.1.0, if the rename wave lands first"; the rename landed
and the plugin was already at 1.0.0, so the next minor here is 1.1.0. And it closes with
"nothing under `.arc42` and no plugin file changes until the direction is agreed" — the
direction was agreed in the session that asked for the build, and this paragraph is the record
of that.

## The Point Set Is Closed

```meta
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
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin"]
```

The MCP server that backed the run dashboard stays in `JSdotNet/Copilot` and is not ported
here. `delivery` resolves a surface from the live tool list and no-ops when none answers.

That is the design working, not a gap in it: a surface is a separate L3 plugin precisely so the
engine neither depends on it nor knows which one answered. Porting the server into `delivery`
would have made the engine own its own viewer, which is the coupling the contract exists to
prevent.

Consequence: **installing `delivery` alone gives no live run timeline at all.** Every run
reports that no surface is bound, produces its file artifacts, and continues. That is now a
choice rather than a gap — `delivery-dashboard`, `delivery-canvas`, and `delivery-collector`
ship beside the engine, and enabling one is what makes a run visible. The `flow-runner`
allowlist carried the legacy `orch-dashboard` tool patterns beside the new ones for one
release; they went with the plugin that shipped that server.

See [Three Surfaces, One Contract](#three-surfaces-one-contract) for what each of them
answers.

## Three Surfaces, One Contract

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/09-architecture-decisions.md#delivery-ships-no-surface", ".devbook/arc42/05-building-block-view.md#surface-plugins"]
```

Three plugins implement `delivery.surface.*@1`, none depending on `delivery` or on each other:
`delivery-dashboard` answers all three capability groups, `delivery-canvas` answers render
only, `delivery-collector` answers lifecycle and export only.

Two of the three would have been enough to ship a viewer. Three is what makes the contract a
contract: the moment a second implementation exists, the split by operation group stops being
a table in an instruction file and starts being the thing that decides what a run gets. A
caller resolves each group separately, so a repository with only the collector installed
records a run and renders nothing — and finds that out by the render names being absent, not
by a stub answering and doing nothing.

The collector is written here rather than ported, and its two absences are the point. It
captures no telemetry, so it reports no token or cost figures at all rather than a column of
zeroes that reads as a measurement; and `export_report` writes Markdown only, because a
self-contained HTML report with evidence inlined is a rendering job. Asking it for another
format still writes Markdown and says so in the result rather than failing a run over a file
extension.

Consequence: three run stores, one per plugin, each keyed by worktree path under its own
directory. Two surfaces bound at once record the same run twice and neither knows about the
other. That is the price of "a surface is never a dependency in either direction" — the
alternative is a shared store, which is a coupling between implementations that are supposed
to be swappable. Bind one lifecycle surface per repository.

## A Surface Declares Only the Contract's Tool Names

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md#three-surfaces-one-contract", ".devbook/domain/plugin-authoring/naming.md#surface"]
```

Each surface exposes exactly the tool names its capability groups name, and nothing else. The
ported dashboard lost two tools in the move — `get_view` and `pop_view`, which the rendered
page used to read and rewind a viewer — and the page reaches the same state over the server's
own HTTP origin instead.

An extra tool is not free the way an extra function is. It is one more name in the live tool
list, one more thing a caller can come to depend on, and the first thing that makes one
implementation not substitutable for another: a run that calls `pop_view` works on the
dashboard and fails on the canvas, and nothing in the contract said it would.

The same rule reaches into the run schema, in two renames the port made:

- `githubIssue` became `workItem`, and the stage the report hides when it is absent matches
  `Work Item Update` rather than `GitHub Issue Update`. A surface that only knows GitHub
  cannot show a run tracked in Jira or in `.backlog/` chapters, which is exactly what
  [a tracker being a binding](#a-tracker-is-a-binding-not-a-phase-name) means.
- `approval.personalValidation` became `approval.state`. Personal Validation is one instance
  of the gate mechanism, and a surface whose schema names it cannot record the decision of any
  other gate a repository adds.

Consequence: a run file written by the old `orch-dashboard` does not read correctly here — the
work item and the approval decision land in fields nothing looks at. Nothing migrates them,
because the new plugins keep their own state directories and no run has been written to one
yet. That is the one moment these renames are free.

## No Host Profile Plugins

```meta
date: 2026-09-05
related: [".devbook/domain/plugin-authoring/naming.md#host-slot", ".devbook/arc42/05-building-block-view.md#host-slots"]
```

`claude-desktop` and `copilot-app` are deleted. Nothing in this marketplace names one host's
own file, path, or capability any more, and no plugin ships slot bindings.

They were kept for one change as the place a host's facts were allowed to live: six slot
bindings each, plus three procedures that cap a *session* rather than a run — `start` and
`session-handoff` on one side, `update-open-sessions` on the other. What that bought was a
six-line table per host and a hook to inject it. What it cost was a plugin per host in a
marketplace whose whole premise is that one authored copy serves both, and a standing
obligation that every slot added to the engine be answered twice, with nothing checking that
it was.

Three consequences, and the second is the one to watch:

- **The three session skills are gone, not rehomed.** Folding them into `delivery` was the
  alternative, and it was refused: `start` opens a URL in a host's own browser pane and
  `update-open-sessions` walks a host's own worktrees, so moving them would have moved the
  host-naming into the engine rather than out of the marketplace. `session-handoff` had the
  one real claim, and the engine already carried its procedure inline under **Session
  Handoff** in `flow-execution-model.instructions.md` — which is now the only copy.
- **Every slot resolves unbound unless a repository binds it.** `repo-instructions` falls back
  to `AGENTS.md`, `model-override` to category defaults, `stage-delegation` to running stages
  inline, `surface` to file artifacts, `pr-lane` to no pull request. Three of the six are
  settable under `bindings["delivery.slots"]`; `model-override` deliberately is not, because
  model choice is personal, and `stage-delegation` and `surface` are read from the live
  session rather than declared anywhere. A repository that wants the old Claude answers writes
  three lines of config.
- **The slot set outlives its binders.** It stays declared in
  `surface-contract.instructions.md`, because what it buys is a shared asset that never grows
  an if-this-host clause, and a slot nobody binds still buys that.

## delivery-canvas Ships the Canvas Only

```meta
date: 2026-09-05
related: [".devbook/arc42/09-architecture-decisions.md#three-surfaces-one-contract", ".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

`delivery-canvas` is a Copilot canvas extension and nothing else. No MCP server, no Claude
manifest, no marketplace entry — its two viewer pages live in `extensions/delivery-canvas/views/`
and the canvas actions `render_diagram` and `render_markdown` are the whole surface.

It shipped both transports for two days, on the argument that the layered design's combination
table lists *delivery + delivery-canvas* as a supported outcome and a host without a canvas
panel could not reach it otherwise. That argument was answered from the wrong side:
`delivery-dashboard` already implements the render group with the same two viewers, and it is
what the `surface` slot resolves to wherever there is no canvas to open. So the MCP half was a
second implementation of a covered capability, kept for a combination nobody with the dashboard
installed has a reason to add.

What made this cheap to reverse is that the canvas half never depended on the server half: the
extension declares its own actions and serves its own pages, so removing 870 lines of server,
MCP App bridge, MCPB manifest, and stdio dev check changed no behaviour on the host that keeps
it. The two viewer pages carry no MCP-specific code and moved unedited.

Consequence, and it is the reason this record exists rather than a deletion: the render
capability now has one implementation per host, so the contract's priority order — dashboard
before collector before canvas — goes back to being theoretical, and a surface can now arrive
as something other than an MCP server. The contract's resolution rule says so explicitly: match
the operation names, not the transport. The cost is that `delivery-canvas` has no automated
check any more — the only one drove the deleted server over stdio — and its pages are now
verified on the Copilot host or not at all, which is the open half of the `trial` status on
[the SDK](../tech/hosts.md#copilot-extension-sdk).

## A Role Plugin Holds No Flow Control

```meta
date: 2026-09-04
related: [".devbook/domain/plugin-authoring/naming.md#role", ".devbook/domain/plugin-authoring/naming.md#gate", ".devbook/arc42/05-building-block-view.md#role-plugins", ".devbook/arc42/09-architecture-decisions.md#the-point-set-is-closed"]
```

A [role plugin](05-building-block-view.md#role-plugins) contributes expertise and artifacts. It
does not sequence stages, hold gates, spawn sessions, or delegate to other agents. Those belong
to whatever consults it.

The ported plugins each arrived carrying all four. Every one had an
`agent-handoff.instructions.md` defining a mandatory propose-approve-handoff sequence with a
compliance checklist; each agent carried `create_session`, `send_session_message`,
`respond_to_session_plan`, `Agent`, and `SendMessage`; and each agent body ran a
gather, plan-with-review-checkpoints, execute-after-approval loop of its own.

Three reasons that had to go, and only the first is about tidiness:

**A gate a plugin owns cannot be governed.** Configuration may add a gate anywhere and may
never remove one — the asymmetry that makes gates safe is that adding a checkpoint can only
make a flow more conservative. A gate written into a specialist's instruction file is outside
that mechanism in both directions: a repository cannot remove it, and the engine cannot count
it. Personal Validation stops being the mandatory instance of one pattern and becomes one of
several unrelated approval prompts.

**Two sequencers disagree.** A flow already decides what runs when, what a stage returns, and
whether the human sees it. A specialist that also plans, checkpoints, and waits for approval
either duplicates that or contradicts it, and the failure is silent: the run looks like it is
progressing while two things arbitrate the same decision.

**Session spawning in a role is fan-out through the back door.** `fleet` exists precisely
because a flow may never split across sessions, and the mechanism was put in a separate plugin
so the reach would be impossible rather than discouraged. A role agent holding `create_session`
puts it back one tool call away from every flow that must not use it.

What stays is the part that is not control: an agent names its handoff targets in prose, since
both hosts need that and Claude reads nothing else. It says a handoff is warranted and why.
Whether that needs approval, and what happens to the artifact in between, is the caller's.

Consequence: **a role plugin used bare is less guided than it was.** Run the `arc42` agent
outside any flow and nothing prompts for approval before it writes. That is the honest trade —
the guidance was never enforceable anyway, since an instruction file is a prompt and not a
mechanism, and pretending otherwise is what made two of them contradict the assets shipped
beside them. A repository that wants a checkpoint adds a gate, which the engine can see.

**Completed, 2026-09-05.** The change that recorded this cleaned three agents and left five.
`coding`, `documentation`, `profile`, `qa`, and `spec-builder` now carry no spawning or
delegation tool and hold no approval question; `tools/check-assets.mjs` fails on any role
agent that grows one back.

## Budgets Are Disclosure Triggers, Not Gates

```meta
date: 2026-09-05
related: [".devbook/arc42/tdr/1-body-budgets-unenforced.md", ".devbook/domain/plugin-authoring/features.md#stay-within-budget", ".devbook/arc42/09-architecture-decisions.md#no-generated-sync-layer"]
```

[Debt record 1](tdr/1-body-budgets-unenforced.md) measured the body budgets at eleven percent
compliance and recommended restoring the disclosure rule `CLAUDE.md` had dropped in the port.
This is that remediation, and one step past it.

The budget stays, as what `spec-conciseness.instructions.md` already calls it: the trigger for
a disclosure decision, not a hard limit. Past it, an author moves on-demand reference behind a
pointer, splits the asset by branch, or states why it must be long. The step past the record's
recommendation is where the reason is stated for the assets that are long by kind rather than
by accident:

| Kind | Why it exceeds by nature |
| --- | --- |
| `flow-*`, `phase-*`, `fleet-*`, `automation-*` skills | A staged procedure is read once per run and every stage of it is safety-critical prose — gate wording, what a stage returns, what happens when a step fails — which the terseness rule exempts. |
| `to-spec-*` and `from-spec-*` converters | Each carries the full mapping between one chapter kind and code, and a mapping stated by half is wrong. |
| `devbook-*.instructions.md`, `surface-contract`, `flow-*.instructions.md` | A schema or a contract is the single source the conciseness rule tells everything else to point at; it cannot itself be a pointer. |
| `flow-runner` and `qa` agents | Each is a session's main loop and carries its own invocation contract. |

For those kinds the reason is stated here, once, and not repeated at the top of a hundred
files. The record's own evidence supports the split: the plugin that owns the rule meets it at
a median of 28 lines, and the four that miss it by four to ten times are exactly the ones made
of staged procedures and contracts. Everything else over budget — a role plugin's how-to
skills, the pull-request lane, the two profile skills — is owed a trim or a reason line in the
file, and `tools/check-assets.mjs --budgets` is the list.

Consequence: the number in `CLAUDE.md` is a review prompt and not a gate the checker fails on.
An asset that grows past its budget is asked what it disclosed and why, not refused. The debt
record moves to `in-progress` rather than `resolved`, because the assets outside the four
kinds have not yet said why. If the table ever needs a fifth row, the budget is the wrong tool
for that kind and should say so.

## Four arc42 Chapters

```meta
date: 2026-09-05
related: [".devbook/arc42/01-introduction-and-goals.md", ".devbook/arc42/05-building-block-view.md", ".devbook/arc42/11-risks-and-technical-debt.md"]
```

`.devbook/arc42` holds chapters 1, 5, 9, and 11, the `tdr/` set, and no others, deliberately.
arc42 numbers twelve; the convention here says a chapter is written when it has content, not
to complete a set.

There is no runtime here, so the runtime view (6), deployment view (7), and quality scenarios
(10) would describe hosts this repository does not own. Constraints (2), context (3), and
solution strategy (4) are carried by the domain folder's context map and dependencies and by
the quality goals in chapter 1. Cross-cutting concepts (8) are the naming chapter, and the
glossary (12) is `naming.md` itself.

Consequence: a reader used to arc42 finds gaps in the numbering. The building-block view, the
decisions, and the debt are where the substance is, and the numbering is kept so a later
chapter lands in its place rather than being renumbered in.

## Fan-Out Is Its Own Plugin

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#fleet-skill", ".devbook/domain/plugin-authoring/naming.md#layer", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin"]
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

## The Guide Names Every Plugin and Depends on None

```meta
date: 2026-09-05
related: [".devbook/domain/plugin-authoring/naming.md#layer", ".devbook/arc42/05-building-block-view.md#guide-plugin", ".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key", ".devbook/arc42/09-architecture-decisions.md#no-host-profile-plugins"]
```

A skill that explains the stack has to name every part of it, and the [layer](../domain/plugin-authoring/naming.md#layer)
rule says a lower layer never names a higher one. Both cannot hold in the same plugin, which is
why `stack-guide` is a plugin of its own with an empty `dependencies` array rather than a skill
inside `devbook`.

The rule is about the dependency order, and naming is not depending. `delivery` already carries
over two hundred `plugin:asset` references into seven [role plugins](05-building-block-view.md#role-plugins)
it never declares, and a reference that resolves to nothing degrades one stage instead of
failing a load. The guide is the same shape taken further: it names every plugin in the
catalog, resolves
each against what is on disk, and reports a plugin it cannot find as `not installed` — which is
an answer, not a degradation. Nothing it names is loaded, so there is nothing to dangle.

Putting it in `devbook` was the obvious first move and is the one the README already argues
against: the five per-folder flows left that plugin for `devbook-flows` precisely because
keeping them made the foundation name the layer above it. Adding a skill that names `delivery`,
`fleet`, and all three surfaces would have undone that in a larger way, and it would have made
the guide unreachable for anyone who installed the engine without the knowledge convention.

**The write skills stop at the engine keys.** `stack-init` and `stack-update` own `bindings`,
`extensions`, `policy`, and `gates`, and every `components.<name>` stamp stays with that
component's own sync skill — the rule [one config file, two kinds of key](#one-config-file-two-kinds-of-key)
already states. Three things follow from it and all three are load-bearing: only the sync skill
knows what it materialized, a plugin's payload and migration ledger live inside that plugin
where a foreign skill has no supported path to them, and `devbook` has to keep installing
itself to stay a foundation that works with only itself installed. So `stack-update`'s fourth
step invokes `devbook-sync`; it never applies a migration or writes a ledger of its own.

**It names a host's own paths, and that is a divergence taken on purpose.**
[No host profile plugins](#no-host-profile-plugins) ended host-naming everywhere else in this
marketplace, and the report is the one asset that kept it: the host's config directory, its
installed-plugin file, its marketplace clones, and its three settings layers. The rule it bends
is about a *shared asset* growing an if-this-host clause, and this is not that. Where a plugin
is installed and whether it is enabled is a fact about a host and about nothing else, so an
asset answering it either names those files or answers nothing, and no flow reads what it
returns. A slot would be the clean fix and there is none to bind: the closed set has no member
for *where this host keeps its plugins*, and adding one is the engine's call, not the guide's.

Consequence: **the guide can be wrong about a plugin it cannot see.** It reports one host's
plugin state, and on the other host the installed and enabled columns come back empty. It says
which files it read and which were absent rather than inferring, so the failure mode is a
visible blank rather than a confident wrong version — but a truthful answer there needs a host
slot the engine does not have yet.

## Devbook Payload Named After Its Plugin

```meta
date: 2026-09-05
related: [".devbook/domain/plugin-authoring/naming.md", ".devbook/arc42/05-building-block-view.md#plugin-folder", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin", ".devbook/arc42/11-risks-and-technical-debt.md"]
```

Every `knowledge-` name inside `devbook` becomes `devbook-`: the two tool folders
(`tools/devbook-meta`, `tools/devbook-tech`), the two shipped workflows, the nine instruction
files, the `devbook-tech-update` skill, `assets/build/Update-DevbookIndex.ps1`, and the module
constants (`DEVBOOK_FOLDER_NAMES`, `DEVBOOK_PATH_PREFIX`) behind them. `knowledge` survives
only as the English word for what a chapter holds.

The prefix was the old plugin's name, `knowledge-base`. The canvas extension was already
renamed on this reasoning — see [devbook Still Ships the Graph Canvas](#devbook-still-ships-the-graph-canvas) — and leaving the payload
behind left one plugin shipping two vocabularies. It also broke the naming rule the convention
states about itself: a name does not repeat what its location already says, and inside
`plugins/devbook/` the old prefix said nothing except which plugin used to own the folder.
`devbook-` is not redundant at the *destination*, which is the shared `.github/tools/`,
`.github/workflows/`, and `.github/instructions/` of a consuming repository.

**Consequence, and the part that is not yet closed: the renamed assets are payload.** A
repository synced before this rename holds `.github/tools/knowledge-meta/`,
`.github/workflows/knowledge-meta*.yml`, `.github/instructions/knowledge-*.instructions.md`,
and `build/Update-KnowledgeIndex.ps1`, all recorded under those keys in the stamp's
`materialized` map. Re-syncing installs the new names beside the old ones rather than over
them — exactly the two-spellings outcome the plugin README tells adopters to avoid. Closing it
needs a migration that moves the six materialized paths, rewrites the references inside them,
and rekeys the stamp; that migration is not written, so it is carried as debt in
[chapter 11](11-risks-and-technical-debt.md) rather than claimed here.

Migration `006-drop-backlog` is the one asset the rename could not simply follow. It runs
*before* a repository is renamed, so it now matches both workflow spellings; its id and its
contract version are unchanged, because a shipped migration is never rewritten into something
different, only made to keep working.
