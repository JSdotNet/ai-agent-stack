# 15. Three Surfaces, One Contract

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#surface", ".devbook/arc42/adr/14-delivery-ships-no-surface.md", ".devbook/arc42/05-building-block-view.md#surface-plugins"]
```

Three plugins implement `delivery.surface.*@1`, none depending on `delivery` or on each other:
`delivery-surface-dashboard` answers all three capability groups, `delivery-surface-canvas` answers render
only, `delivery-surface-collector` answers lifecycle and export only.

Two of the three would have been enough to ship a viewer. Three is what makes the contract a
contract: the moment a second implementation exists, the split by operation group stops being
a table in an instruction file and starts being the thing that decides what a run gets. A
caller resolves each group separately, so a repository with only the collector installed
records a run and renders nothing — and finds that out by the render names being absent, not
by a stub answering and doing nothing.

The collector is written here rather than ported, and its two absences are the point. It
captures no telemetry, so it reports no token or cost figures at all rather than a column of
zeroes that reads as a measurement; and `export_report` writes Markdown only, because a
self-contained HTML report with evidence inlined is a rendering job. Asking it for another
format still writes Markdown and says so in the result rather than failing a run over a file
extension.

Consequence: three run stores, one per plugin, each keyed by worktree path under its own
directory. Two surfaces bound at once record the same run twice and neither knows about the
other. That is the price of "a surface is never a dependency in either direction" — the
alternative is a shared store, which is a coupling between implementations that are supposed
to be swappable. Bind one lifecycle surface per repository.
