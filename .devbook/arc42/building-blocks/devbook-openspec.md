# devbook-openspec

```meta
status: draft
related: [".devbook/arc42/building-blocks/README.md", ".devbook/arc42/building-blocks/devbook.md#dependencies", ".devbook/arc42/tdr/9-openspecs-model-does-not-cover-a-devbook-change.md", ".devbook/arc42/adr/plugin-boundaries.md", ".devbook/arc42/08-crosscutting-concepts.md#layer"]
```

The change lane: the plugin that installs and configures the OpenSpec CLI so a change to a
repository is proposed, agreed, applied, and archived as a set of deltas against its devbook
chapters. No plugin folder exists yet; this block records what the lane is designed to be and
what the OpenSpec spike of 2026-09-27 established about the CLI it configures.

Inside the block: the `devbook` schema and its templates, the seeded `config.yaml`, the
providers the engine can bind (`spec`, `tracker`, `status`, `archive`), and the merge of a
change's deltas into the chapters they target on archive.

Outside it: the chapters themselves and the shape of a delta, which are
[devbook](devbook.md)'s to define; the flows that carry each step, which are delivery's; and
OpenSpec's own twelve skills and its CLI, which are installed and configured here, never
copied.

## Interfaces

```meta
status: draft
```

Planned, per the design checkpoint's *devbook-openspec* section; none is built.

| Interface | Kind | Reached by |
| --- | --- | --- |
| `init` | skill | A person, or `devbook-config:init` during a fan-out |
| `update` | skill | A person, or `devbook-config:update` during a fan-out |
| `onboard` | skill | A person making a first change |
| `spec` | skill, provider | The engine's `spec` point |
| `tracker` | skill, provider | `delivery.tracker`, as `plugin:skill` |
| `status` | skill, provider | A person, and the archive gate |
| `archive` | skill, provider | A person, after the change is accepted |

## Structure

```meta
status: draft
```

### Schema

```meta
status: draft
```

A project schema named `devbook` whose artifacts run `proposal` → `devbook-delta` → `solution`
→ `tasks`, with `apply` tracking `tasks.md`. Managed: the bridge writes it and replaces it
while it still hashes to a release. The spike validated it with `openspec schema validate
devbook` once two corrections to the checkpoint's draft were made — every artifact needs a
`description`, and an `instruction` containing `` `owner: me` `` must be a block scalar, since
a plain YAML scalar cannot hold `: `.

### Config

```meta
status: draft
```

`config.yaml` with `schema: devbook`, the context, and per-artifact rules. Seeded once by
`init` and the repository's after that, because OpenSpec reads only one such file.

## Constraints

```meta
status: draft
related: [".devbook/arc42/tdr/9-openspecs-model-does-not-cover-a-devbook-change.md"]
```

Established against OpenSpec CLI **1.13.2** (`npm install -g @fission-ai/openspec@latest`) on
a throwaway branch since deleted, with the schema and config above and one change run through
`new change`, `status`, `validate`, and `archive`. The CLI's own source agrees with every
answer: `core/root-selection.js` builds each root as `<root>/openspec/changes`,
`<root>/openspec/specs`, and `<root>/openspec/changes/archive`, and the schema resolver as
`<root>/openspec/schemas`.

### The root is a folder named openspec

```meta
status: draft
```

**Question:** can the root be `.devbook/`, with `openspec init` run there? **No.** A root is
a directory that *contains* a folder literally named `openspec/`; it cannot be `.devbook/`
itself, and a dotted `.openspec/` is not recognised.

- `openspec init .devbook --tools none` wrote `.devbook/openspec/` with `changes/archive/`,
  `specs/`, and `config.yaml`.
- With that folder renamed to `.devbook/.openspec/`, `openspec list` answered
  `Error: No OpenSpec root found from the current directory.`, and `openspec new change
  probe` silently created a fresh `openspec/` beside it: `Note: no OpenSpec root was found
  here, so one was created at openspec/.`
- The root is found by walking up from the working directory. From anywhere under `.devbook/`
  it resolved; from the repository root the same `openspec list` found nothing.
- With the root at `.devbook/`, `openspec status --json` reports `allowedEditRoots` as
  `.devbook/` alone — the action context OpenSpec hands an apply agent scopes implementation
  edits to the devbook folder, not to the code.

