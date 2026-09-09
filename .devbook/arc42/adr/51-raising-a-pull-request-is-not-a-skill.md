# 51. Raising a Pull Request Is Not a Skill

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/17-no-host-profile-plugins.md", ".devbook/arc42/adr/30-the-handback-is-the-commit-point.md", ".devbook/domain/delivery/skills.md"]
```

The pull-request lane ships four skills — `fix-pr-checks`, `pr-merge-ready`, `push-branch`,
`update-pr-branch` — and no `create-pull-request`. The Create Pull Request phase opens the PR
with the host's own pull-request action when the session offers one, otherwise `gh pr create`.

**There is no procedure to hold.** Opening a PR is one command over arguments the run already
computed: the branch, a description written from the change set and the reviews, the base from
`policy.pr.base`, the work-item link. The other four each wrap something that can fail and be
repaired — checks to read and fix, a base to merge and re-validate, a checklist to score — and
that loop is what earns a skill. A `create-pull-request` skill would restate one command per
host and become the file that goes stale when a host changes its action, which is the coupling
[record 17](17-no-host-profile-plugins.md) removed everywhere else.

**The engine already has the seam.** `deliver` is a service point resolved by the `pr-lane`
slot, so a repository that needs a different pull-request shape binds the slot rather than
shadowing a skill, and with no lane available the phase produces the change set and description
as file artifacts and says so once.

Consequence: the lane is four skills and a phase, and the phase names no skill for its central
act — a reader counting skills finds a hole where the obvious one would be. That is what this
record is for, and the delivery README states it in the same line that lists the four.
