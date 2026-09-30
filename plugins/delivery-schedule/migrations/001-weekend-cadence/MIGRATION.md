# 001 — the weekly schedules run on the weekend, from 1.15.0

```meta
appliesTo: [delivery-schedule]
breaking: no
```

## What

The catalog's default cadence moved for eight schedules. Every `cron` is UTC:

| Schedule | Before | After |
| --- | --- | --- |
| `morning-brief` | `0 5 * * 1-5` | `30 6 * * 1-5` |
| `devbook-update` | `0 5 * * 6` | `0 6 * * 6` |
| `security-review` | `0 4 * * 2` | `0 8 * * 6` |
| `devbook-verify` | `0 4 * * 1` | `0 5 * * 0` |
| `prose-check` | `0 4 * * 3` | `0 6 * * 0` |
| `instruction-review` | `0 4 * * 4` | `0 7 * * 0` |
| `change-report` | `0 15 * * 5` | `0 16 * * 0` |
| `weekly-update` | `0 16 * * 5` | `0 17 * * 0` |

A routine carries the cron it was created with, and the routine lives in the machine's
scheduler, not in the repository. So nothing in the repository changes: `delivery-schedule:update`
re-times each selected routine from the catalog in its step 6, and the `pluginVersion` it
stamps in step 7 is the record that it did. `migrate.mjs --check` exits `1` while
`components.schedule` is stamped below `1.15.0` and selects a moved schedule with no override,
and prints the routines `update` will re-time. Without `--check` it prints the same plan and
writes nothing.

## Why

Weekly output should be waiting on Monday morning rather than land mid-week. The ordering is
in the *Cadence* section of `resources/schedule-catalog-contract.md`.

## What breaks

Nothing. An override under `components.schedule.overrides` is the repository's choice and is
kept, and the script says so. A routine on a machine that never runs `update` again keeps its
old time until it does.
