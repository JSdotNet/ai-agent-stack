# 49. The Role Set Has Seven Members

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#role", ".devbook/arc42/05-building-block-view.md#roles-and-services", ".devbook/arc42/adr/19-a-role-plugin-holds-no-flow-control.md"]
```

`docs` is a role, beside `architecture`, `qa`, `domain`, `ux`, `product`, and `security`.
`config.schema.json` binds all seven, the config template lists all seven, and the set is
closed at seven.

**The Documentation Update phase needed an owner and had none.** It runs in nine flows, after
the pull request, and refreshes governed documentation. Every other candidate owner is wrong
for it: the `implement` service carries a toolchain and loops with `verify`, and this phase
touches documentation only and never code; the flow-runner performing it inline is the
*fallback*, not a binding a repository can redirect. A stage that nine flows run and no
repository can point at a specialist is the gap `docs` closes.

**A role, not a service or a point.** A role is consulted by name, states its fallback, and is
never a dependency, so an unbound `docs` degrades one stage instead of demoting nine flows.
`docs.update` is separate and is a chore extension point: servers and repo skills bind there to
*do* work after `deliver`, while `docs` names who advises. Both exist, and confusing them is
what makes the seventh role look like a duplicate.

Consequence: every list that names the roles has to say seven. Three of them said six or five
until 2026-09-08 — the surface contract and the flow-runner omitted `docs` outright, and a
reader taking either as the closed set found no role behind a phase nine flows run. Nothing
checks a prose list against `config.schema.json`, so the eighth role, if one is ever added,
drifts exactly the same way.
