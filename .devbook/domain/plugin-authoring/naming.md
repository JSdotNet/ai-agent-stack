# Naming

```meta
status: active
```

The terms this repository trades in. Where a host uses a different word for the same thing, the
host's word is recorded as an alias rather than adopted.

## Marketplace

```meta
status: active
type: term
related: [".devbook/arc42/09-architecture-decisions.md#marketplace-named-jsdotnet"]
```

A repository that offers plugins for installation, identified by the `name` in
`.claude-plugin/marketplace.json`. That name is the local primary key: a host keys its
registry, its cache, and every `plugin@marketplace` reference by it, so two marketplaces one
user has added may not share a name. This repository's marketplace is `jsdotnet`.

## Plugin

```meta
status: active
type: term
related: [".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

One folder under `plugins/`, holding assets that belong together, installable on its own and
listed once in the marketplace. It may declare a hard dependency on a plugin in a lower layer,
which the host enforces and which makes an illegal combination unreachable; it must never
depend on a role, a tracker, or a surface — those are bound per repository or resolved from the
live tool list, and a missing one must cost capability, not loading.

## Host

```meta
status: active
type: term
aliases: [client]
```

A tool that loads a plugin's assets: Claude Code or GitHub Copilot. Hosts read the same files
and ignore the keys they do not recognise, which is why an asset has one authored copy.

## Agent

```meta
status: active
type: term
```

A named persona with its own tool allowlist, as `agents/<role>.agent.md`. Copilot calls it a
custom agent, Claude a subagent. Delegation targets live in the body prose, because only one of
the two hosts reads a `handoffs` key.

## Skill

```meta
status: active
type: term
```

A procedure a host loads on demand, as `skills/<name>/SKILL.md`. Its `description` is the
trigger — the sentence a host matches a request against — not a summary of its contents.

## Instruction File

```meta
status: active
type: term
```

A scoped rule set, as `instructions/*.instructions.md`. One host applies it automatically from
`applyTo`; the other only when something references its path, so every instruction file is
referenced explicitly by the asset that depends on it.

## Hook

```meta
status: active
type: term
```

A host-executed action bound to a session event. The two hosts disagree on what a session-start
hook may be, so the event, not the intent, decides the form it takes.

## Flow Skill

```meta
status: active
type: term
date: 2026-09-02
related: [".devbook/ai/adoption-map.md#flow-skills"]
```

A staged procedure for one category of work, run start to finish inside one session, ending at
the personal validation gate. `flow-<category>`, one per category.

Three neighbours share the vocabulary and are not interchangeable with it:

| Prefix | Scope |
| --- | --- |
| `flow-` | One session, delegating to subagents. Never to another session. |
| `fleet-` | Fan-out across sessions and worktrees. This one is orchestration. |
| `phase-` | A shared step inside a flow — build and test, QA validation. Never invoked directly. |
| `automation-` | A schedulable entry point that picks its own input, then runs a flow. |

The word *orchestration* covered the first two at once, which is why it named neither well.
`orch-*` is the previous spelling of `flow-*`. Nothing is *authored* under the old prefix here,
but the first plugin to land carries five of them: `devbook` was ported whole, and its
folder-writing skills are renamed in the release that moves them out — see
[the decision](../../arc42/09-architecture-decisions.md#devbook-ships-the-folder-flows).

## Stamp

```meta
status: active
type: term
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#migration"]
```

The file a repository commits to record what a plugin has materialized into it:
`.github/ai-agent-stack.json`. One entry per component, holding the plugin version and contract
version it is on, which features it adopted, every file copied in with the hash it had when it
landed, and the migration ledger.

It records what the *repository* has taken on, never who installed what — that is per-user and
would make the file wrong the moment a second person opened it. A plugin that materializes
anything ships one `<component>-sync` that writes its own entry and one `<component>-check`
that reads it, and neither touches another component's.

## Migration

```meta
status: active
type: term
date: 2026-09-03
related: [".devbook/domain/plugin-authoring/naming.md#stamp"]
```

One breaking change to a plugin's contract, shipped as a folder — `migrations/<contractVersion>-<slug>/` —
holding a `MIGRATION.md` and an idempotent `migrate.mjs` whose `--check` exits non-zero while
work remains. The id is immutable once released: a shipped migration is never rewritten, only
followed by a new one.

Presence in a repository's ledger decides whether a migration runs, never a comparison of
version numbers, which is what makes re-running one safe. A prose migration note is not a
migration — it does not run, so it becomes an unbounded manual chore in every consuming
repository.

## MCP Server

```meta
status: active
type: term
related: [".devbook/tech/technology-graph.md#model-context-protocol"]
```

A tool server a plugin ships and declares in its manifest. Its tools are namespaced by
whichever plugin provides it, so an allowlist that names the server must carry both the
plugin-namespaced and the bare spelling.
