# 21. Four arc42 Chapters

```meta
date: 2026-09-05
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/01-introduction-and-goals.md", ".devbook/arc42/05-building-block-view.md", ".devbook/arc42/11-risks-and-technical-debt.md"]
```

`.devbook/arc42` holds chapters 1, 5, 9, and 11, the `tdr/` set, and no others, deliberately.
arc42 numbers twelve; the convention here says a chapter is written when it has content, not
to complete a set.

There is no runtime here, so the runtime view (6), deployment view (7), and quality scenarios
(10) would describe hosts this repository does not own. Constraints (2), context (3), and
solution strategy (4) are carried by the domain folder's context map and dependencies and by
the quality goals in chapter 1. Cross-cutting concepts (8) and the glossary (12) are both `domain.md`: this repository keeps
its terms under that file's `## Ubiquitous Language` grouping rather than in the optional
`naming.md`, per [the domain reshape](45-a-context-describes-its-skills-and-keeps-its-terms-in-domainmd.md).

Consequence: a reader used to arc42 finds gaps in the numbering. The building-block view, the
decisions, and the debt are where the substance is, and the numbering is kept so a later
chapter lands in its place rather than being renumbered in.
