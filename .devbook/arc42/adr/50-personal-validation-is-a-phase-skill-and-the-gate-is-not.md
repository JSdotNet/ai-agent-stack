# 50. Personal Validation Is a Phase Skill, and the Gate Is Not

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/19-a-role-plugin-holds-no-flow-control.md", ".devbook/arc42/adr/30-the-handback-is-the-commit-point.md", ".devbook/domain/delivery/skills.md"]
```

There are three `phase-*` skills, not two. The Personal Validation **review handoff** — bring
the application up, confirm it healthy, publish the review links as clickable URLs, say what to
check by hand, present the code and QA reviews — is `skills/phase-personal-validation/`,
joining `phase-build-test` and `phase-qa-validation`. The **gate** did not move: approve,
revise, and decline stay in `resources/flow-phases.md` and belong to the `flow-runner`.

**The split is at the line between a procedure and flow control.** The handoff is a procedure
every flow runs identically and no flow should restate, which is what a `phase-*` skill is for.
The gate is flow control, and [record 19](19-a-role-plugin-holds-no-flow-control.md) puts flow
control in exactly one place per run. A skill that could record an approval would be a second
place, reachable by anything that can invoke a skill.

**A skill also loads later than prose does.** `flow-phases.md` is read at the point the phase
table names; the handoff is long, needed once, and needed at the end. Leaving it in the phase
file spends it on every run from the first stage.

Consequence: the gate's wording sits away from the procedure that leads into it, so a change to
either has to check the other. The skill's own `description` carries the claim that it presents
and never decides, which is the line a reader hits before the body — that, and the phase file's
ownership of the recorded `approval` value, is all that keeps the two from drifting. Recorded
until now only as a `delivery` 2.2.0 upgrade note.
