---
name: security-review
title: Security review
cadence: weekly
cron: "0 4 * * 2"
target: delivery-schedule:schedule-security-review
requires: [delivery-schedule, delivery]
tools: [Bash, Read, Glob, Grep, Skill]
---

Run `schedule-security-review` in the repository `{{repo}}` with scope `all`, every layer,
and issues created for findings at severity `high` and above.

The issues the skill opens are the publication. Add a schedule-report issue only when a layer
could not run — a package manager missing, an audit command failing — so a silent gap stays
visible; otherwise the summary in this log is enough.
