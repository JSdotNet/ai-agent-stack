---
name: package-update
title: Package update
cadence: weekly
cron: "0 4 * * 1"
target: delivery:automation-package-update
requires: [delivery, csharp-coding]
tools: [Bash, Read, Write, Edit, Glob, Grep, WebFetch, Skill]
---

Run `automation-package-update` with update strategy `minor-and-patch`, target branch
`{{base}}`, and dry-run `false`.

If the repository has no .NET solution, say so in the summary and stop; nothing is opened.

Title the pull request `chore(deps): weekly package update <YYYY-MM-DD>`. List every package
the skill skipped because its bump broke the build or the tests in the pull request body, with
the version it would have moved to, so the person merging sees what was left behind.