**Fallback:** `.devbook/.openspec/` is not available. `openspec/` at the repository root
applies: it is the one placement every command resolves from anywhere in the tree and whose
edit root is the repository. `.devbook/openspec/` works for planning, but only from under
`.devbook/` and with apply scoped away from the code.

### Folder names are fixed

```meta
status: draft
```

**Question:** can the change and schema folders be `.changes/` and `.schemas/`, and can
`specs/` be absent? **No, no, and only on disk.** `changes/`, `schemas/`, and `specs/` are
fixed names under `openspec/`.

- With `openspec/changes/` renamed to `.changes/`, `openspec list` said `No active changes
  found.`, and `openspec new change probe` created `openspec/changes/probe/` beside the
  dotted folder.
- With the schema under `openspec/.schemas/devbook/`, `openspec schema which devbook` said
  `Error: Schema 'devbook' not found`; under `openspec/schemas/devbook/` it said `Source:
  project`.
- With `specs/` deleted, `openspec list --specs` said `No specs found.`, `openspec validate
  --all` said `No items found to validate.`, and `openspec doctor` said `OpenSpec root: ok` —
  but `init` scaffolds `specs/` and the next `openspec archive` recreated it, empty. Git does
  not track an empty folder, so it never reaches a commit.

**Fallback:** OpenSpec's plain names inside its own folder. `specs/` stays absent from the
tree without any removal step.

### An empty glob artifact is incomplete

```meta
status: draft
```

**Question:** is `devbook-delta/**/*.md`, matching no file, complete in `openspec status`?
**No.** With `proposal.md`, `solution.md`, and `tasks.md` written and no delta,
`openspec status --change spike-probe` showed `Progress: 3/4 artifacts complete` and
`[ ] devbook-delta`; the JSON gave the artifact `"status": "ready"`, `"existingOutputPaths":
[]`, and the change `"isComplete": false`. One delta file made it `4/4`.

`openspec new change` wrote `skip_specs: true` into the change's `.openspec.yaml` on its own,
because the schema has no `specs` artifact; that is what lets `openspec validate` pass a
devbook change at all (`skip_specs is set in .openspec.yaml ... zero deltas accepted`).

**Fallback:** a one-line placeholder delta for a change with no prose delta.

### Archive moves, and merges nothing

```meta
status: draft
```

**Question:** does `openspec archive` move a change whose deltas it does not recognise, or
refuse? **It moves it.** `openspec archive spike-probe --yes` answered `Change 'spike-probe'
archived as '2026-09-27-spike-probe'.` and exited 0. `devbook-delta/` was carried along
untouched and no chapter changed. Two warnings, neither blocking: the proposal lacks
`## What Changes` — a check written for the `spec-driven` proposal, applied whatever the
schema — and one task was open, `Continuing due to --yes flag.`

With `skip_specs: false` on a second change, `openspec validate` refused (`Change must have at
least one delta. No deltas found.`, exit 1), and `openspec archive --yes` moved it anyway.

**Fallback:** none is needed for the move — the CLI does it. The merge is the bridge's
`archive`, as the design already had it: it writes each delta into its chapter first, then
calls `openspec archive` to move the folder.

## Dependencies

```meta
status: draft
related: [".devbook/arc42/building-blocks/devbook.md#dependencies", ".devbook/arc42/08-crosscutting-concepts.md#layer"]
```

An L1 extension over devbook, planned to declare that one dependency and to name delivery
only as a provider string.

### Outbound

```meta
status: draft
```

| Depends on | Pattern | Mechanism | Contract | Why |
| --- | --- | --- | --- | --- |
| [devbook](devbook.md#dependencies) | Customer-Supplier | The delta and proposal shapes, and the chapters a delta merges into | devbook's chapter schema | A delta is a devbook chapter by another path. |
| OpenSpec CLI | Conformist | `openspec init`, `new change`, `status`, `validate`, `archive` | The CLI, its `schema.yaml` format, and its fixed `openspec/` layout | The workflow is OpenSpec's; the bridge only configures it. |
| delivery | Separate Ways | A provider string in `.devbook/config.json`, skipped when absent | The engine's `spec` and `tracker` bindings | A step runs through a flow when one is installed and inline when not. |
