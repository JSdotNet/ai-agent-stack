# Building Block View

```meta
number: 5
```

## Marketplace Root

```meta
related: [".devbook/domain/plugin-authoring/naming.md#marketplace"]
```

`.claude-plugin/marketplace.json` is the only file a host reads before installing anything: the
marketplace `name`, its owner, and one entry per plugin (`name`, `source`, `description`,
`version`). A plugin folder that is not listed here does not exist as far as a host is
concerned.

## Plugin Folder

```meta
related: [".devbook/domain/plugin-authoring/naming.md#plugin", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin"]
```

One folder per plugin, holding two manifests and the assets themselves:

| Path | Read by |
| --- | --- |
| `.claude-plugin/plugin.json` | Claude Code |
| `.github/plugin/plugin.json` | Copilot |
| `agents/`, `agents-internal/` | both |
| `skills/`, `instructions/`, `resources/` | both |
| `hooks/hooks.json` | Claude Code |
| `hooks.json` | Copilot |
| `mcp/<server>/` | Whatever the Claude manifest's `mcpServers` points at |
| `extensions/<name>/` | Copilot CLI |
| `scripts/` | Whatever skill in the plugin invokes it, from the plugin root |
| `assets/`, `tools/`, `migrations/` | nobody, until a skill copies them into a repository |

Every plugin ships both manifests. The one exception was a host profile, which shipped only
its own host's so the other host could not install a plugin whose every statement was about
somewhere else; the profiles are gone, and the exception with them.

