# Architecture Decisions

```meta
status: active
number: 9
```

## Marketplace Named jsdotnet

```meta
status: active
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
status: active
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
status: active
date: 2026-09-02
related: [".devbook/tech/technology-graph.md#copilot-plugin-api"]
```

An asset is written once and read by both hosts, relying on both ignoring keys they do not
know. The cost is paid in the authored file: the tool list carries both hosts' tool ids, a
model pin must be a value both accept, and anything one host ignores — `handoffs`, `applyTo` —
is restated in prose or by path.

## No Generated Sync Layer

```meta
status: active
date: 2026-09-02
related: [".devbook/tech/technology-graph.md#powershell"]
```

A generator that derived the Claude-side files from the Copilot ones was written, verified, and
then dropped: it bought consistency for a plugin set that does not exist yet, and it made every
Claude manifest a file nobody was allowed to edit. Both manifests are hand-authored instead.

Consequence: what the generator used to lint — a missing description, an unloadable model pin,
a handoff the body never mentions — is now a review responsibility, written down in
[CLAUDE.md](../../CLAUDE.md). Revisit once the number of plugins makes that unreliable.
