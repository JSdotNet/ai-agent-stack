# routines

The trigger lane. A routine is a schedule that fires a procedure the stack already ships, in a
cloud session that starts with nothing but the repository. The procedures live where they
always did — `delivery`'s `automation-*` skills, `devbook`'s check and refresh — and this
plugin holds the triggers, the prompt each one needs, and the three skills that put them in a
scheduler and read them back.

## Installation

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `routines` with `/plugin` and run `routine-sync` in the repository. It declares no
dependency: each routine names the plugins its target needs, and `routine-sync` skips one whose
target is not enabled in the repository rather than scheduling a session that would start
without its skill.

## The catalog

| Routine | Cadence (UTC) | Runs | Needs | Lands as |
|---|---|---|---|---|
| `package-update` | Monday 04:00 | `automation-package-update`, minor and patch only | `delivery` | A pull request |
| `merge-review` | Weekdays 06:00 | `automation-merge-review`, up to 10 pull requests | `delivery` | One comment per pull request |
| `change-report` | Friday 15:00 | `automation-whats-new`, 7-day window | `delivery` | A `routine-report` issue |
| `devbook-check` | Daily 03:00 | `devbook-check`, every adopted folder | `devbook` | A pull request when something was fixed |
| `security-review` | Tuesday 04:00 | `automation-security-review`, all four layers | `delivery` | One issue per new high finding |
| `tech-update` | Wednesday 04:00 | `devbook-tech-update`, every `.tech` layer | `devbook` | A draft pull request |

Each is one file under `resources/routines/`, and every prompt starts with
`resources/routine-preamble.md`: the unattended rules, stated once. A repository changes a
cadence under `components.routines.overrides` rather than in the catalog.

`devbook-check` is one routine, not one per folder. The generator walks every adopted folder
in a single pass, and the failures worth catching — a reference into a chapter another folder
renamed — are exactly the ones a per-folder split would not see.

## The three skills

| Skill | Does |
|---|---|
| `routine-sync` | Creates or updates the selected routines in the scheduler, disables the deselected, writes `components.routines` |
| `routine-status` | Lists them with their last runs, what each published, and the log where one failed |
| `routine-run` | Fires one now and reports the run |

All three resolve the scheduler from the live tool list, match routines by the name
`<owner>/<repo> · <title>`, and treat no scheduler as a normal outcome. The file, the prompt,
the stamp, and the operations are in `instructions/routine-catalog-contract.instructions.md`.

## What a routine never does

- **Schedule a flow.** A `flow-*` skill ends at Personal Validation, and no routine can pass a
  gate. Routines schedule `automation-*`, `fleet-*`, and read-and-report skills, and a run
  parks with a handoff brief where a gate would be.
- **Merge, approve, close, or delete.** Every change lands as a pull request from
  `routines/<name>/<date>`, every report as an issue labelled `routine-report`, and a run
  updates what its previous run left open rather than opening a second.
- **Carry anything personal into the repository.** The environment, the model, and the routine
  ids live in the scheduler. The stamp records the selection and the cadence overrides, and
  nothing that would be wrong for the next person who opens the file.

## Why it is its own plugin

It names skills in `delivery` and `devbook`, and the layer rule says a lower
layer never names a higher one — so it cannot live in any of them, and declaring all of them
as dependencies would make it a bridge nobody with one of them could install. Naming is not
depending: a target that is not installed is reported and skipped, which is an answer.

It is also the one plugin here whose subject is a host capability — cloud sessions on a cron —
and that is a divergence from the rule that nothing in this marketplace names one, taken on
purpose and recorded in `.devbook/arc42/09-architecture-decisions.md`. The catalog is
host-neutral data; only the scheduler resolution knows which tool answers.

## Before the first schedule

A cloud session loads this marketplace only if the repository's committed host settings enable
it and the plugins a routine requires. `routine-sync` checks that and refuses to schedule what
would start without its skill. The first run is still the proof: fire one with `routine-run`
and read it with `routine-status` before trusting the cadence.

## Checking the catalog

```bash
node plugins/routines/tools/routine-catalog/check.mjs
```

Fails on a malformed entry, a cron that could fire more than hourly, a target that is a flow
or does not exist, a `requires` list that omits the target's plugin, or a placeholder the
contract does not name.
