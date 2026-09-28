# devbook-openspec

The change lane. [devbook](../devbook) is the source of truth and defines what a change looks
like on disk — `proposal.md`, deltas under `devbook-delta/`, `solution.md`, `tasks.md`, and the
merge in `delta.mjs`. [OpenSpec](https://github.com/Fission-AI/OpenSpec) runs the workflow
around it — `/opsx:explore`, `/opsx:propose`, `/opsx:apply`, and the rest. This plugin installs
and configures OpenSpec so its skills write devbook changes, and never copies one of them.

An L1 extension: it depends on `devbook` and nothing else. The engine appears only as provider
strings a repository binds in `.devbook/config.json`; without one, OpenSpec's `/opsx:apply`
builds each step itself.

## Installation

```bash
claude plugin marketplace add JSdotNet/devbook
npm install -g @fission-ai/openspec@latest
```

Then enable `devbook-openspec` with `/plugin` and run `devbook-openspec:init` in the repository,
after `devbook` has adopted the change folder. The plugin never installs the CLI.

## What it ships

| Part | What it is |
|---|---|
| `assets/schemas/devbook/` | The `devbook` schema and its four templates: `proposal` → `devbook-delta` → `solution` → `tasks`, with `apply` tracking `tasks.md`. `solution` is OpenSpec's `design` renamed, because `design` is a devbook folder here. Managed: `update` replaces it while it still hashes to what landed |
| `assets/config.yaml` | OpenSpec's project config: `schema: devbook`, the context every OpenSpec skill is given, per-artifact rules, and apply and archive guidance. Seeded once; the repository's after |
| `rules/devbook-openspec-change.md` | What an OpenSpec skill does inside `openspec/changes/`, installed as a trio so both hosts apply it |

## Skills

| Skill | What it does |
|---|---|
| `init` | Checks the CLI, runs `openspec init` at the repository root, writes the schema, the config, and the rule, removes the scaffolded `specs/`, and stamps `components.openspec`. Refused where that stamp exists |
| `update` | Checks the CLI against the stamped range, runs `openspec update`, replaces every managed file that still hashes to what landed, and re-stamps. Refused where no stamp exists |

## Where things live

OpenSpec resolves its root only as a folder named `openspec/`, with `changes/`, `schemas/`, and
`specs/` by those names. The root is the repository's, not `.devbook/`: from there every command
resolves anywhere in the tree, and OpenSpec's apply context can edit the code. The spike that
settled this, and what OpenSpec's model does not cover, are in this repository's own devbook —
the `devbook-openspec` building block and debt record 9.

```
openspec/
  config.yaml                 seeded by init, the repository's after
  schemas/devbook/            managed by this plugin
  changes/<name>/             one open change — devbook's shape
  changes/archive/            history, never read as context
.devbook/                     the chapters a change's deltas land in
```

## The stamp

`components.openspec` in `.devbook/config.json`: `pluginVersion`, `cli` (the range the CLI is
checked against), `tools` (the hosts `openspec init` set up), `prototype` (whether a Step 0
prototype is allowed), and `materialized`, per devbook's `assets/reconcile-protocol.md`.
Payload-only: no contract version and no migration ledger. Whether OpenSpec may send usage
statistics is one machine's answer and lives in the stack-config overlay as
`ext["devbook-openspec"].telemetry`, never in the stamp.

## License

MIT
