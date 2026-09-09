# 26. The Unattended Lane Is Its Own Plugin

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#schedule", ".devbook/arc42/05-building-block-view.md#schedule-plugin", ".devbook/arc42/adr/22-fan-out-is-its-own-plugin.md", ".devbook/arc42/adr/17-no-host-profile-plugins.md", ".devbook/tech/hosts.md#scheduled-cloud-sessions"]
```

Everything that runs with nobody watching lands in one plugin, `delivery-schedule`: the nine
entry points that were `delivery`'s `automation-*` skills, and the triggers that fire them,
which were a `routines` plugin beside it. One prefix, `schedule-*`. It depends on `delivery`
and names `devbook`.

The first shape had the procedures inside the engine and the triggers outside it, because a
trigger names across layers and the engine may not. That kept the layer rule and split one
subject: nine skills no attended flow ever reaches sat in the engine, and the plugin that
fired them could not be installed with them in one act. Merging them upward keeps the layer
rule the other way round — the extension names the engine, never the reverse — and makes the
subject one folder, one dependency, one enable. It is the shape
[fan-out](22-fan-out-is-its-own-plugin.md) already has, for the same reason: an L1 extension that
owns no flow, holds no gate, and adds no extension point.

**A schedule is a trigger and never a procedure.** That is the rule the plugin exists to keep:
a prompt names an entry point and its inputs, and one preamble names the unattended rules
once. A schedule never fires a `flow-*` skill, because a flow ends at Personal Validation and
no unattended run can pass a gate. The surface contract's unattended rule already says what
happens at a gate nobody can answer — park with a brief — and a scheduled run parks the same
way, as a draft pull request. Two entry points were written as skills rather than as prompts
for exactly this reason: a trigger that carries its own procedure is the duplication the rule
exists to prevent.

**`schedule-` is the name because neither host's is.** Claude Code calls the capability
*Routines*; the GitHub Copilot app calls it *Automations*. The old split used both words for
two different things, which made each half read as one host's product. Naming says a host's
word is recorded as an alias rather than adopted, so the term is *schedule* and both are
aliases — one catalog, either host, no branch.

**It names a host capability, and that is a divergence taken on purpose.**
[No host profile plugins](17-no-host-profile-plugins.md) ended host-naming, and a cron-scheduled
cloud session is a host capability. The catalog stays host-neutral data — a cadence, a target,
a prompt — and only the scheduler resolution knows which tool answers, resolved from the live
tool list the way a surface is, with none a normal outcome that prints the prompts for a
person to paste. The one host fact the plugin writes down is the name of that tool and of the
settings file a cloud session needs to load the marketplace, in the catalog contract, because
a install skill that could not say either would schedule nothing.

**Nothing personal reaches the repository.** Scheduler ids, the environment, and the model are
account facts; matching on the schedule's name makes every operation idempotent without a
ledger, so the stamp records the selection and cadence overrides and nothing else. That is the
same line the devbook stamp draws about installed plugin versions, drawn for the same reason.

Consequence: **enabling `delivery-schedule` schedules nothing.** A repository selects through
`delivery-schedule:install`, which refuses a target whose plugin the repository's committed host settings
do not enable. And a first run is the only proof that the cloud session loaded the marketplace
at all — recorded as `trial` in [hosts](../../tech/hosts.md#scheduled-cloud-sessions) until one
has.

Consequence: **`components.routines` is now `components.schedule`.** The plugin that wrote the
old key landed and merged the same day and never left `0.1.0`, so the rename ships without a
migration rather than with one nothing would run. A repository that did stamp the old key
renames it by hand and re-runs `delivery-schedule:install`, which rewrites the entry either way.
