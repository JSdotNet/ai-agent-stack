---
name: devbook-pull-sweep
title: Devbook pull sweep
cadence: weekly
cron: "0 4 * * 1"
target: delivery-schedule:schedule-devbook-sweep
requires: [delivery-schedule, devbook]
tools: [Bash, Read, Write, Edit, Glob, Grep, Skill, Workflow, Agent]
---

Run `schedule-devbook-sweep` for the repository `{{repo}}` on `{{base}}` with `direction pull`
and `maxResolve 3`. It verifies every sync group at `pull` or `sync`, files a `devbook-drift`
issue for each one a person must answer, and captures up to three `code-ahead` groups from their
code one at a time, each on its own branch under `schedule/{{name}}/<YYYY-MM-DD>/`, each opened as
a **draft** pull request that writes chapters only, adds them at `status: draft`, and lists them
under *Status to decide*. Nothing is promoted, nothing is ready for review. Not adopted: say so
and stop.
