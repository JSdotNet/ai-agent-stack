# Building Block View

```meta
status: active
number: 5
```

## Marketplace Root

```meta
status: active
related: [".devbook/domain/plugin-authoring/naming.md#marketplace"]
```

`.claude-plugin/marketplace.json` is the only file a host reads before installing anything: the
marketplace `name`, its owner, and one entry per plugin (`name`, `source`, `description`,
`version`). A plugin folder that is not listed here does not exist as far as a host is
concerned.

## Plugin Folder

```meta
status: active
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
| `extensions/<name>/` | Copilot CLI |
| `assets/`, `tools/`, `migrations/` | nobody, until a skill copies them into a repository |

The manifests agree on `name`, `version`, and `description`. The Claude manifest lists agent
files explicitly and omits `skills` and `hooks`, which that host discovers on its own, and it
is the only one that carries `dependencies` — an array of `{ name, version, marketplace }`
naming the [layer](../domain/plugin-authoring/naming.md#layer) beneath. Copilot's manifest has
no verified equivalent, so a dependency is declared once, on the Claude side, and stated in
prose in the plugin's README for the other host.

An `extensions/<name>/` folder ships a [surface](../domain/plugin-authoring/naming.md#surface):
a `copilot-extension.json` naming it, and the module that registers its canvases. No manifest
lists it and nothing in the plugin loads it — whichever tool opens it resolves it at runtime,
and a host without an extension mechanism never sees it. `devbook` ships one, `devbook-canvas`,
which renders the reference graph the generator writes to `_meta/graph.json`.

What coupling exists runs one way and only in source: `devbook-canvas` imports the generator's
graph, outline, and metadata modules from `tools/knowledge-meta/` by relative path, which is why
the live view and the committed index cannot disagree. Nothing in `devbook` imports the canvas.
Those three imports are also the reason lifting the folder into its own plugin is more than a
move — see [the decision](09-architecture-decisions.md#devbook-ships-the-folder-flows).

The last row is the part no host reads. A plugin that installs something into a repository
carries it as inert payload — templates, generators, migration scripts — and its own
`<component>-sync` is what puts it there and records it in the
[stamp](../domain/plugin-authoring/naming.md#stamp).

## Stack Config

```meta
status: active
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
status: active
related: [".devbook/domain/plugin-authoring/naming.md#agent"]
```

Agents, skills, instruction files, hooks, and MCP servers. Each kind has one file shape and one
place it may live; nothing is assembled at build time, because there is no build.
