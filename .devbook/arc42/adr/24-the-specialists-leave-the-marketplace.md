# 24. The Specialists Leave the Marketplace

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/05-building-block-view.md#roles-and-services", ".devbook/domain/plugin-authoring/domain.md#role", ".devbook/domain/plugin-authoring/domain.md#extension-point", ".devbook/arc42/adr/19-a-role-plugin-holds-no-flow-control.md", ".devbook/arc42/adr/1-marketplace-named-jsdotnet.md"]
```

`arc42`, `csharp-coding`, `qa`, `domain`, `ux`, `documentation`, and `spec-builder` are removed
from this repository and published from a marketplace of their own. What stays is the
convention, the engine, the bridges, the surfaces, and the guide.

The split costs nothing structurally, which is the evidence that the boundary was already in
the right place. None of the seven declared a dependency and nothing declared one on them; no
module imported across the line; `tools/check-assets.mjs` and the `_meta` generator are driven
by the marketplace file and the chapters, not by a plugin list. Deleting 177 of 371 tracked
plugin files changed no mechanism.

**The by-name references go with them.** `delivery` and `devbook-flows` carried over two
hundred `plugin:asset` references into the seven, and [the guide's decision](23-the-guide-names-every-plugin-and-depends-on-none.md)
leans on exactly that: naming is not depending, and an unresolvable reference degrades one
stage. So keeping them would have worked. They are de-named anyway, because *this* marketplace
naming a plugin published from another one is a coupling nothing here can check: no manifest
declares it, no test resolves it, and a rename on the other side would rot every reference
silently. Every stage now names the point it fills — `arc42:arc42` became the `architecture`
role, `csharp-coding:coding` the `implement` service, `qa:qa` the `app.start` or `qa.run`
provider by stage — and a repository's `.devbook/config.json` is the only place a
specialist's name appears. The `**Skills:**` halves that reached inside a specialist are gone
for the same reason: which skill a role uses is the role's business.

The engine's own rule is restated to match. It names points, roles, and capabilities; a
repository names the plugin that fills one. The worked examples in the surface contract, the
`delivery` README, and the config test use `your-*` placeholder ids that satisfy the schema
without naming anything, and the stack config template starts every role and service `null` —
deliberately unbound, which the vocabulary already distinguishes from absent.

Consequence: **`delivery` installed alone is now visibly capability-free at five roles and five
services**, where before the defaults in the template quietly pointed at siblings in the same
catalog. That is the honest state, and the same one a consuming repository was always in until
it wrote its bindings. The cost is that a first-time user gets no worked binding to copy: the
template shows the shape and the contract explains the id form, but which plugin to install is
now a question this repository does not answer.

Two smaller consequences. `tools/check-assets.mjs` still refuses flow-control tools on any
non-runner plugin's agent, and no such agent ships here any more — the rule guards future
assets rather than present ones. And the conciseness rule this repository holds its own
authoring to came out of `spec-builder` and stayed, as `AUTHORING.md` beside `CLAUDE.md`: it
governs authoring here, so a pointer into a marketplace this repository does not publish would
have been the one dangling reference the rest of this change exists to remove. The departing
plugin keeps its own copy, and the two are free to diverge — nothing here reads that one.
