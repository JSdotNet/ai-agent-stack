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

## Asset Kinds

```meta
status: active
related: [".devbook/domain/plugin-authoring/naming.md#agent"]
```

Agents, skills, instruction files, hooks, and MCP servers. Each kind has one file shape and one
place it may live; nothing is assembled at build time, because there is no build.
