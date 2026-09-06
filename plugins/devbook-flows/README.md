# devbook-flows

The bridge between the [`devbook`](../devbook) convention and the
[`delivery`](../delivery) engine: one `flow-*` procedure per knowledge folder, so a
chapter change runs as a staged flow with a Personal Validation gate and a rendered
artifact instead of as a hand edit.

## Installation

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `devbook-flows` with `/plugin`. It declares hard dependencies on both
`devbook` and `delivery`, so enabling it enables them; without either it is demoted and
its skills are absent. During development, add this working copy by path instead of by
repository.

## Why it is its own plugin

The five flows only make sense with a flow-runner and its shared phases, and every one of
them reports through a delivery surface. Keeping them inside `devbook` made the
foundation name the layer above it. Moving them out means `devbook` is usable on its own,
and the bridge is free to reference `delivery`'s instruction files — which it declares a
dependency on — instead of pointing at repository paths that do not exist once a plugin is
installed.

| Enabled | How devbook folders get edited |
|---------|--------------------------------|
| `devbook` | Directly, guided by its instruction files |
| `devbook` + `delivery` | Through `flow-fallback` |
| `devbook` + `delivery` + `devbook-flows` | Through the folder's own flow |

## The five flows

| Skill | Folder | Stages after Context Loading |
|-------|--------|------------------------------|
| `flow-domain` | `.domain/` | Domain Modeling, Metadata & Cross-Reference Enforcement, Consistency Review |
| `flow-tech` | `.tech/` | Technology Reasoning, Authoring & Metadata Enforcement, Graph Sync & Review |
| `flow-design` | `.design/` | Authoritative Grounding, Design Authoring, Metadata & Cross-Reference Enforcement, Consistency Review |
| `flow-arc42-content` | `.arc42/` | Content Drafting, Metadata Enforcement, Consistency Review |
| `flow-ai` | `.ai/` | Placement & Boundary Check, Authoring & Metadata Enforcement, Map Sync & Review |

All five are **documentation/config flows**: they close with Personal Validation → Create
Pull Request → Work Item Update → Summary, defined once in `delivery`'s
`flow-phases.instructions.md`. A bridge plugin's flow names its own tier, because the
engine never names a skill in a layer above it.

`.arc42` keeps its narrower split: a decision record, a technical debt record, a blueprint,
or a multi-chapter initiative belongs to `flow-adr`, `flow-tdr`, `flow-architecture`, or
`flow-arc42` in `delivery`, not here. `flow-arc42-content` covers
chapter content and diagrams.

`.backlog` has no flow: devbook no longer ships that folder, so the `flow-backlog` slot in
the original six is deliberately empty. Work items live in the tracker bound under
`bindings["delivery.tracker"]`.

## What stays in devbook

Structure and metadata rules (`devbook-*.instructions.md`), the `to-spec-<kind>` and
`from-spec-<kind>` converters, `devbook-sync`, `devbook-check`, `devbook-tech-update`,
and the generator. A converter's write routes through the matching flow here when this
plugin is enabled, and is written directly under the instruction files when it is not.

## Surface reporting

Every flow resolves the delivery surface by pattern from the live tool list and follows the
**Reporting Contract** in `delivery`'s `surface-contract.instructions.md`. No surface bound
is a normal outcome: the flow produces its file artifacts, says so once, and never blocks a
stage. No flow names a canvas, a host file, or a literal MCP tool prefix.
