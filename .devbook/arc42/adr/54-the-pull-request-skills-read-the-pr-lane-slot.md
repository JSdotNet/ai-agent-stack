# 54. The Pull Request Skills Read the pr-lane Slot

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/delivery/domain.md#pull-request-lane", ".devbook/arc42/05-building-block-view.md#host-slots", ".devbook/arc42/adr/17-no-host-profile-plugins.md", ".devbook/arc42/adr/51-raising-a-pull-request-is-not-a-skill.md"]
```

`pr-lane` is declared in `surface-contract.md` and was read in exactly one place: the Create
Pull Request phase in `flow-phases.md`. The four skills that are the [Pull Request
Lane](../../domain/delivery/domain.md#pull-request-lane) service — `pr-merge-ready`,
`update-pr-branch`, `fix-pr-checks`, `push-branch` — went straight to `gh pr` in some fifteen
calls, and `flow-repo` declared `gh api` as a stage tool. A slot the engine reads once and the
skills ignore is not a slot; it is a comment above a hardcoded binary.

Each of the five now states the slot read before its first command, and says what unbound means
for it: `pr-merge-ready` reports the branch and ends the pass, `update-pr-branch` takes the base
from the repository default and works from git alone, `fix-pr-checks` stops because the failing
job logs were its whole input, `push-branch` pushes and drops the pull request status line,
`flow-repo` writes the settings as file artifacts and reports them as manual follow-up. The
commands stay in the prose as the lane's `gh` spelling — a slot is bound, never branched, so
naming one spelling is not an if-this-host clause.

**Recording `gh` as the lane's assumed provider was the alternative,** and it was refused. It is
the cheaper edit — one record, no skill touched — but it spends a guarantee the slot had already
made, and it makes a binary a dependency of five assets in a marketplace whose slots exist so
that nothing is. [No Host Profile Plugins](17-no-host-profile-plugins.md) already fixed the unbound
answer at *no pull request*; this change makes the skills honour it.

Consequence: the `Unbound` cell for `pr-lane` reads *no pull request* in both slot tables rather
than naming `deliver` alone, because five readers now degrade under it and only one of them is
`deliver`.

**The lane stops one step short of what the tracker binding now asks of a skill,** and the gap
is deliberate. `main` landed the rule that *a skill names the operation and never the
provider's command* while this change was open, and rewrote the two pickup skills onto
`find_item`, `read_item`, and the rest. The lane cannot follow yet, because a binding declares
an operation vocabulary and a slot does not: `pr-lane` resolves to "the pull-request CLI or
API" and names no operations for a skill to call instead of `gh pr checks`. Giving it one —
`open_pr`, `read_pr`, `list_checks`, `read_check_logs` — widens the contract and is its own
decision, not a line in this one. Until then the two shapes differ on purpose: the tracker
names operations, the lane names a slot and one spelling under it.
