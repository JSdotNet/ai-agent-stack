# 30. The Handback Is the Commit Point

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/10-one-config-file-two-kinds-of-key.md", ".devbook/arc42/adr/9-the-point-set-is-closed.md"]
```

The engine said nothing about when a flow commits, so whether a run produced one commit or
fifteen was whatever the bound `implement` provider happened to do. A reviewer reading the
resulting branch could not tell a handback from a mid-stage save.

`policy.commit.at` closes that: `gate` makes Personal Validation the single commit point —
one commit before every handback, a new commit for every revise round, and no stage before it
commits at all. `manual`, the default, is today's behaviour and leaves committing to the user.

The commit belongs to the gate phase rather than to `implement` because the handback is what
it marks. A commit per implementation pass records how the work was written; a commit per
handback records what the user was asked to approve, which is the unit anyone later reads the
branch for. Attaching it to the phase also keeps it out of the provider contract, so a
repository swapping coding plugins does not change how its history is shaped.

Consequence: with `gate` set, a rejected handback leaves a committed change set on the branch
that the next commit corrects rather than replaces — deliberately, since amending would
rewrite what the user already reviewed. A branch therefore carries one commit per validation
round, not one per flow.
