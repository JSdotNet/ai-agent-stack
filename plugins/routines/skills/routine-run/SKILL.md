---
name: routine-run
description: 'Fire one of this repository''s routines now, outside its schedule, and report the run. Use when: running a routine now, testing a routine right after routine-sync, or re-running one that failed.'
---

# routine run

The scheduler and the identity rule are in `instructions/routine-catalog-contract.instructions.md`.

## Steps

1. **Take the routine name.** Without one, list the selection from `components.routines` and
   ask.
2. **Resolve the scheduler** from the live tool list. None: say the routine is fired from the
   host's routines page, and stop.
3. **Find it**: `list`, matched on `<owner>/<repo> · <title>`. Not found: say so and point at
   `routine-sync`.
4. **Confirm before firing.** Show the name, the target skill, and what the run may open — a
   pull request on `routines/<name>/`, an issue labelled `routine-report` — and wait for a yes.
   Then `run`.
5. **Report.** Wait for the run to appear in `list_runs`, `get_run_log` it, and report as
   `routine-status` does in its step 5.

A run fired this way is the same unattended session a schedule starts. It cannot ask this
session anything, and it parks where a gate would be.
