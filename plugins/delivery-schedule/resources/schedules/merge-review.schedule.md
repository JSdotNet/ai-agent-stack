---
name: merge-review
title: Merge review
cadence: weekdays
cron: "0 6 * * 1-5"
target: delivery-schedule:schedule-merge-review
requires: [delivery-schedule, delivery]
tools: [Bash, Read, Glob, Grep, Skill]
---

Run `schedule-merge-review` for `{{repo}}` with the base branch filter `{{base}}`, drafts
excluded, at most 10 pull requests per run, and comments posted.

The comments the skill posts are the publication: open no pull request and no issue. The
summary lists every verdict and the pull requests skipped as already reviewed at their current
head.
