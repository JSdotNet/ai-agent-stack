---
applyTo: ".arc42/**,.domain/**,.backlog/**,.tech/**,.design/**,.ai/**,**/_meta/**"
description: File and folder naming conventions inside knowledge folders, including dot-prefixed specification areas and underscore-prefixed tool-interpreted data.
---

# File and folder naming in knowledge folders

## Underscore prefix marks tool-interpreted data

Anything that exists **for tooling rather than for reading directly** carries a
leading underscore, so a human scanning a folder can tell specification from
data that must be interpreted by a tool at a glance. Folders with a leading
underscore are always for data that needs tool interpretation.

- **Tooling folders** are prefixed: `_meta/` (derived artifacts). Files
  *inside* such a folder are not prefixed again — the folder already carries
  the signal, so it is `_meta/graph.json`, never `_meta/_graph.json`.
- **Tooling files** sitting alongside content are prefixed individually:
  `_template.md`, `_schema.json`.

Use the prefix when the asset is a template, a schema, a generated artifact, or
input consumed only by a generator or viewer. Do not use it for documents meant
to be read as content, even if tooling also parses them — the `.domain`,
`.arc42`, `.backlog`, `.tech`, `.design`, and `.ai` Markdown files are read by both
humans and tooling and stay unprefixed.

## Dot prefix marks specification areas

Top-level knowledge areas keep the leading-dot convention and are **not**
renamed: `.arc42/`, `.domain/`, `.backlog/`, `.tech/`, `.design/`, `.ai/`. The dot marks
a repository-level specification area; the underscore marks tool-interpreted
data within one. Folders with a leading dot are for specifications.

## No redundant suffixes

A name should not repeat what its location already says.

- Derived artifacts are named after what they are, not their scope:
  `.tech/_meta/graph.json`, not `.tech/_meta/tech-graph.json`.
- Files within a bounded context are named after their role, not the context:
  `.domain/ordering/features.md`, not `.domain/ordering/ordering-features.md`.

## Casing

Use kebab-case for files and folders (`.domain/order-management/`,
`technology-graph.md`). Keep any casing that an external tool requires, such as
`README.md`.

## Reference

- `knowledge-derived-artifacts.instructions.md` — placement, naming,
  and envelope rules for generated artifacts under `_meta/`.
