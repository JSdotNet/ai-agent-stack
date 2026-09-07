---
name: change-report
title: Change report
cadence: weekly
cron: "0 15 * * 5"
target: delivery-schedule:schedule-whats-new
requires: [delivery-schedule, delivery]
tools: [Bash, Read, Write, Glob, Grep, Skill]
---

Run `schedule-whats-new` for the repository `{{repo}}` with the base branch filter
`{{repo}}={{base}}`, open and merged pull requests both included, and a first-run look-back
window of 7 days.

This session keeps nothing between runs, so point the state file at a path outside the
repository and let every run be a first run: the 7-day window is the checkpoint. Do not commit
the state file.

Publish the report as the schedule-report issue. Skip the follow-up phase — there is nobody to
ask — and instead list its candidates as the report's last section: a merged pull request
whose linked issue is still open, an open pull request whose ticket is already done, and a
pull request with no ticket at all.
