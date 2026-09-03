---
applyTo: '**/*.md'
description: Where domain design artifacts are written, and which convention owns their structure.
---

# Domain Documentation Structure Instructions

## Purpose

Say where domain artifacts land. It does not restate their structure: when the repository has
a `.domain/` knowledge folder, that folder's own instruction file is the single owner of the
layout, the chapter set, and the metadata, and a second spec here would only drift from it.

## When The Repository Has `.domain/`

Write there, and follow `.domain`'s own rules for everything else:

```
.domain/
  context-map.md                 # strategic view: subdomains, context map, published languages
  <bounded-context-name>/        # kebab-case, matching the name used in code and ADRs
    domain.md                    # one chapter per aggregate, domain service, or domain event
    features.md                  # features and sub-features, in business language
    model.md                     # structural model, ideally a Mermaid class diagram
    flow.md                      # lifecycle and process flows; only when the context has them
    dependencies.md              # outbound and inbound, with explicit DDD relationship semantics
    naming.md                    # ubiquitous-language registry, one chapter per term
```

Three things follow from that convention and are the ones most often got wrong:

- One **folder** per bounded context, not one file. `model.md` is structural only — lifecycles
  and process flows belong in `flow.md`.
- Every file carries a fenced `meta` block under its `#` heading, and addressable chapters in
  `domain.md`, `features.md`, and `naming.md` carry one of their own. Not YAML frontmatter.
- `status` in this folder is `draft`, `proposed`, `active`, or `deprecated`. There is no `done`:
  a domain model is the current agreed model, not a task queue.

Read that folder's instruction file before writing, and never hand-edit anything under
`_meta/` — it is generated.

## When It Does Not

Ask for a path, defaulting to `docs/domain/`, and keep the same shape one level flatter: a
`context-map.md` overview plus one kebab-case file per bounded context, cross-linked, each
opening with `title`, `context`, and `last-updated` frontmatter.

## Either Way

- File names kebab-case. Aggregate names PascalCase as the ubiquitous language uses them.
  Domain events PascalCase and past tense — `OrderPlaced`.
- Glossary terms as domain experts actually say them, with synonyms recorded as aliases rather
  than as separate terms.
- Adding a context adds its folder or file and updates the context map. Modifying one touches
  only that context and the cross-references that name it.
- Record unresolved domain decisions explicitly rather than resolving them by invention.
