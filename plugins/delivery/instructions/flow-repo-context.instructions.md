---
applyTo: 'skills/flow-*/SKILL.md'
description: Defines the optional .claude/flow-context.md convention a consuming repository uses to declare how its application starts, where to validate it, and how deep QA should go, so flows do not have to guess or ask.
---

# Flow Repo Context (Flow-Owned)

## Purpose

- Give a consuming repository **one** optional file that states how its application is
  started and validated, so the `qa:qa` agent and the `aspire` / `aspire-run` skills stop
  guessing the AppHost or interrupting a run to ask the user.
- Define the convention **once** here, so a maintainer edits this file instead of
  re-describing repo context in every `flow-*/SKILL.md`.
- Keep the file strictly about **runtime and validation context**. Model choice is personal
  and never comes from the repository (see `flow-model-selection.instructions.md`), and MCP
  server configuration stays in the repository's own `.mcp.json` and instruction files.
- Interactive developer startup — the URL to open, and optionally sign-in and an area map —
  may live here too. No plugin ships a start procedure any more, so this file is the only
  place a repository writes it down.

## The File

- A consuming repository may create `.claude/flow-context.md` at its repo root.
- The file is **optional**. When it is missing, behavior is unchanged: flows
  discover the AppHost and entry points as they do today, record ambiguous discovery in the
  relevant stage output, and continue with the appropriate validation result.
- The flow-runner reads it **once per run**, before `start_run`, and persists the relevant
  values into the run context so every stage that needs them gets the same answer.

## Schema

The file uses this exact top-level heading and these exact section headings, in this order.
Every section is individually optional.

```markdown
# Flow Repo Context

## Application

## How to Run

## Base URLs

## Test Credentials

## MCP Servers

## Healthy Startup

## QA Depth

## Repo-Native Flow Skills
```

### `## Application`

What runs, stated as key lines:

- `**Runnable application:** <name or short description>` — or the exact literal
  `**Runnable application:** none` for a repository with nothing to start (see
  "Repositories With No Runnable Application").
- `**AppHost project:** <path>` — the Aspire AppHost project path, when the repository has
  one.

### `## How to Run`

The command that starts the application locally, in a fenced code block — for example
`aspire start`, or `dotnet run --project <path>`. Include any required working directory or
prerequisite step. This is what the QA phase runs instead of inferring a command.

### `## Base URLs`

The entry points to validate against: the dashboard URL, the primary web front end, and any
API base URL a scenario needs. One bullet per entry point, each naming what it is.

### `## Test Credentials`

A **pointer only** — how to obtain credentials, never the credentials themselves. For
example: the secret store or key vault entry, the environment variable names the app reads,
the seeded test account convention, or "anonymous, no auth required". See "Rules" below.

### `## MCP Servers`

The MCP servers this repository relies on during flow, named by their server IDs.
This section is informational: the repository's `.mcp.json` and its own instruction files
remain the source of truth, and the plugin does not own or configure them.

### `## Healthy Startup`

What a successful start looks like, so a stage can judge startup without asking: the
resources expected to reach a running/healthy state, the health endpoints to check, and the
log signals that indicate readiness. Also note known-benign warnings so they are not
reported as failures.

### `## QA Depth`

A single lowercase value naming this repository's default QA depth, optionally followed by
repo-specific caveats as bullets:

| Value | Meaning |
| --- | --- |
| `playwright-qa` | Full Playwright validation with screenshot/video capture. |
| `targeted` | Targeted verification of affected scenarios; capture only on failure or on request. |
| `startup-only` | Start the application, confirm health and clean logs; no functional scenarios. |
| `skipped` | Do not run QA validation for this repository. |

The repository value overrides the change-kind default in
`skills/phase-qa-validation/SKILL.md`. When the section is absent, that skill's automatic
change-kind selection applies unchanged.

### `## Repo-Native Flow Skills`

The `flow-*` skills this repository defines itself in the host's repo-native skill folder,
which are invisible to the plugin and to the plugin-global routing hook. One bullet per skill, naming
the skill and the task category it owns — for example
`` `flow-backlog` — backlog and work-item flow ``.

A repo-native skill **takes precedence** over the plugin-provided skill for the categories it
covers. Declaring them here lets the flow-runner learn them from the file it already reads
once per run, rather than from repository prose. The section is optional: when it is absent,
repo-native skills are still discovered normally through the skill picker.

## Repositories With No Runnable Application

A repository with nothing to start declares it explicitly so QA is skipped cleanly instead
of a stage attempting discovery and failing:

- Under `## Application`, the exact line `**Runnable application:** none`.
- Under `## QA Depth`, the value `skipped`.

`**Runnable application:** none` alone is sufficient to trigger the skip, so a repository
that writes only the `## Application` line still behaves correctly. When it is present, the
QA Validation stage is marked `skipped` with the reason recorded, and no startup, Playwright
run, or `qa:qa` delegation is attempted.

## Rules

- **Optional, never required.** A missing file changes nothing; flows behave as
  they do today.
- **No secrets.** The file is committed to the repository. `## Test Credentials` names where
  credentials live and how to obtain them — never a password, token, key, or connection
  string.
- **No model IDs.** This file must not pin a model, a model family, or a tier. Model choice
  belongs to the personal override and the categories in
  `flow-model-selection.instructions.md`; the repository never sets it.
- **Degrade gracefully.** A missing section, an unrecognized `## QA Depth` value, or
  malformed content is not an error: fall back to the existing behavior for that concern,
  note the fallback once, and continue the run. Never block a run on this file.
- **Repository-owned.** The file lives in the consuming repository and is written by that
  repository's maintainers. The plugin defines the convention; it does not ship the file.
- **Single source of truth.** Do not copy this convention's prose into `flow-*/SKILL.md`
  files; reference this file instead.
