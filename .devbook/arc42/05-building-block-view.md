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

A plugin normally ships both manifests. A [host profile](#host-profile-plugins) is the one
exception and ships only its own host's, so the other host cannot install a plugin whose every
statement is about somewhere else.

The manifests agree on `name`, `version`, and `description`. The Claude manifest lists agent
files explicitly and omits `skills` and `hooks`, which that host discovers on its own, and it
is the only one that carries `dependencies` — an array of `{ name, version, marketplace }`
naming each [layer](../domain/plugin-authoring/naming.md#layer) beneath, one entry for an
extension and two for a bridge. Copilot's manifest has no verified equivalent, so a dependency
is declared once, on the Claude side, and stated in prose in the plugin's README for the other
host.

An `mcp/<server>/` folder holds a server's own tree — its entry point, its modules, its pages,
and its `dev/` checks. The Claude manifest names the entry point under `mcpServers`; nothing
else in the plugin has to know the folder exists. `delivery-dashboard`, `delivery-canvas`, and
`delivery-collector` each ship exactly one.

An `extensions/<name>/` folder ships a [surface](../domain/plugin-authoring/naming.md#surface)
the other way: a `copilot-extension.json` naming it, and the module that registers its
canvases. No manifest lists it and nothing in the plugin loads it — whichever tool opens it
resolves it at runtime, and a host without an extension mechanism never sees it. `devbook`
ships one, `devbook-canvas`, which renders the reference graph the generator writes to
`_meta/graph.json`. `delivery-canvas` ships one too, reading its pages out of its own
`mcp/delivery-canvas/views/` so the canvas and the MCP server cannot disagree about what a
diagram looks like.

What coupling exists runs one way and only in source: `devbook-canvas` imports the generator's
graph, outline, and metadata modules from `tools/knowledge-meta/` by relative path, which is why
the live view and the committed index cannot disagree. Nothing in `devbook` imports the canvas.
Those three imports are also the reason lifting the folder into its own plugin is more than a
move — see [the decision](09-architecture-decisions.md#devbook-still-ships-the-graph-canvas).

A `scripts/` folder holds an executable a skill in the same plugin runs in place, rather
than payload copied anywhere: `architecture` and `domain-design` each ship an identical
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
| `architecture` | role `architecture`, service `spec` | The `architect` agent, arc42 and blueprint generators, ADR and TDR records, four diagram generators |
| `csharp-coding` | services `implement`, `verify` | The `coding` agent and fifteen skills: TDD, refactoring, review, NuGet, Aspire, OpenTelemetry, Azure |
| `qa` | role `qa`, services `app.start`, `qa.run` | The `qa` and `qa-monitor` agents, Aspire and Playwright MCP servers, evidence-carrying validation skills |
| `domain-design` | role `domain` | The `domain-architect` agent, context mapping, model design, three diagram generators |
| `ux-design` | role `ux` | The `ux-designer` agent, wireframes, user flows, design guidelines, UI review |
| `documentation` | role `docs` | The `documentation` and `profile` agents, nine artifact skills including SVG infographics |
| `spec-builder` | the asset-authoring lane | The `spec-builder` agent, five `create-*` skills, and the dual-host authoring contract |

None declares a dependency and none names a flow, which is why each installs alone and is
useful without the engine: the `architect` agent writes an ADR whether or not `flow-adr` is
what asked for it. The coupling runs the other way and only by name — `delivery` and
`devbook-flows` carry 251 `plugin:asset` references into these seven, and a reference that
resolves to nothing degrades one stage rather than failing a load.

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
| `delivery-canvas` | no | yes | no | The same two viewers, as an MCP server and as Copilot canvases from one copy of each page |
| `delivery-collector` | yes | no | yes | An MCP server with no page and no port: the run on disk, and its Markdown report |

Each declares exactly the tool names its groups name and nothing more, which is what makes one
substitutable for another. `delivery-dashboard` is also the only one that captures anything by
itself: its hooks fold tool calls, sub-agent use, and token usage into the run, so the numbers
in its panels are measured rather than self-reported.

## Host Profile Plugins

```meta
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#host-profile", ".devbook/domain/plugin-authoring/naming.md#host-slot", ".devbook/arc42/09-architecture-decisions.md#a-host-profile-depends-on-nothing"]
```

Two plugins are where a host's own files and capabilities are named, and nowhere else in the
stack is. Each binds the engine's closed slot set for one host and ships the procedures that
cap a *session* rather than a run.

| Slot | `claude-desktop` | `copilot-app` |
| --- | --- | --- |
| `repo-instructions` | `CLAUDE.md`, else `AGENTS.md` | `.github/copilot-instructions.md`, else `AGENTS.md` |
| `repo-flow-context` | `.claude/flow-context.md` | unbound — discovery |
| `model-override` | `CLAUDE_FLOW_MODEL_SELECTION_PATH`, else the per-OS default | unbound — category defaults |
| `stage-delegation` | sub-agents | custom agents |
| `surface` | `delivery-dashboard` | `delivery-canvas` — render only |
| `pr-lane` | the `gh` CLI when present | the `gh` CLI when present |
| Host-owned skills | `start`, `session-handoff` | `update-open-sessions` |

The bindings ship as the text a `SessionStart` hook injects, which is the one channel that
reaches every session on both hosts. That makes the hook sidecar the authored copy and every
table restating it — including this one — a reader's summary.

Two rows are capability answers rather than host facts: `stage-delegation` asks whether
sub-agents exist and `pr-lane` whether the CLI is on `PATH`, so neither re-diverges the moment
one host gains what the other has. Two are deliberately unbound on Copilot, which is a
documented engine default and not a gap. And `delivery-canvas` answers the render group only,
so a Copilot run gets viewers and no live timeline until a lifecycle surface joins it.

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
