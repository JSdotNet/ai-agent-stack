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
| `assets/`, `tools/`, `migrations/` | nobody, until a skill copies them into a repository |

The manifests agree on `name`, `version`, and `description`. The Claude manifest lists agent
files explicitly and omits `skills` and `hooks`, which that host discovers on its own.

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
