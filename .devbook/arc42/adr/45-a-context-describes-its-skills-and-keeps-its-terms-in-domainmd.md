# 45. A Context Describes Its Skills, and Keeps Its Terms in domain.md

```meta
date: 2026-09-08
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/context-map.md", ".devbook/arc42/adr/44-one-plugin-one-bounded-context.md", ".devbook/domain/delivery/skills.md"]
```

Three changes to the `.domain` convention, taken together because they answer one question: what
does a bounded context look like when the product is procedures rather than a running application.

**`skills.md` joins `features.md`; it does not replace it.** A context takes one or the other. The
chapters stay `type: feature` and `type: sub-feature`, because a skill *is* a feature and a second
vocabulary for the same relationship would make every consumer of the graph branch on a filename
to learn nothing. Six contexts here ship skills and take `skills.md`; four ship none —
`plugin-authoring`, which is not a plugin, and the three surfaces, whose whole surface is an MCP
server's tools — and those keep `features.md` and say so in the file.

**`flow.<name>.md` splits one flow out of `flow.md`.** The sixteen `flow-*` skills each get a page
carrying that flow's stages, its tier, and what is distinctive about it; `flow.md` keeps the three
pictures that are about the context rather than about one procedure — the shared spine, the two
tiers, and the gate. The file carries `type: flow`, because the suffix narrows the scope and not
the kind. What each page deliberately does not carry is the roles-and-MCP table: that is a binding,
it already lives in the engine's own `FLOW-DIAGRAMS.md`, and a second copy across a folder
boundary is a copy that drifts.

**`naming.md` becomes optional and this repository stops using it.** Its `term` chapters move to a
`## Ubiquitous Language` grouping at the end of `domain.md`, which takes the new
`ubiquitous-language` chapter type the way `Shared Value Objects` already takes one. The merge is
what exposed the reason: twenty-eight of the seventy-three terms were near-verbatim restatements of
an aggregate, service, or event chapter in the same context. Those folded down to an `aliases`
field on the chapter they duplicated — `aliases` is a folder-level field, not a term-level one, so
this needed no schema change — and forty-five real terms survived as chapters.

That is the argument for the whole change: a registry that names the same things the model already
names is not a second view, it is a second copy, and it goes stale on the side nobody is reading.

Consequence: counterpart resolution can no longer assume a filename. `code-sync-protocol.md`, both
feature converters, and the design rule now say to search a context for a `term` chapter rather
than to open `naming.md`. Nothing is removed from any value set, so every repository already on
devbook still validates and no migration is needed — devbook 3.1.0, contract version unchanged.