The manifests agree on `name`, `version`, and `description`. The Claude manifest lists agent
files explicitly and omits `skills` and `hooks`, which that host discovers on its own, and it
is the only one that carries `dependencies` — an array of `{ name, version, marketplace }`
naming each [layer](../domain/plugin-authoring/naming.md#layer) beneath, one entry for an
extension and two for a bridge. Copilot's manifest has no verified equivalent, so a dependency
is declared once, on the Claude side, and stated in prose in the plugin's README for the other
host.

An `mcp/<server>/` folder holds a server's own tree — its entry point, its modules, its pages,
and its `dev/` checks. The Claude manifest names the entry point under `mcpServers`; nothing
else in the plugin has to know the folder exists. `delivery-dashboard` and
`delivery-collector` each ship exactly one; `delivery-canvas` ships none — see
[the decision](09-architecture-decisions.md#delivery-canvas-ships-the-canvas-only).

An `extensions/<name>/` folder ships a [surface](../domain/plugin-authoring/naming.md#surface)
the other way: a `copilot-extension.json` naming it, and the module that registers its
canvases. No manifest lists it and nothing in the plugin loads it — whichever tool opens it
resolves it at runtime, and a host without an extension mechanism never sees it. `devbook`
ships one, `devbook-canvas`, which renders the reference graph the generator writes to
`_meta/graph.json`. `delivery-canvas` ships one too, and it is that plugin's only transport:
its two viewer pages sit in the extension's own `views/`, and the plugin carries no Claude
manifest and no marketplace entry.

What coupling exists runs one way and only in source: `devbook-canvas` imports the generator's
graph, outline, and metadata modules from `tools/devbook-meta/` by relative path, which is why
the live view and the committed index cannot disagree. Nothing in `devbook` imports the canvas.
Those three imports are also the reason lifting the folder into its own plugin is more than a
move — see [the decision](09-architecture-decisions.md#devbook-still-ships-the-graph-canvas).

A `scripts/` folder holds an executable a skill in the same plugin runs in place, rather
than payload copied anywhere: `arc42` and `domain` each ship an identical
`generate-diagram-svgs.ps1` that eight of their diagram skills invoke to render Mermaid beside
the Markdown they wrote. Identical, and duplicated — the two plugins install independently and
neither may name the other, so a shared copy would need a third plugin beneath both, which is
more structure than one script earns.

The last row is the part no host reads. A plugin that installs something into a repository
carries it as inert payload — templates, generators, migration scripts — and its own
`<component>-sync` is what puts it there and records it in the
[stamp](../domain/plugin-authoring/naming.md#stamp).

## Role Plugins

```meta
date: 2026-09-04
related: [".devbook/domain/plugin-authoring/naming.md#role", ".devbook/domain/plugin-authoring/naming.md#extension-point"]
```

Seven plugins are where a specialist lives. A flow consults one by name and never depends on
it: a role is bound per repository in `bindings["delivery.roles"]`, a service in
`extensions`, and a missing one costs capability rather than loading.

| Plugin | Fills | Ships |
| --- | --- | --- |
| `arc42` | role `architecture`, service `spec` | The `arc42` agent, arc42 and blueprint generators, ADR and TDR records, four diagram generators |
| `csharp-coding` | services `implement`, `verify` | The `coding` agent and fourteen skills: TDD, refactoring, review, NuGet, Aspire, OpenTelemetry, Azure |
| `qa` | role `qa`, services `app.start`, `qa.run` | The `qa` and `qa-monitor` agents, Aspire and Playwright MCP servers, evidence-carrying validation skills |
| `domain` | role `domain` | The `domain` agent, context mapping, model design, four diagram generators |
| `ux` | role `ux` | The `ux` agent, wireframes, user flows, design guidelines, UI review |
| `documentation` | role `docs` | The `documentation` and `profile` agents, nine artifact skills including SVG infographics |
| `spec-builder` | the asset-authoring lane | The `spec-builder` agent, five `create-*` skills, and the dual-host authoring contract |

None declares a dependency and none names a flow, which is why each installs alone and is
useful without the engine: the `arc42` agent writes an ADR whether or not `flow-adr` is what
asked for it. The coupling runs the other way and only by name — `delivery` and
`devbook-flows` carry over two hundred `plugin:asset` references into these seven, and a reference that
resolves to nothing degrades one stage rather than failing a load.

They also hold no flow control, which is what keeps that true in practice rather than only on
paper — see [the decision](09-architecture-decisions.md#a-role-plugin-holds-no-flow-control).

A plugin's name is not its role key. `arc42` fills the `architecture` role, and the two names
differ because they answer different questions: the role is the slot a flow asks for, the
plugin is what happens to be installed in it. `domain` and `ux` matching their keys is a
coincidence of good names, not a rule — binding a role key to the plugin currently filling it
would make the key un-rebindable, which is the one thing a binding must stay.

`product` and `security` are the two roles nothing here fills. Both are `null` in the stack
config template, which the vocabulary distinguishes from absent: deliberately unbound.

Implementation is not a role, so `csharp-coding` binds as two services instead. It is also the
only entry in the table whose language is in its name, which is the honest shape — the role is
filled per repository by whatever toolchain that repository is written in.

## Surface Plugins

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#surface", ".devbook/arc42/09-architecture-decisions.md#three-surfaces-one-contract"]
```

Three plugins are where a run becomes visible or recorded. None declares a dependency, none
names the engine, and each is resolved at run time from the live tool list — so which one
answers is decided by what is installed, and none answering is a normal outcome.

| Plugin | lifecycle | render | export | Ships |
| --- | --- | --- | --- | --- |
| `delivery-dashboard` | yes | yes | yes | An MCP server: run timeline, diagram and document viewers, hook-captured telemetry, Markdown and self-contained HTML reports |
| `delivery-canvas` | no | yes | no | The same two viewers, as two Copilot canvases and nothing else — no MCP server, so it answers on that host only |
| `delivery-collector` | yes | no | yes | An MCP server with no page and no port: the run on disk, and its Markdown report |

Each declares exactly the tool names its groups name and nothing more, which is what makes one
substitutable for another. `delivery-dashboard` is also the only one that captures anything by
itself: its hooks fold tool calls, sub-agent use, and token usage into the run, so the numbers
in its panels are measured rather than self-reported.

That capture is Claude-only, and structurally so rather than by omission. It ships
`hooks/hooks.json` and no root `hooks.json`, because the hook reads the session transcript and
writes the run store — work a Copilot `type: prompt` hook cannot do. So the substitutability the
table describes holds per capability group and not per host: a Copilot run bound to this plugin
gets the same lifecycle tools and the same panels, with the telemetry figures absent rather than
wrong. Nothing in the contract names telemetry, which is why this costs a column and not a
group.

## Host Slots

```meta
date: 2026-09-05
related: [".devbook/domain/plugin-authoring/naming.md#host-slot", ".devbook/arc42/09-architecture-decisions.md#no-host-profile-plugins"]
```

`delivery` declares a closed set of six names a shared asset reads instead of a host's own
file. **No plugin binds them.** The two that did — `claude-desktop` and `copilot-app` — are
[deleted](09-architecture-decisions.md#no-host-profile-plugins), and nowhere in the stack is a
host's own file, path, or capability named now.

| Slot | Where an answer can come from | Unbound |
| --- | --- | --- |
| `repo-instructions` | `bindings["delivery.slots"]` | `AGENTS.md` if present, else nothing |
| `repo-flow-context` | `bindings["delivery.slots"]` | discovery |
| `pr-lane` | `bindings["delivery.slots"]` | `deliver` writes file artifacts only |
| `stage-delegation` | the live session | stages run inline |
| `surface` | the live tool list | file artifacts only |
| `model-override` | nothing, deliberately | category defaults |

The first three are host facts a repository can state. `stage-delegation` and `surface` are
capability answers resolved at run time, which is what keeps two hosts from re-diverging the
moment one gains what the other has. `model-override` takes no binding from anywhere: model
choice is personal, so a repository may not set it, and with no profile left to name a path,
every category takes its default.

Unbound is now the resting state of the whole table, and the table is what keeps that visible
rather than silent.

## Fan-Out State

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#fleet-skill", ".devbook/arc42/09-architecture-decisions.md#fan-out-is-its-own-plugin"]
```

`fleet` is the only plugin here that keeps state **outside** every repository it acts on. A
sweep spans sessions that cannot see each other's conversations, so the files are the whole
coordination surface:

```text
~/.claude/issue-sweep/<sweepId>/
  sweep.json              # the manifest: what was picked up, skipped, and proposed for closure
  workers/<number>.json   # one result per worker, written on every outcome including failure
  brief.md                # the report, written by the sweep once its workers finish
```

The root is overridable with `CLAUDE_ISSUE_SWEEP_DIR` and is resolved once to an absolute path,
because a spawned worker does not inherit the dispatching session's working directory. It sits
outside any repository so it survives worktree removal and never shows up in `git status`.

Two other things carry sweep state, and neither is a file this repository owns: the
`ready-for-pickup` / `in-progress` / `needs-validation` labels on the tracker, which are what
make a claim legible from GitHub alone, and the host's list of live background sessions, which
is how a missing result file is told from a worker still running.
`instructions/fleet-issue-sweep-contract.instructions.md` owns both schemas.

## Guide Plugin

```meta
date: 2026-09-05
related: [".devbook/domain/plugin-authoring/naming.md#layer", ".devbook/domain/plugin-authoring/naming.md#flow-skill", ".devbook/arc42/09-architecture-decisions.md#the-guide-names-every-plugin-and-depends-on-none"]
```

`stack-guide` is the one plugin whose subject is the marketplace rather than a unit of work. It
answers *what is this, what have I got, and how is this repository wired* — and it is the only
place those three questions are answered together, because no other plugin is allowed to name
every plugin.

| Skill | Writes |
| --- | --- |
| `stack-guide` | Nothing. It reads, and every fact it states names the file behind it |
| `stack-init` | The four engine-owned keys of a repository's stack config, for the first time |
| `stack-update` | The same four keys, moved forward, after each component reconciled itself |

`scripts/stack-report.mjs` is the read-only half, run in place from the plugin root: it reads
the catalog in both the working tree and the host's clone, the host's installed-plugin state,
the three settings layers merged nearest-last, the stack config, the knowledge folders in both
layouts, and the engine's own `skills/` folder. A clone older than the source is why "already
latest" is usually wrong, so the report prints both and the commit behind each.

The two write skills stop at the [engine keys](#stack-config). Every `components.<name>` stamp
stays with that component's own sync skill, which is the only thing that knows what it
materialized — so `devbook-sync` and `devbook-check` do not move here, and `stack-init`'s fifth
step is to invoke them rather than to reimplement them.

The report is also the one place a host's own paths are still named, which
[the slot decision](09-architecture-decisions.md#no-host-profile-plugins) otherwise ended —
recorded as a [deliberate divergence](09-architecture-decisions.md#the-guide-names-every-plugin-and-depends-on-none)
rather than left silent. Where a plugin is installed and whether it is enabled is a fact about
a host and about nothing else, so a report that answers it either names those files or answers
nothing. It reads one host's, names every file it read and every one that was absent, and
leaves the other host's rows empty while the catalog half still answers.

## Stack Config

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#stamp", ".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key"]
```

`.github/ai-agent-stack.json` is the one file a consuming repository commits for the whole
stack, and it holds two kinds of top-level key:

| Key | Owned by | Holds |
| --- | --- | --- |
| `bindings`, `extensions`, `policy`, `gates` | `delivery` | Which provider fills each flow extension point, which plugin fills each role, which tracker the repository uses, the closed set of policy switches, and any human gates beyond the mandatory one. |
| `components.<name>` | that component's own sync skill | What the component materialized into the repository, and its migration ledger. |

Nobody writes another owner's key. `delivery` ships the schema for its four in
`resources/ai-agent-stack.schema.json` and a checker that rejects an unknown key rather than
ignoring it, so a typo is an error rather than a silently absent setting.

## Asset Kinds

```meta
related: [".devbook/domain/plugin-authoring/naming.md#agent"]
```

Agents, skills, instruction files, hooks, and MCP servers. Each kind has one file shape and one
place it may live; nothing is assembled at build time, because there is no build.
