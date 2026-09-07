---
name: routine-status
description: 'Show this repository''s routines and how their recent runs went — schedule, enabled state, the last runs, what each published, and the log of a run that failed or parked. Use when: checking whether a routine ran, why a scheduled run failed, what a routine produced last night, or listing the scheduled routines.'
---

# routine status

Read-only. The scheduler, the identity rule, and the stamp are in
`instructions/routine-catalog-contract.instructions.md`.

## Steps

1. **Resolve the repository** with `gh repo view --json nameWithOwner` and read
   `components.routines` from `.github/ai-agent-stack.json` for the selection.
2. **Resolve the scheduler** from the live tool list. None: say the host's routines page holds
   the answer, list the selection from the stamp, and stop.
3. **List** and keep the routines named `<owner>/<repo> · …`. For each, `list_runs`. For the
   most recent run that failed or parked, and for the run the user asked about, `get_run_log`.
4. **Cross-check what a run published** with `gh`: an open pull request on `routines/<name>/`,
   an open issue labelled `routine-report`.
5. **Report** one table: routine, cron, enabled, last run with its outcome, what it published
   as a link, and one line from the log at the point a failed run went wrong. A routine in
   the stamp the scheduler does not know is `not scheduled — run routine-sync`; a scheduled
   one the stamp does not list is `unmanaged`.

An empty run list is not proof a routine never fired: a fire refused before a session existed
leaves no run behind. Report the routine's own `enabled` state and next fire beside the empty
list rather than concluding.
