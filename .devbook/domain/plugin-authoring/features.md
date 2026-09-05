# Plugin Authoring

```meta
type: features
```

> What this context lets a maintainer do, in the language of [naming.md](naming.md) rather
> than in file paths. Four features, and each is a thing a host or a consuming repository
> can observe.

## Author an Asset

```meta
type: feature
related: [".devbook/domain/plugin-authoring/naming.md#agent", ".devbook/domain/plugin-authoring/naming.md#skill", ".devbook/domain/plugin-authoring/naming.md#instruction-file", ".devbook/domain/plugin-authoring/naming.md#hook"]
```

Write one file that both hosts load: an agent, a skill, an instruction file, or a hook. The
value is a single copy per asset — nothing to keep two variants of, nothing that drifts.

### Author for Both Hosts

```meta
type: sub-feature
related: [".devbook/arc42/09-architecture-decisions.md#one-authored-copy-per-asset"]
```

Carry both hosts' tool ids in one allowlist, pin only a model both accept, and restate in
prose what one host ignores: handoff targets, and the paths of the instruction files a host
does not apply by itself.

### Stay Within Budget

```meta
type: sub-feature
related: [".devbook/arc42/09-architecture-decisions.md#budgets-are-disclosure-triggers-not-gates", ".devbook/arc42/tdr/1-body-budgets-unenforced.md"]
```

Keep an asset short enough that a model attends to all of it, and say why in the file when it
must be longer. The budget triggers a disclosure decision; it is not a gate.

## Package a Plugin

```meta
type: feature
related: [".devbook/domain/plugin-authoring/naming.md#plugin", ".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

Group assets that belong together into one folder a host can install on its own.

### Declare the Manifests

```meta
type: sub-feature
```

Ship the Claude manifest and the Copilot manifest, agreeing on name, version, and
description. A host profile is the one plugin that ships only its own host's.

### Declare a Dependency

```meta
type: sub-feature
related: [".devbook/domain/plugin-authoring/naming.md#layer", ".devbook/arc42/09-architecture-decisions.md#one-folder-per-plugin"]
```

Name the lower layer a plugin cannot work without, with a version range, so the host makes an
illegal combination unreachable. A role, a tracker, or a surface is never declared; it is
bound per repository or resolved from the live tool list.

## Offer a Plugin

```meta
type: feature
related: [".devbook/domain/plugin-authoring/naming.md#marketplace", ".devbook/arc42/05-building-block-view.md#marketplace-root"]
```

List a plugin once in the marketplace so a host can offer it. A folder that is not listed does
not exist as far as a host is concerned, which is what keeps a Copilot-only profile out of
Claude's catalogue.

## Materialize a Component

```meta
type: feature
related: [".devbook/domain/plugin-authoring/naming.md#stamp", ".devbook/domain/plugin-authoring/naming.md#migration"]
```

Copy a plugin's inert payload into a consuming repository, record what landed in that
repository's stamp, and carry it forward with runnable migrations rather than prose notes.

### Stamp the Repository

```meta
type: sub-feature
```

Write the component's own key in the stack config — plugin and contract version, adopted
features, every copied file with its hash, the migration ledger — and never another
component's.

### Migrate a Contract

```meta
type: sub-feature
```

Ship each breaking change as an immutable, idempotent migration whose `--check` says whether
work remains. The ledger decides whether it runs, never a version comparison.
