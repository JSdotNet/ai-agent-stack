# 2. Deliver

```meta
status: trial
type: stage
```

Carrying a change end to end: from a request to a validated commit, in one session or across
several.

## Flow Skills

```meta
status: trial
type: skill
stage: [plan, code, test]
related: [".devbook/arc42/08-crosscutting-concepts.md#flow-skill"]
date: 2026-09-02
```

A change routes to the flow named for what it changes, which runs it end to end.

- **Used for** — every change to a repository that has the engine enabled: `delivery` ships two
  flows, `flow-code` for the code, a dependency move and a new project included, and `flow-spec`
  for the five devbook folders. An edit to `.devbook/` routes through `flow-spec` and a code
  change through `flow-code`.
  `.claude/settings.json` enables five plugins for every session here — `devbook`,
  `devbook-derived`, `delivery`, `delivery-schedule`, and `devbook-config` — and the stamps in
  `.devbook/config.json` record what they materialized: `devbook` 1.9.0 over `arc42`, `tech`,
  `design`, and `ai`; `delivery` and `schedule` 1.9.0; `devbook-derived` 1.9.0, with its
  refresh script, its nightly and drift workflows, its rule trio, and its `AGENTS.md` section. No procedure is adopted: the
  procedures are this marketplace's product, kept as seeds in `devbook`, and a repository
  with no application to run has none of its own. A surface is enabled per person too: a run reports into
  every one bound — `delivery-surface-dashboard` and `delivery-surface-backlog` where they were
  enabled, `delivery-surface-canvas` being a Copilot canvas this marketplace does not offer — and
  resolves its phases from `.devbook/config.json`: the GitHub tracker, `devbook:validate` before
  `update-base`, `devbook:verify-change` as the skill of `spec-check`, `devbook:update` after
  `summary`, and an approval gate before `create-pr`. No phase names an agent, a model, or an
  MCP server, so every phase runs inline on the session's model. `repo-instructions`
  resolves to `AGENTS.md`, which this repository now keeps as its host-neutral root file.
  `stage-delegation` and `surface` still answer, being read from the live session rather than
  bound.
- **Adopted by** — nobody yet. Every change to this repository so far was carried by hand under
  `CLAUDE.md`, including the ones that built the flows.
- **Evidence** — none yet. A specialist is the agent a phase's entry names in the config, never
  a plugin named in a skill, so nothing dangles and nothing resolves either: the seven
  specialists that once ran `scope`, `implement`, `verify`, and the drafting of each folder
  [left the marketplace](../arc42/adr/plugin-boundaries.md).
  A flow run here therefore runs every phase inline unless the specialist marketplace is
  installed and a phase names one of its agents. What is untested is the routing itself. Promote to `adopted` once a change
  here has been carried by a flow end to end, reporting into one of those surfaces.
- **Limits** — a session loads the released `jsdotnet-devbook` marketplace from its GitHub
  clone, so a flow changed on a branch is not the one that runs here until it is released or
  the working copy is enabled by path — `claude plugin marketplace add . --scope local`, per
  *Trying a change* in `AGENTS.md`.

## Fan-Out

```meta
status: candidate
type: skill
stage: [plan, code]
depends-on: [".devbook/tech/hosts.md#claude-code-cli"]
related: [".devbook/arc42/building-blocks/delivery-schedule-entry-points.md#schedule-issue-sweep", ".devbook/arc42/adr/plugin-boundaries.md"]
date: 2026-09-21
```

The issue sweep classifies the inbox, closes what evidence shows already resolved, and works
the top of the backlog one issue at a time into draft pull requests, with nobody watching. It
replaced `fleet`, which did the working part five sessions at a time, on 2026-09-21.

- **Used for** — nothing here yet. This repository's backlog is small enough that the one-issue
  lane has never been the constraint.
- **Adopted by** — nobody. A sweep opens draft pull requests nobody asked for if the triage is
  wrong, which is not a thing to try on the repository that ships it.
- **Evidence** — none yet. `candidate` rather than `trial` because the honest first use is
  somebody else's repository. The thing to watch when it is tried is what the pull request
  bodies say could not be proved: a sweep whose every draft names something to validate is the
  design working, and reading that as a failure is how the bar gets lowered.
- **Limits** — the resolution runs through the host's workflow tool, which is the same
  host-capability divergence the schedule plugin already records.

## Scheduling

```meta
status: candidate
type: skill
stage: [operate, monitor]
related: [".devbook/arc42/08-crosscutting-concepts.md#schedule", ".devbook/arc42/adr/plugin-boundaries.md"]
date: 2026-09-07
```

`delivery-schedule` fires an entry point, a check, or a refresh on a cadence, as a local
routine on the maintainer's machine with nobody watching, and lands a change as a pull request and its report as the run's last message.

- **Used for** — four of the thirteen schedules are enabled against this repository, per the
  stamp in `.devbook/config.json`: `devbook-validate`, `tech-update`, `merge-review`, and
  `package-update`. The issue sweep is not among them yet.
- **Adopted by** — this repository, where a draft pull request nobody asked for costs a
  glance, not a rebase.
- **Evidence** — the fact the design first rested on came back false on 2026-09-28: a cloud
  session did not load the marketplace from the repository's committed settings, and the
  Backlog issue sweep stopped at its first rule without its skill. Every schedule has been a
  local routine since, running with the plugins installed on the machine. Promote to `trial`
  once a local run has run its target and published here,
  and watch two things: whether the idempotence rule held — one open pull request per
  schedule, updated rather than doubled — and whether a parked run's draft carried enough
  brief to resume by hand.
- **Limits** — one platform: the scheduler is resolved from the live tool list and only one
  host has one, so on the other the prompts print and a person pastes them. No schedule fires
  a flow; see [the decision](../arc42/adr/plugin-boundaries.md).
