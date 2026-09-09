# 43. Only a Delivered Rule Lives in `rules/`

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/37-a-plugins-rules-reach-a-host-through-the-install.md", ".devbook/arc42/05-building-block-view.md", ".devbook/domain/plugin-authoring/domain.md#plugin-rule"]
```

[A Plugin's Rules Reach a Host Through the Install](37-a-plugins-rules-reach-a-host-through-the-install.md)
sorted the seventeen rule files into two kinds and gave the ten repo-facing ones a delivery
path. It left the other seven where they were, on the reasoning that a plugin-internal glob
"costs nothing". It costs one thing, and the cost is read every time someone opens the folder:
`rules/` announced a mechanism those seven do not use. `delivery-schedule` looked like a plugin
whose install writes rules into a repository. It never did — its `rules.json` carries no
`install` key, and `schedule-install` writes routines and one `components.schedule` stamp and
nothing else.

The seven are shared text a skill or an agent reads by path. That is the definition of
`resources/` already written down in
[chapter 5](../05-building-block-view.md): reference an asset points at by path.
`delivery-schedule` proved it by holding both kinds at once — `resources/schedule-preamble.md`
and `rules/schedule-catalog-contract.md` are the same kind of file, told apart by nothing but
which folder they landed in.

So they move, and the three `rules.json` files go with them:

```
plugins/delivery/resources/          flow-phases, flow-execution-model, flow-model-selection,
                                     flow-repo-context, surface-contract
plugins/delivery-schedule/resources/ schedule-catalog-contract
plugins/fleet/resources/             fleet-issue-sweep-contract
```

`rules/` now means one thing in this marketplace: rules an install materializes into a
repository. Two plugins have one — `devbook` and `devbook-collaboration` — and a reader can
tell which plugins deliver rules by looking, without opening a `rules.json` to check for an
`install` key.

Nothing is lost from the authoring side. The globs those three `rules.json` files carried
pointed inside the plugin, and this repository's own wrappers already cover the same files:
`.agents/rules/skills.md` over `plugins/*/skills/**/SKILL.md`, `.agents/rules/schedules.md`
over `plugins/*/resources/schedules/*.schedule.md`. Neither host was applying the plugin-side
globs, so removing them changes what fires nowhere.

Consequence: `check-assets.mjs`'s plugin-rules pass now sees two plugins instead of five, and
its budget pass takes a `resources/` file carrying `name` and `description` on the rule budget —
the frontmatter is what separates a contract from the templates and prompt fragments beside it,
so the seven stay budgeted and the count does not move. A contract stays over that budget by
kind, as [Budgets Are Disclosure Triggers, Not Gates](20-budgets-are-disclosure-triggers-not-gates.md)
already allows.
