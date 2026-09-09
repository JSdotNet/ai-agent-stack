# 37. A Plugin's Rules Reach a Host Through the Install

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/27-one-rule-one-wrapper-per-host.md", ".devbook/arc42/adr/28-devbook-owns-one-section-of-agentsmd.md", ".devbook/arc42/adr/43-only-a-delivered-rule-lives-in-rules.md", ".devbook/domain/plugin-authoring/domain.md#plugin-rule"]
```

[One Rule, One Wrapper Per Host](27-one-rule-one-wrapper-per-host.md) settled the repository half
and left the plugin half on an assumption that does not hold: that `applyTo` "steers Copilot".
It steers nothing from inside a plugin. Neither manifest has an `instructions` or `rules`
key — no plugin here declares one — and neither host has a rules component, so a scoped rule
shipped inside a plugin is auto-applied by *both* hosts equally: not at all. The seventeen
files reached a session only where a skill or an agent named one by path.

For the six that glob a path inside the plugin — `delivery`'s five over `skills/flow-*/SKILL.md`
and `fleet`'s one — that costs nothing. Only a maintainer of this repository edits those, and
`.agents/rules/skills.md` already wraps that glob for both hosts. `delivery-schedule`'s
contract globs `**/*.schedule.md`, and all six of those files live in the plugin too, so it is
the same kind and now has the same treatment in `.agents/rules/schedules.md`.

**Superseded in part, 2026-09-07** by
[Only a Delivered Rule Lives in `rules/`](43-only-a-delivered-rule-lives-in-rules.md): those seven
did cost something — the folder they sat in advertised a delivery mechanism they do not use.
They are contracts, and they moved to `resources/`. The delivery path below is unchanged, and
is now the only reason a plugin has a `rules/` folder.

The other ten are different in kind. `devbook`'s nine and `devbook-collaboration`'s one glob
`.devbook/domain/**` and its siblings — paths in the *adopting* repository, the only place the
glob can resolve. A rule that can only fire there has to be delivered there, and devbook
already delivers: tools, workflows, and one section of `AGENTS.md`, hash-tracked in the stamp.
So the rules join the asset table.

Each ships as a trio, in the shape this repository already uses for its own rules:

```
plugins/devbook/rules/<name>.md          the rule. name + description, no scope of its own
plugins/devbook/rules/rules.json         its paths, and which adopted folder pulls it in
  └── .agents/rules/<name>.md            the rule, verbatim
        ├── .claude/rules/<name>.md      paths verbatim → pointer
        └── .github/instructions/<name>.instructions.md
                                         applyTo = paths.join(",") → pointer
```

Four choices inside that, each with a reason:

- **The file is named for what it becomes.** `instructions/<name>.instructions.md` was
  Copilot's filename for a file Copilot does not read here. `rules/<name>.md` matches its
  target, `.agents/rules/<name>.md`, character for character — so a rule that references a
  sibling by bare filename resolves in the plugin *and* in every repository the install writes to,
  with no rewrite at either end. That property is what makes the neutral copy cheap; under the
  old naming it would have cost a rewrite of every cross-reference between the ten, which is
  why a two-file shape with the body in `.github/instructions/` was reached for first and then
  abandoned.
- **The globs live in `rules/rules.json`, not the frontmatter.** A rule is content; its scope
  and its adoption condition are delivery metadata the install skill reads. Splitting them makes the
  rule a template with nothing host-shaped in it, and puts every rule's scope on one screen —
  which the nine devbook rules needed, and which a hand-written prose table in
  `rule-wrappers.md` had been standing in for. `install` joins `paths` in the same entry, so one
  file answers both "where does this apply" and "who gets it".
- **Verbatim, not trimmed to the adopted layout.** The globs carry both spellings, flat and
  nested. Trimming is what the two workflows get, and it makes them customized from the first
  reconcile onward — right for a workflow nobody ships twice, wrong for a rule that must keep
  taking upgrades. A glob matching nothing applies nothing, so carrying both costs nothing.
- **A wrapper per host, and neither host holding the body.** The alternative was to put the
  rule in one host's folder and point the other at it, which buys one fewer file and picks a
  favourite. Three files keep the invariant intact in both places: one copy of the rule, a
  wrapper per host, and never a rule written in a wrapper. Because `applyTo` is exactly
  `paths` comma-joined, the wrappers stay derivable and checkable — the bargain
  [No Generated Sync Layer](4-no-generated-sync-layer.md) already struck.

**The frontmatter goes neutral with it.** All seventeen carried `applyTo`, which is Copilot's
key and nothing else's, on files no host reads it from — it announced a host that was not
reading and hid the one that could not. `check-assets.mjs` replaces its `instructions` pass
with a `plugin rules` pass refusing `applyTo` or `paths` in a rule, a `name` that is not the
filename, a missing `description`, a rule with no `rules.json` entry, an entry with no rule,
and an empty `paths`.

The cost is a rename across the marketplace: 309 references in 98 files, and
`.agents/rules/instructions.md` becomes `plugin-rules.md` because it no longer describes
instruction files. Nothing outside this repository had them yet — no release ever materialized
one — so the rename is paid once, here, and `devbook`'s `UPGRADING.md` says so for anyone who
hardcoded an old path.

Consequence: devbook goes to `1.4.0` and reconcile installs twenty-seven files into a fully
adopting repository. No migration: the contract version is untouched, and a new asset row is
materialized by the phase that already exists. `devbook-collaboration` grows one too —
`devbook-collaboration:install`, writing `components.collaboration` — because its rule is repo-facing
in exactly the same way and `devbook` may not carry it: a plugin never installs the layer above
it. That plugin's README no longer says it materializes nothing into a repository.
