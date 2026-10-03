---
name: devbook-push-sweep
title: Devbook push sweep
cadence: weekly
cron: "0 4 * * 3"
target: delivery-schedule:schedule-devbook-sweep
requires: [delivery-schedule, devbook, delivery]
tools: [Bash, Read, Write, Edit, Glob, Grep, Skill, Workflow]
---

Run `schedule-devbook-sweep` with `direction: push` for the repository `{{repo}}` on `{{base}}`,
with `maxResolve 1`. It brings the code level with the agreed chapters of every sync group at
`push` or `sync`: one `spec-ahead` group is built, failing test first, on its own branch under
`schedule/{{name}}/<YYYY-MM-DD>/`, and opened as a **draft** pull request whose body leads with
what could not be proved. A `sync` group that also reads `code-ahead` waits for the pull sweep.
It writes no chapter, removes no code, skips every chapter at `draft` or `proposed`, and
nothing it opens is ready for review.

The brief is the report: the draft pull request with what to validate, the groups awaiting an
answer, the chapters skipped as not agreed, what did not complete, and the
`devbook-sync-report` block.
