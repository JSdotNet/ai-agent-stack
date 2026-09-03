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
| `assets/`, `tools/`, `migrations/` | nobody, until a skill copies them into a repository |

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

The last row is the part no host reads. A plugin that installs something into a repository
carries it as inert payload — templates, generators, migration scripts — and its own
`<component>-sync` is what puts it there and records it in the
[stamp](../domain/plugin-authoring/naming.md#stamp).

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
