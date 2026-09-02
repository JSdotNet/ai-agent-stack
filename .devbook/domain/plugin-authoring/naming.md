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

The word *orchestration* covered the first two at once, which is why it named neither well. The
`orch-*` skills the `jsdotnet-copilot` marketplace still ships are the previous spelling of
`flow-*`; nothing here is authored under the old prefix.

## MCP Server

```meta
status: active
type: term
related: [".devbook/tech/technology-graph.md#model-context-protocol"]
```

A tool server a plugin ships and declares in its manifest. Its tools are namespaced by
whichever plugin provides it, so an allowlist that names the server must carry both the
plugin-namespaced and the bare spelling.
