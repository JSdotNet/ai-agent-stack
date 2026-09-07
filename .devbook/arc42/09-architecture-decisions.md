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
[AGENTS.md](../../AGENTS.md) and the rules it points at. Revisit once the number of plugins makes that unreliable.

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
renderer in `devbook-graph`, an L3 surface. The flows have moved; the canvas has not.

**The flow half is closed.** The five folder-writing skills are now `flow-domain`,
`flow-tech`, `flow-design`, `flow-arc42-content`, and `flow-ai` in `devbook-flows`, which
declares both dependencies and is demoted without either. The sixth the design named was for
`.backlog`, which is gone, so it was not carried over and has nothing to write. Their dashboard references became the
surface contract, and each declares its own documentation/config tier, because the engine
never enumerates a skill in a layer above it. `devbook` now names no flow by name: its
converters resolve the write path — repo-native skill, folder flow, `flow-fallback`, or the
instruction files — through one section of `assets/code-sync-protocol.md`. Superseded on
2026-09-07: the five flows moved again, into `delivery` itself, and the bridge is gone — see
[Flows Belong to Delivery](#flows-belong-to-delivery).

**The canvas half is not, and the reason is an import boundary rather than a rename.** The
extension was renamed `knowledge-canvas` → `devbook-canvas` ahead of the move, because a name
is free to change before anything resolves it, and again to `devbook-graph` on 2026-09-07 for
the same reason — see [the decision](#devbooks-canvas-carries-no-surface-word). But it imports
`graph.mjs`, `outline.mjs`, and `metadata.mjs` out of `tools/devbook-meta/` by relative path —
deliberately, so the rendered graph and the committed index are the same code — and those
three paths are what a lift breaks. So that move is not a move plus a manifest: the generator
modules have to become something a separate plugin can import first. `devbook` still imports
nothing from the canvas, which is the direction that matters for L0.

Consequence: `devbook` is L0-clean on the skill side and can now be installed alone, which the
five dashboard-referencing skills previously made untrue. It still ships a surface inside its
own folder, so the claim that a surface is never packaged with what it renders stays
unenforced here. Close it by lifting `devbook-graph` into its own plugin once the generator
modules have a published shape to import.

## Flat Devbook Folders Only

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
rule in `devbook-annotations.md`, the parse and lint in `metadata.mjs`, the
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

`.devbook/config.json` carries both the engine's four keys — `bindings`, `extensions`,
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

## The Stack Config Lives in devbook

```meta
date: 2026-09-07
related: [".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key", ".devbook/arc42/09-architecture-decisions.md#no-host-profile-plugins"]
```

The stack config is `.devbook/config.json`. It was `.github/ai-agent-stack.json` and the folder
was wrong from the first commit: `.github/` is one host's folder, and a file both hosts read
does not belong in either one's. The same rule that
[ended host profile plugins](#no-host-profile-plugins) applies to a path.

`.devbook/` won over `.agents/`, the other host-neutral folder here. `.agents/` holds authored
rules that get wrapped per host, so a file nothing wraps would be the odd one in it. `.devbook/`
already holds the repository's own account of how it works, which is what this file is the
machine-readable half of — and it puts the folders a repository adopts and the wiring it
declares in one place, for the same reason the file itself is
[one file with two kinds of key](#one-config-file-two-kinds-of-key).

**The path is not a dependency.** `delivery` reads that file whether or not the repository
adopted a single devbook folder, and `devbook` uninstalled costs the engine nothing: reading a
path is not naming a plugin, and no [layer](../domain/plugin-authoring/naming.md#layer) order
is touched. What the folder means widens by one file — the chapters plus the wiring — and
`devbook-install` still owns nothing but the chapter folders.

The filename drops the marketplace's name with the folder. `ai-agent-stack.json` was
disambiguating inside `.github/`, where it sat among a host's own files; inside `.devbook/`
there is one config and `config.json` is what it is called. `delivery`'s two resources follow
the file they describe — `resources/config.schema.json` and `resources/config-template.json`.

Consequence: **every repository already on the stack has the file in the old place, and nothing
reads it there.** There is no fallback and deliberately so — two supported paths is two places
for a repository to disagree with itself. `devbook-config:update` reports the old file and
moves it as its first step, and the report prints the legacy path whenever it still exists, so
the failure mode is a named instruction rather than settings that silently stop applying.

## Extension Points and Gates Live in the Surface Contract

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md#the-point-set-is-closed"]
```

One instruction file — `surface-contract.md` — holds the point set, the gates
mechanism, the stack config, the host slots, and the surface capability with its reporting
contract. It replaces three files that came across from the two host plugins: the predecessor
dashboard's contract, `dashboard-usage`, and `canvas-usage`.

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
choice rather than a gap — `delivery-surface-dashboard`, `delivery-surface-canvas`, and `delivery-surface-collector`
ship beside the engine, and enabling one is what makes a run visible. The `flow-runner`
allowlist carried the predecessor dashboard's tool patterns beside the new ones for one
release; they went with the plugin that shipped that server.

See [Three Surfaces, One Contract](#three-surfaces-one-contract) for what each of them
answers.

## Three Surfaces, One Contract

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/09-architecture-decisions.md#delivery-ships-no-surface", ".devbook/arc42/05-building-block-view.md#surface-plugins"]
```

Three plugins implement `delivery.surface.*@1`, none depending on `delivery` or on each other:
`delivery-surface-dashboard` answers all three capability groups, `delivery-surface-canvas` answers render
only, `delivery-surface-collector` answers lifecycle and export only.

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

Consequence: a run file written by the predecessor dashboard does not read correctly here — the
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
  Handoff** in `flow-execution-model.md` — which is now the only copy.
- **Every slot resolves unbound unless a repository binds it.** `repo-instructions` falls back
  to `AGENTS.md`, `model-override` to category defaults, `stage-delegation` to running stages
  inline, `surface` to file artifacts, `pr-lane` to no pull request. Three of the six are
  settable under `bindings["delivery.slots"]`; `model-override` deliberately is not, because
  model choice is personal, and `stage-delegation` and `surface` are read from the live
  session rather than declared anywhere. A repository that wants the old Claude answers writes
  three lines of config.
- **The slot set outlives its binders.** It stays declared in
  `surface-contract.md`, because what it buys is a shared asset that never grows
  an if-this-host clause, and a slot nobody binds still buys that.

## delivery-surface-canvas Ships the Canvas Only

```meta
date: 2026-09-05
related: [".devbook/arc42/09-architecture-decisions.md#three-surfaces-one-contract", ".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

`delivery-surface-canvas` is a Copilot canvas extension and nothing else. No MCP server, no Claude
manifest, no marketplace entry — its two viewer pages live in `extensions/delivery-surface-canvas/views/`
and the canvas actions `render_diagram` and `render_markdown` are the whole surface.

It shipped both transports for two days, on the argument that the layered design's combination
table lists *delivery + delivery-surface-canvas* as a supported outcome and a host without a canvas
panel could not reach it otherwise. That argument was answered from the wrong side:
`delivery-surface-dashboard` already implements the render group with the same two viewers, and it is
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
the operation names, not the transport. The cost is that `delivery-surface-canvas` has no automated
check any more — the only one drove the deleted server over stdio — and its pages are now
verified on the Copilot host or not at all, which is the open half of the `trial` status on
[the SDK](../tech/hosts.md#copilot-extension-sdk).

## A Role Plugin Holds No Flow Control

```meta
date: 2026-09-04
related: [".devbook/domain/plugin-authoring/naming.md#role", ".devbook/domain/plugin-authoring/naming.md#gate", ".devbook/arc42/05-building-block-view.md#roles-and-services", ".devbook/arc42/09-architecture-decisions.md#the-point-set-is-closed"]
```

A specialist filling a [role or a service](05-building-block-view.md#roles-and-services)
contributes expertise and artifacts. It
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

Consequence: **a specialist used bare is less guided than it was.** Run an architecture agent
outside any flow and nothing prompts for approval before it writes. That is the honest trade —
the guidance was never enforceable anyway, since an instruction file is a prompt and not a
mechanism, and pretending otherwise is what made two of them contradict the assets shipped
beside them. A repository that wants a checkpoint adds a gate, which the engine can see.

**Completed, 2026-09-05.** The change that recorded this cleaned three agents and left five,
none of them carrying a spawning or delegation tool or holding an approval question. Those
five [left the marketplace](#the-specialists-leave-the-marketplace) on 2026-09-07;
`tools/check-assets.mjs` still fails on any non-runner plugin's agent that carries one, which
now guards assets added later rather than any shipping today.

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
| `flow-*`, `phase-*`, `fleet-*`, `schedule-*` skills | A staged procedure is read once per run and every stage of it is safety-critical prose — gate wording, what a stage returns, what happens when a step fails — which the terseness rule exempts. |
| `to-spec-*` and `from-spec-*` converters | Each carries the full mapping between one chapter kind and code, and a mapping stated by half is wrong. |
| `devbook-*.instructions.md`, `surface-contract`, `flow-*.instructions.md` | A schema or a contract is the single source the conciseness rule tells everything else to point at; it cannot itself be a pointer. |
| The `flow-runner` agent | It is a session's main loop and carries its own invocation contract. |

For those kinds the reason is stated here, once, and not repeated at the top of a hundred
files. The record's own evidence supports the split: the plugin that owns the rule meets it at
a median of 28 lines, and the four that miss it by four to ten times are exactly the ones made
of staged procedures and contracts. Everything else over budget — at the time, a specialist's
how-to skills, the pull-request lane, the two profile skills — is owed a trim or a reason line
in the file, and `tools/check-assets.mjs --budgets` is the list.

Consequence: the number in `AGENTS.md` is a review prompt and not a gate the checker fails on.
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
date: 2026-09-07
related: [".devbook/domain/plugin-authoring/naming.md#layer", ".devbook/arc42/05-building-block-view.md#config-plugin", ".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key", ".devbook/arc42/09-architecture-decisions.md#no-host-profile-plugins"]
```

A skill that explains the stack has to name every part of it, and the [layer](../domain/plugin-authoring/naming.md#layer)
rule says a lower layer never names a higher one. Both cannot hold in the same plugin, which is
why `devbook-config` is a plugin of its own with an empty `dependencies` array rather than a
skill inside `devbook`.

**The name is the file, not a dependency.** It was `stack-guide`, and the rename followed the
config into `.devbook/`: a plugin whose subject is `.devbook/config.json` is named for it, the
way `devbook-graph` is named for the graph it draws rather than for the plugin whose generator
produces one. Reading `devbook-config` as an L1 extension over `devbook` would be the obvious
mistake and the `dependencies` array is the answer to it — empty, `devbook` included, and the
argument below is why it has to stay that way. The four skills lose their `stack-` prefix with
the rename: a prefix separates scopes inside a plugin, and here every skill has the same one.

The rule is about the dependency order, and naming is not depending. `delivery` already carries
over two hundred `plugin:asset` references into seven specialist plugins it never declared,
and a reference that resolves to nothing degrades one stage instead of failing a load. Those
seven have since [left the marketplace](#the-specialists-leave-the-marketplace) and the
references with them, but the shape the argument rests on is unchanged: the guide still names
every plugin in the catalog and declares none. The guide is the same shape taken further: it names every plugin in the
catalog, resolves
each against what is on disk, and reports a plugin it cannot find as `not installed` — which is
an answer, not a degradation. Nothing it names is loaded, so there is nothing to dangle.

Putting it *inside* `devbook` was the obvious first move and is the one the README already
argues against: the five per-folder flows left that plugin for `devbook-flows` precisely because
keeping them made the foundation name the layer above it. Adding a skill that names `delivery`,
`fleet`, and all three surfaces would have undone that in a larger way, and it would have made
the guide unreachable for anyone who installed the engine without the devbook convention.

The rename does not reopen that. Sharing a stem is not being inside: `devbook-config` is a
separate folder, a separate manifest, and a separate marketplace entry, and a repository can
enable it with `devbook` absent — which is exactly the case the empty `dependencies` array
keeps reachable.

**The write skills stop at the engine keys.** `devbook-config:setup` and `devbook-config:update` own `bindings`,
`extensions`, `policy`, and `gates`, and every `components.<name>` stamp stays with that
component's own install skill — the rule [one config file, two kinds of key](#one-config-file-two-kinds-of-key)
already states. Three things follow from it and all three are load-bearing: only the install skill
knows what it materialized, a plugin's payload and migration ledger live inside that plugin
where a foreign skill has no supported path to them, and `devbook` has to keep installing
itself to stay a foundation that works with only itself installed. So `devbook-config:update`'s fourth
step invokes `devbook-install`; it never applies a migration or writes a ledger of its own.

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

## The Specialists Leave the Marketplace

```meta
date: 2026-09-07
related: [".devbook/arc42/05-building-block-view.md#roles-and-services", ".devbook/domain/plugin-authoring/naming.md#role", ".devbook/domain/plugin-authoring/naming.md#extension-point", ".devbook/arc42/09-architecture-decisions.md#a-role-plugin-holds-no-flow-control", ".devbook/arc42/09-architecture-decisions.md#marketplace-named-jsdotnet"]
```

`arc42`, `csharp-coding`, `qa`, `domain`, `ux`, `documentation`, and `spec-builder` are removed
from this repository and published from a marketplace of their own. What stays is the
convention, the engine, the bridges, the surfaces, and the guide.

The split costs nothing structurally, which is the evidence that the boundary was already in
the right place. None of the seven declared a dependency and nothing declared one on them; no
module imported across the line; `tools/check-assets.mjs` and the `_meta` generator are driven
by the marketplace file and the chapters, not by a plugin list. Deleting 177 of 371 tracked
plugin files changed no mechanism.

**The by-name references go with them.** `delivery` and `devbook-flows` carried over two
hundred `plugin:asset` references into the seven, and [the guide's decision](#the-guide-names-every-plugin-and-depends-on-none)
leans on exactly that: naming is not depending, and an unresolvable reference degrades one
stage. So keeping them would have worked. They are de-named anyway, because *this* marketplace
naming a plugin published from another one is a coupling nothing here can check: no manifest
declares it, no test resolves it, and a rename on the other side would rot every reference
silently. Every stage now names the point it fills — `arc42:arc42` became the `architecture`
role, `csharp-coding:coding` the `implement` service, `qa:qa` the `app.start` or `qa.run`
provider by stage — and a repository's `.devbook/config.json` is the only place a
specialist's name appears. The `**Skills:**` halves that reached inside a specialist are gone
for the same reason: which skill a role uses is the role's business.

The engine's own rule is restated to match. It names points, roles, and capabilities; a
repository names the plugin that fills one. The worked examples in the surface contract, the
`delivery` README, and the config test use `your-*` placeholder ids that satisfy the schema
without naming anything, and the stack config template starts every role and service `null` —
deliberately unbound, which the vocabulary already distinguishes from absent.

Consequence: **`delivery` installed alone is now visibly capability-free at five roles and five
services**, where before the defaults in the template quietly pointed at siblings in the same
catalog. That is the honest state, and the same one a consuming repository was always in until
it wrote its bindings. The cost is that a first-time user gets no worked binding to copy: the
template shows the shape and the contract explains the id form, but which plugin to install is
now a question this repository does not answer.

Two smaller consequences. `tools/check-assets.mjs` still refuses flow-control tools on any
non-runner plugin's agent, and no such agent ships here any more — the rule guards future
assets rather than present ones. And the conciseness rule this repository holds its own
authoring to came out of `spec-builder` and stayed, as `AUTHORING.md` beside `CLAUDE.md`: it
governs authoring here, so a pointer into a marketplace this repository does not publish would
have been the one dangling reference the rest of this change exists to remove. The departing
plugin keeps its own copy, and the two are free to diverge — nothing here reads that one.

## Devbook Payload Named After Its Plugin

```meta
date: 2026-09-05
related: [".devbook/domain/plugin-authoring/naming.md", ".devbook/arc42/05-building-block-view.md#plugin-folder", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin", ".devbook/arc42/11-risks-and-technical-debt.md"]
```

Every `knowledge-` name inside `devbook` becomes `devbook-`: the two tool folders
(`tools/devbook-meta`, `tools/devbook-tech`), the two shipped workflows, the nine instruction
files, the `devbook-tech-update` skill, `assets/build/Update-DevbookIndex.ps1`, and the module
constants (`DEVBOOK_FOLDER_NAMES`, `DEVBOOK_PATH_PREFIX`) behind them. `knowledge` survived
this decision as the English word for what a chapter holds, and no longer does — see
[The Word Knowledge Is Retired](#the-word-knowledge-is-retired).

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

## The Unattended Lane Is Its Own Plugin

```meta
date: 2026-09-07
related: [".devbook/domain/plugin-authoring/naming.md#schedule", ".devbook/arc42/05-building-block-view.md#schedule-plugin", ".devbook/arc42/09-architecture-decisions.md#fan-out-is-its-own-plugin", ".devbook/arc42/09-architecture-decisions.md#no-host-profile-plugins", ".devbook/tech/hosts.md#scheduled-cloud-sessions"]
```

Everything that runs with nobody watching lands in one plugin, `delivery-schedule`: the nine
entry points that were `delivery`'s `automation-*` skills, and the triggers that fire them,
which were a `routines` plugin beside it. One prefix, `schedule-*`. It depends on `delivery`
and names `devbook`.

The first shape had the procedures inside the engine and the triggers outside it, because a
trigger names across layers and the engine may not. That kept the layer rule and split one
subject: nine skills no attended flow ever reaches sat in the engine, and the plugin that
fired them could not be installed with them in one act. Merging them upward keeps the layer
rule the other way round — the extension names the engine, never the reverse — and makes the
subject one folder, one dependency, one enable. It is the shape
[fan-out](#fan-out-is-its-own-plugin) already has, for the same reason: an L1 extension that
owns no flow, holds no gate, and adds no extension point.

**A schedule is a trigger and never a procedure.** That is the rule the plugin exists to keep:
a prompt names an entry point and its inputs, and one preamble names the unattended rules
once. A schedule never fires a `flow-*` skill, because a flow ends at Personal Validation and
no unattended run can pass a gate. The surface contract's unattended rule already says what
happens at a gate nobody can answer — park with a brief — and a scheduled run parks the same
way, as a draft pull request. Two entry points were written as skills rather than as prompts
for exactly this reason: a trigger that carries its own procedure is the duplication the rule
exists to prevent.

**`schedule-` is the name because neither host's is.** Claude Code calls the capability
*Routines*; the GitHub Copilot app calls it *Automations*. The old split used both words for
two different things, which made each half read as one host's product. Naming says a host's
word is recorded as an alias rather than adopted, so the term is *schedule* and both are
aliases — one catalog, either host, no branch.

**It names a host capability, and that is a divergence taken on purpose.**
[No host profile plugins](#no-host-profile-plugins) ended host-naming, and a cron-scheduled
cloud session is a host capability. The catalog stays host-neutral data — a cadence, a target,
a prompt — and only the scheduler resolution knows which tool answers, resolved from the live
tool list the way a surface is, with none a normal outcome that prints the prompts for a
person to paste. The one host fact the plugin writes down is the name of that tool and of the
settings file a cloud session needs to load the marketplace, in the catalog contract, because
a install skill that could not say either would schedule nothing.

**Nothing personal reaches the repository.** Scheduler ids, the environment, and the model are
account facts; matching on the schedule's name makes every operation idempotent without a
ledger, so the stamp records the selection and cadence overrides and nothing else. That is the
same line the devbook stamp draws about installed plugin versions, drawn for the same reason.

Consequence: **enabling `delivery-schedule` schedules nothing.** A repository selects through
`schedule-install`, which refuses a target whose plugin the repository's committed host settings
do not enable. And a first run is the only proof that the cloud session loaded the marketplace
at all — recorded as `trial` in [hosts](../tech/hosts.md#scheduled-cloud-sessions) until one
has.

Consequence: **`components.routines` is now `components.schedule`.** The plugin that wrote the
old key landed and merged the same day and never left `0.1.0`, so the rename ships without a
migration rather than with one nothing would run. A repository that did stamp the old key
renames it by hand and re-runs `schedule-install`, which rewrites the entry either way.

## One Rule, One Wrapper Per Host

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md#one-authored-copy-per-asset", ".devbook/arc42/09-architecture-decisions.md#no-generated-sync-layer", ".devbook/arc42/09-architecture-decisions.md#devbook-owns-one-section-of-agentsmd", ".devbook/domain/plugin-authoring/naming.md#plugin-rule"]
```

Both hosts inject rules scoped to a path glob, and no single file can serve both: Claude reads
`.claude/rules/*.md` with a `paths` list, Copilot reads `.github/instructions/*.instructions.md`
with `applyTo`. Different directory, different filename, different key. So this repository used
neither, and `CLAUDE.md` carried 154 lines that loaded on every session whatever was being
edited.

[One Authored Copy Per Asset](#one-authored-copy-per-asset) does not stretch here — it rests on
both hosts ignoring keys they do not know, and these two disagree on the *filename*. The
layering used for manifests and hooks applies instead: one authored rule, a thin wrapper per
host.

```
.agents/rules/<topic>.md            the rule. One copy. name / description / paths.
  ├── .claude/rules/<topic>.md      wrapper: paths verbatim → pointer
  └── .github/instructions/<topic>.instructions.md
                                    wrapper: applyTo = paths.join(",") → pointer
```

A wrapper is frontmatter and one sentence. It never restates a rule, so a third host adds a
third wrapper and never a second copy. Because `applyTo` is exactly `paths.join(",")`, the
wrappers are derivable from the shared file and `tools/check-assets.mjs` fails on drift — a
checker over hand-authored files, which is the bargain
[No Generated Sync Layer](#no-generated-sync-layer) already struck.

Three things follow, and each is deliberate:

- **`.agents/rules/` is a local convention, not a standard.** `AGENTS.md` is the standard for
  the *root* file and defines no globs; its answer to scoping is nested files, closest-wins.
  [agents.md#179](https://github.com/agentsmd/agents.md/issues/179) is the open proposal for
  glob-scoped rules, and its `name` / `description` / `paths` shape is what this uses.
- **A plugin cannot ship rules.** There is no rules component, no `rules` key in
  `plugin.json`, and a plugin-root `CLAUDE.md` is not loaded
  ([claude-code#21163](https://github.com/anthropics/claude-code/issues/21163)). Everything
  under `.agents/rules/` is repository-scoped: it serves people working *in* this repository,
  never someone who installed a plugin from it. A plugin instruction file keeps its filename
  and its glob, both part of the plugin contract, but is authored in the same host-neutral
  frontmatter as everything here. Reaching a *consumer* is the install skill's job, not the
  wrapper's, and
  [A Plugin's Rules Reach a Host Through the Install](#a-plugins-rules-reach-a-host-through-the-install)
  settles how.
- **A rule that already has one home both hosts read stays there.** The topic set is plugin
  authoring only.
- **The root file is `AGENTS.md`, and each host gets a root wrapper pointing at it.**
  `CLAUDE.md` is an `@AGENTS.md` import; `.github/copilot-instructions.md` is one sentence
  telling Copilot to read it. Only the Claude wrapper is load-bearing — Copilot resolves
  `AGENTS.md` natively and Claude does not — but the root files then follow the same
  wrapper-per-host shape as the rules above, and Copilot still lands on the rules on a
  surface that does not resolve the root file. That is the same choice
  [devbook Owns One Section of AGENTS.md](#devbook-owns-one-section-of-agentsmd) made for the
  file devbook writes into, and it makes the `repo-instructions` slot resolve here for the
  first time.

The topic set stops at plugin authoring. `.devbook/**` gets no topic, because
[devbook Owns One Section of AGENTS.md](#devbook-owns-one-section-of-agentsmd) already puts
the folder routing table and the `_meta/` rule in front of both hosts, and a second copy here
would be exactly what this layering exists to prevent. Where a rule already has one home that
both hosts read, it keeps it.

Consequence: six authored files and ten wrappers where there were none, against a `CLAUDE.md`
that shrank from 154 lines to four. The context cost is lower, not higher — only the running
host's wrapper loads, and only on a matching read. The cost is paid in file count and in a
checker rule.

That rule is `check-assets.mjs`'s `rules` pass, and it refuses six things: a shared file whose
`name` does not match its filename or that carries no `paths`, a missing wrapper on either
side, a Claude wrapper whose `paths` differ, a Copilot wrapper whose `applyTo` is not those
paths comma-joined or whose `description` differs, a wrapper body past three lines, and a
wrapper with no shared file behind it. The fifth is the one the layering actually rests on:
a wrapper that grows a rule is how the second copy gets in.

## devbook Owns One Section of AGENTS.md

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md#no-host-profile-plugins", ".devbook/arc42/09-architecture-decisions.md#no-generated-sync-layer", ".devbook/arc42/05-building-block-view.md#host-slots", ".devbook/domain/plugin-authoring/naming.md#stamp"]
```

Nothing in the stack maintained a repository's root instruction file. `flow-repo` wrote it
once, `devbook-install` offered `assets/routing-snippet.md` for a person to merge, and the
session-start hook told every session the folder rules in the same words whether the
repository had adopted one folder or five. So the one thing a repository's own instruction
file should say about its devbook — which folders it keeps, where the rules for each are,
and how the indexes are checked — was said nowhere on disk.

`devbook-install` now materializes that as one marker-fenced section of `AGENTS.md`, generated
from the stamp's `adopted` list, and `devbook-check` reports it stale when that list has
moved on. Three limits keep it inside the decisions already taken:

- **The file is `AGENTS.md` and nothing else.** It is the `repo-instructions` slot's unbound
  default and the one name both hosts read or import, so naming it is not host-naming and
  [No Host Profile Plugins](#no-host-profile-plugins) stands. Whether a host reads it, or
  imports it from a file of its own, is the repository's to arrange: devbook says which file
  it wrote and stops.
- **The section carries structure, never routing.** Which flow, agent, or MCP server a
  repository prefers stays in `routing-snippet.md`, offered and never applied. The section
  says what the folders are and how they are checked, which is true of every adopting
  repository in the same way.
- **A section is materialized like a file.** It is keyed `AGENTS.md#devbook` in the stamp's
  `materialized` map, hashed as devbook wrote it, and rewritten only while the text between
  the markers still matches that hash. An edit inside the markers makes it customized —
  reported, left alone — the rule every other asset already has. Text outside the markers
  is never read or written.

Consequence: the `materialized` map now holds a section as well as files, and the
[Stamp](../domain/plugin-authoring/naming.md#stamp) term says so. The contract version is
unchanged, because the chapter schema did not move, and a repository synced before
`devbook` 1.3.0 gains the section as a plain `create` on its next reconcile. The session-start
hook keeps its generic text: it is what reaches a session in a repository that never ran a
reconcile, and the section is what makes a reconciled one specific.

## Automation Owns the _meta Refresh

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md#devbook-owns-one-section-of-agentsmd"]
```

The derived-artifacts convention says a repository owes contributors two refresh paths: an
on-demand command, and a scheduled job reconciling the default branch. This repository ships
neither — no `.github/`, no `build/` — and `CLAUDE.md` had filled the gap by telling every
session to regenerate `_meta/` after a chapter edit, which is the one thing the convention
forbids by name.

**The refresh is automation's, and only automation's.** The `devbook-check` schedule already
does it: check, fix the Markdown, refresh the indexes, open a pull request when they moved. So
this repository keeps one refresh path rather than two, and the on-demand half is deliberately
absent. A session that could refresh is a session that will, in the same commit as its chapter
edit, and the merge conflict that follows is resolvable only by running the generator again.

Three things enforce it, because prose alone decays across a long session:

- `.claude/settings.json` denies `Read(_meta/**)`. A `Read` deny also blocks `Edit` and
  `Write`, and matches the directory name at any depth, so one rule covers the root rollup and
  all five scoped folders. `build.mjs` is a subprocess and reaches the files anyway.
- `AGENTS.md` states the rule for Copilot. Content exclusion is not an equivalent lever — it
  does not apply to Copilot CLI or to agent mode — so prose is the whole mechanism there.
- `CLAUDE.md` names the schedule as the owner, at the point where the check is run.

**The `AGENTS.md` section diverges from its template, in two lines.** `agents-section.md`
names `./build/Update-DevbookIndex.ps1` and `.github/tools/devbook-meta/build.mjs`: correct in
a repository that ran `devbook-install`, wrong in the one that authors the convention and vendors
the generator under `plugins/devbook/tools/`. The section here names this repository's real
path and the schedule instead of the script. It was written by hand, so no stamp claims it and
no reconcile will report it as customized; a later `devbook-install` run over this repository
would overwrite it with the template's paths, and that is the moment to make the template
resolve the generator location the way `generatorPath` now does.

## The Handback Is the Commit Point

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key", ".devbook/arc42/09-architecture-decisions.md#the-point-set-is-closed"]
```

The engine said nothing about when a flow commits, so whether a run produced one commit or
fifteen was whatever the bound `implement` provider happened to do. A reviewer reading the
resulting branch could not tell a handback from a mid-stage save.

`policy.commit.at` closes that: `gate` makes Personal Validation the single commit point —
one commit before every handback, a new commit for every revise round, and no stage before it
commits at all. `manual`, the default, is today's behaviour and leaves committing to the user.

The commit belongs to the gate phase rather than to `implement` because the handback is what
it marks. A commit per implementation pass records how the work was written; a commit per
handback records what the user was asked to approve, which is the unit anyone later reads the
branch for. Attaching it to the phase also keeps it out of the provider contract, so a
repository swapping coding plugins does not change how its history is shaped.

Consequence: with `gate` set, a rejected handback leaves a committed change set on the branch
that the next commit corrects rather than replaces — deliberately, since amending would
rewrite what the user already reviewed. A branch therefore carries one commit per validation
round, not one per flow.

## Every Run Opens With Update Base

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md#the-point-set-is-closed", ".devbook/domain/plugin-authoring/naming.md#flow-skill"]
```

Every flow opens with an **Update Base** phase that fetches the base branch and brings the
working branch onto it, and the `flow-runner` prepends that phase to the stage list rather than
any `flow-*/SKILL.md` naming it.

The problem it fixes is that a worktree is cut from the local checkout, never from the remote. A
branch created while the local default branch is three commits behind starts three commits
behind, and nothing downstream notices: the build is green, QA passes, and the pull request is
the first thing to say the branch is stale — after the whole run has been paid for.

Prepending it is the one place the engine names a phase a skill does not, and the asymmetry is
deliberate. The closing tier differs per skill — code-modifying flows run seven phases,
documentation/config flows four — so a skill has to say which it runs. The opening phase is
identical for every flow, a bridge plugin's included, so naming it per skill would be twenty
copies of one sentence and twenty places to drift, in the file whose stated purpose is that a
maintainer edits a phase once.

Rebase rather than merge, and only while the branch is still private. Until it is pushed for
review, rewriting its history is free and keeps it linear; once a reviewer is reading it the same
rewrite detaches their comments, which is why the phase skips a branch that already has an open
pull request and names `update-pr-branch` instead. A conflict blocks the phase rather than being
resolved inline, because that is separate work with its own scope.

Consequence: the phase can honestly do nothing. A dirty tree, an open pull request, or no remote
each mark it `skipped`, so a run can still start stale and only the stage output says so. It
never stashes to get past a dirty tree — the stash stack is shared by every worktree of the
repository, and another session can pop what this one pushed.

## An MCP Server Is Bound Per Point

```meta
date: 2026-09-07
related: [".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/09-architecture-decisions.md#the-specialists-leave-the-marketplace", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin", ".devbook/domain/plugin-authoring/naming.md#mcp-server", ".devbook/domain/plugin-authoring/naming.md#extension-point"]
```

`delivery` named two MCP servers by id — a guidelines server and a design server, both
published from `JSdotNet/Copilot` and neither shipped here — and four flows stopped the run for
MCP setup when the guidelines tools were absent. That was the coupling
[the specialists decision](#the-specialists-leave-the-marketplace) removed for agents, still
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

## Surfaces Carry the Surface Word

```meta
date: 2026-09-07
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/05-building-block-view.md#surface-plugins", ".devbook/arc42/09-architecture-decisions.md#three-surfaces-one-contract"]
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
[a surface is never a dependency](#three-surfaces-one-contract).

Consequence: run files written under the old state directories are not read from the new ones,
and nothing migrates them. Nothing needs to: no repository has bound a surface by its new name
yet, and the old folder is left where it is rather than moved. Plugin versions stay at `0.1.0`,
since a rename changes which entry a host installs, not what the entry does.

## Flows Belong to Delivery

```meta
date: 2026-09-07
related: [".devbook/domain/plugin-authoring/naming.md#flow-skill", ".devbook/domain/plugin-authoring/naming.md#layer", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin", ".devbook/arc42/09-architecture-decisions.md#devbook-still-ships-the-graph-canvas", ".devbook/ai/02-deliver.md#flow-skills"]
```

`devbook` enforces what a devbook folder holds — the instruction files, the metadata schema,
the check, the generator, the install. `delivery` holds every flow, including one per devbook
folder: `flow-arc42`, `flow-domain`, `flow-tech`, `flow-design`, `flow-ai`. The `devbook-flows`
bridge is removed, and `flow-adr`, `flow-tdr`, `flow-architecture`, and `flow-arc42-content`
are folded into `flow-arc42`.

Three faults, and the name was the smallest. The [naming chapter](../domain/plugin-authoring/naming.md#flow-skill)
says a plugin takes its subsystem's stem and the things inside are named for what they are;
the bridge held five `flow-*` skills, which are `delivery`'s kind, under `devbook`'s stem.
`.arc42` was written by five flows across two plugins, with the split drawn by which old
specialist skill each came from rather than by the folder — `devbook`'s arc42 rules already
treat a chapter, a decision record, and a debt record as one shape with three templates, and a
proposal not yet decided is a record in `proposed` status. And the bridge was not the bridge
[the coupling table](#one-folder-per-plugin) describes: both foundations named it, and the
Metadata Enforcement stage in each of its flows restated the rules `devbook`'s instruction
files already state, against the one-file rule this repository holds its own authoring to.

The reason no bridge is needed is that the rules reach a session through the host, not through
a flow. An instruction file declares the paths it governs; `devbook-install` materializes
the same files into the repository, as the pair
[A Plugin's Rules Reach a Host Through the Install](#a-plugins-rules-reach-a-host-through-the-install)
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
The L2b bridge row in the [layer table](../domain/plugin-authoring/naming.md#layer) keeps its
pattern and, for now, no example.

## The Word Knowledge Is Retired

```meta
date: 2026-09-07
related: [".devbook/domain/plugin-authoring/naming.md", ".devbook/arc42/09-architecture-decisions.md#devbook-payload-named-after-its-plugin", ".devbook/arc42/11-risks-and-technical-debt.md"]
```

*Knowledge* is not a term here any more, in prose or in identifiers. The folders are **devbook
folders**, what they hold is a **chapter**, what `_meta/graph.json` derives is the **reference
graph**, and a review note that has not settled is **unsettled content** rather than
"not established knowledge".

[Devbook Payload Named After Its Plugin](#devbook-payload-named-after-its-plugin) renamed every
`knowledge-` identifier and kept the English word. That half-measure was the problem: a reader
met "the knowledge folders" in the same paragraph as `devbook-meta` and had to work out that
the two named one thing. A convention that has a name does not also need a common noun standing
in for it, and the leftover word made the marketplace descriptions, the session-start hook, and
the instruction file headings read as if a second subsystem existed.

Two places keep the old spelling on purpose, and neither is the term:

- The pre-rename **payload paths** — `.github/tools/knowledge-meta/`,
  `.github/workflows/knowledge-meta*.yml`, `.github/instructions/knowledge-*.instructions.md`,
  `build/Update-KnowledgeIndex.ps1` — and the plugin name `knowledge-base` they came from.
  These name files that exist on disk in already-synced repositories, so the technical debt
  record in [chapter 11](11-risks-and-technical-debt.md), the `006-drop-backlog` migration that
  matches both workflow spellings, and the decision above all keep them. Erasing them would
  break the migration and lose the record of what has to move.
- The external design artifact **Knowledge Base Internals 2.0**, cited by title in `AGENTS.md`.
  A citation carries the target's name, so this one changes when the artifact is renamed and
  not before.

Consequence: a grep for the word finds only those two, and finding it anywhere else is a bug.

## devbook's Canvas Carries No Surface Word

```meta
date: 2026-09-07
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/09-architecture-decisions.md#surfaces-carry-the-surface-word", ".devbook/arc42/09-architecture-decisions.md#devbook-still-ships-the-graph-canvas"]
```

`devbook`'s extension folder is `devbook-graph`, not `devbook-surface-canvas`. It was
`devbook-canvas` until this date, and a grep for that string now finds only this record, the one
sentence it amends in [devbook Still Ships the Graph
Canvas](#devbook-still-ships-the-graph-canvas), and the plugin's upgrade note.

[Surfaces Carry the Surface Word](#surfaces-carry-the-surface-word) put the contract word in the
middle of the three delivery surfaces because they answer `delivery.surface.*@1` and are
substitutable for one another — nothing in `delivery-dashboard` said the dashboard and the
collector were interchangeable and the engine beside them was not. That reason does not reach
this extension. It answers no operation group, no run resolves it from the live tool list, and
it substitutes for nothing, so the word it would carry marks a membership it does not have.
What it does have in common with `delivery-surface-canvas` is only the host mechanism, and
naming the mechanism is what made the two look like one kind: `devbook-canvas` beside
`delivery-surface-canvas` reads as a second implementation of the render group, which it is not.

So the name states the subject instead. `devbook-graph` draws the reference graph the `meta`
blocks describe, and the second canvas the extension registers is `devbook-chapter` — one
chapter's Markdown beside its parsed block and a metadata lint. That id was also `devbook-canvas`,
so the string named both the whole extension and one of the two canvases inside it.

Consequence: the [surface term](../domain/plugin-authoring/naming.md#surface) still counts four
surfaces, and the stem rule now reads with the scope it always had — the contract word marks
interchangeability, so a surface interchangeable with nothing does not carry it. The lift this
folder is still waiting on takes the new name with it, and the blocker is unchanged: the three
relative imports into `tools/devbook-meta/`, per
[devbook Still Ships the Graph Canvas](#devbook-still-ships-the-graph-canvas).

## A Plugin's Rules Reach a Host Through the Install

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md#one-rule-one-wrapper-per-host", ".devbook/arc42/09-architecture-decisions.md#devbook-owns-one-section-of-agentsmd", ".devbook/domain/plugin-authoring/naming.md#plugin-rule"]
```

[One Rule, One Wrapper Per Host](#one-rule-one-wrapper-per-host) settled the repository half
and left the plugin half on an assumption that does not hold: that `applyTo` "steers Copilot".
It steers nothing from inside a plugin. Neither manifest has an `instructions` or `rules`
key — no plugin here declares one — and neither host has a rules component, so a scoped rule
shipped inside a plugin is auto-applied by *both* hosts equally: not at all. The seventeen
files reached a session only where a skill or an agent named one by path.

For the six that glob a path inside the plugin — `delivery`'s five over `skills/flow-*/SKILL.md`
and `fleet`'s one — that costs nothing. Only a maintainer of this repository edits those, and
`.agents/rules/skills.md` already wraps that glob for both hosts. `delivery-schedule`'s
contract globs `**/*.schedule.md`, and all six of those files live in the plugin too, so it is
the same kind and now has the same treatment in `.agents/rules/schedules.md`.

The other ten are different in kind. `devbook`'s nine and `devbook-collaboration`'s one glob
`.devbook/domain/**` and its siblings — paths in the *adopting* repository, the only place the
glob can resolve. A rule that can only fire there has to be delivered there, and devbook
already delivers: tools, workflows, and one section of `AGENTS.md`, hash-tracked in the stamp.
So the rules join the asset table.

Each ships as a trio, in the shape this repository already uses for its own rules:

```
plugins/devbook/rules/<name>.md          the rule. name + description, no scope of its own
plugins/devbook/rules/rules.json         its paths, and which adopted folder pulls it in
  └── .agents/rules/<name>.md            the rule, verbatim
        ├── .claude/rules/<name>.md      paths verbatim → pointer
        └── .github/instructions/<name>.instructions.md
                                         applyTo = paths.join(",") → pointer
```

Four choices inside that, each with a reason:

- **The file is named for what it becomes.** `instructions/<name>.instructions.md` was
  Copilot's filename for a file Copilot does not read here. `rules/<name>.md` matches its
  target, `.agents/rules/<name>.md`, character for character — so a rule that references a
  sibling by bare filename resolves in the plugin *and* in every repository the install writes to,
  with no rewrite at either end. That property is what makes the neutral copy cheap; under the
  old naming it would have cost a rewrite of every cross-reference between the ten, which is
  why a two-file shape with the body in `.github/instructions/` was reached for first and then
  abandoned.
- **The globs live in `rules/rules.json`, not the frontmatter.** A rule is content; its scope
  and its adoption condition are delivery metadata the install skill reads. Splitting them makes the
  rule a template with nothing host-shaped in it, and puts every rule's scope on one screen —
  which the nine devbook rules needed, and which a hand-written prose table in
  `rule-wrappers.md` had been standing in for. `install` joins `paths` in the same entry, so one
  file answers both "where does this apply" and "who gets it".
- **Verbatim, not trimmed to the adopted layout.** The globs carry both spellings, flat and
  nested. Trimming is what the two workflows get, and it makes them customized from the first
  reconcile onward — right for a workflow nobody ships twice, wrong for a rule that must keep
  taking upgrades. A glob matching nothing applies nothing, so carrying both costs nothing.
- **A wrapper per host, and neither host holding the body.** The alternative was to put the
  rule in one host's folder and point the other at it, which buys one fewer file and picks a
  favourite. Three files keep the invariant intact in both places: one copy of the rule, a
  wrapper per host, and never a rule written in a wrapper. Because `applyTo` is exactly
  `paths` comma-joined, the wrappers stay derivable and checkable — the bargain
  [No Generated Sync Layer](#no-generated-sync-layer) already struck.

**The frontmatter goes neutral with it.** All seventeen carried `applyTo`, which is Copilot's
key and nothing else's, on files no host reads it from — it announced a host that was not
reading and hid the one that could not. `check-assets.mjs` replaces its `instructions` pass
with a `plugin rules` pass refusing `applyTo` or `paths` in a rule, a `name` that is not the
filename, a missing `description`, a rule with no `rules.json` entry, an entry with no rule,
and an empty `paths`.

The cost is a rename across the marketplace: 309 references in 98 files, and
`.agents/rules/instructions.md` becomes `plugin-rules.md` because it no longer describes
instruction files. Nothing outside this repository had them yet — no release ever materialized
one — so the rename is paid once, here, and `devbook`'s `UPGRADING.md` says so for anyone who
hardcoded an old path.

Consequence: devbook goes to `1.4.0` and reconcile installs twenty-seven files into a fully
adopting repository. No migration: the contract version is untouched, and a new asset row is
materialized by the phase that already exists. `devbook-collaboration` grows one too —
`collaboration-install`, writing `components.collaboration` — because its rule is repo-facing
in exactly the same way and `devbook` may not carry it: a plugin never installs the layer above
it. That plugin's README no longer says it materializes nothing into a repository.

## An Install Is Not a Sync

```meta
date: 2026-09-07
related: [".devbook/domain/plugin-authoring/naming.md#stamp", ".devbook/arc42/09-architecture-decisions.md#a-plugins-rules-reach-a-host-through-the-install"]
```

`<component>-sync` is now `<component>-install`. *Sync* names a two-way reconcile between
peers, and nothing here is one: a plugin writes its payload into a repository, and the
repository never writes back. What the word actually described — idempotent, plan-then-write,
customized copies left alone — is true of an install as well, and the skills say it in their
own prose.

The rename lands with the folder rules and not before, because that is when the vocabulary
started to cost something. `devbook-install` was materializing tooling; now it installs rules,
and `rules/rules.json` carries a per-rule key saying which adopted folder pulls each one in.
`"sync": "arc42"` on that key read like a direction of travel. `"install": "arc42"` reads like
what it is.

What keeps the name is what genuinely reconciles two sides that both change:
`assets/code-sync-protocol.md`, where a chapter and the code it describes each move on their
own and the skills report a five-way drift verdict between them. Ordinary English keeps it too
— *keep in sync*, *sync-over-async*.

Consequence: two skills renamed, the Stamp term reworded, and `devbook sync` kept as a trigger
phrase in both so a session asking by the old name still lands. No stamp key changes, so no
migration: `components.devbook` and `components.schedule` were never named after the skill.
