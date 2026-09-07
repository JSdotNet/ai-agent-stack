# Delivery Schedule

```meta
type: features
related: [".devbook/domain/context-map.md#delivery-schedule"]
```

> What this context lets a repository do. Everything below is observable from the tracker or the
> scheduler — which is the point, since nobody is in the session that produced it.

## Run a Procedure Unattended

```meta
type: feature
related: [".devbook/domain/delivery-schedule/domain.md#entry-point", ".devbook/domain/delivery-schedule/naming.md#entry-point"]
```

Run a flow or a review in a session with nobody watching, on a procedure that picks its own
input. Nine ship: bug fix, merge review, package update, performance review, review, security
review, week starter, weekly cost analysis, and what's new.

### Pick Its Own Input

```meta
type: sub-feature
```

Select the top open bug, every pull request waiting on a reviewer, the outdated packages, the
week's changes. A procedure that needs an argument needs a person, and that is exactly what is
missing here.

### Park Instead of Passing a Gate

```meta
type: sub-feature
related: [".devbook/domain/delivery/domain.md#gate", ".devbook/domain/fleet/naming.md#park"]
```

Write a handoff brief where Personal Validation would be and stop. No unattended run passes a
gate, which is also why no schedule may target a flow: scheduling one schedules a park.

### Land as a Pull Request or an Issue

```meta
type: sub-feature
```

Every change from `schedule/<name>/<date>`, every report as an issue labelled `schedule-report`,
and a run updates what its previous run left open rather than opening a second. Nothing merges,
approves, closes, or deletes.

## Fire a Trigger on a Cadence

```meta
type: feature
related: [".devbook/domain/delivery-schedule/domain.md#schedule", ".devbook/domain/delivery-schedule/naming.md#catalog"]
```

Ship a catalog of triggers — a cadence, a target, the plugins it needs, and a prompt — and put
them in whatever scheduler the live session exposes. Six ship, and two of them target another
plugin's skills.

### Assemble a Self-Contained Prompt

```meta
type: sub-feature
related: [".devbook/domain/delivery-schedule/naming.md#preamble"]
```

Start every prompt with the shared preamble — the unattended rules, stated once — then the
schedule's own task half. A cloud session starts with nothing but the repository, so anything the
prompt does not say is not available.

### Skip What Is Not Enabled

```meta
type: sub-feature
```

Report and skip a trigger whose target plugin the repository has not enabled, rather than
creating one that would start and find nothing. That is what lets the catalog name `devbook`
without depending on it.

## Manage the Schedules

```meta
type: feature
related: [".devbook/domain/delivery-schedule/domain.md#scheduler-resolution", ".devbook/domain/delivery-schedule/domain.md#schedule-selection"]
```

Create or update the selected schedules, read their runs and logs back, and fire one now. All
three resolve the scheduler from the live tool list and match by name, so a second sync updates
rather than duplicates.

### Record the Selection

```meta
type: sub-feature
```

Write which schedules this repository chose and any cadence it overrode into `components.schedule`
— and nothing personal. The environment, the model, and the scheduler ids stay in the scheduler.

### Prove the First Run

```meta
type: sub-feature
```

Fire one by hand and read it back before trusting the cadence. A cloud session loads this
marketplace only if the repository's committed host settings enable it, and the first run is the
only thing that proves they do.

## Check the Catalog

```meta
type: feature
related: [".devbook/domain/delivery-schedule/domain.md#catalog-check"]
```

Fail a malformed entry, a cron that could fire more than hourly, a target that is a flow or does
not exist, a `requires` list omitting the target's plugin, or an unknown placeholder. It is the
only thing that enforces the no-flow rule, which is otherwise a sentence nobody re-reads.
