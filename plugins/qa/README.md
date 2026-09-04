# qa

Installable GitHub Copilot CLI plugin for runtime QA validation.

Runs a project through **.NET Aspire**, validates features end-to-end with the
**Playwright MCP server** (recording screenshots or video as evidence), and
continuously monitors **Aspire MCP** logs/traces for the whole test session —
so runtime errors are never missed just because the UI looked correct.

Two agent personas are included: `qa` drives the browser and produces the report,
`qa-monitor` gives continuous Aspire observability its own undivided attention.

## Includes

- Agents:
  - `agents/qa.agent.md` — drives Aspire startup, Playwright validation, and reporting
  - `agents/qa-monitor.agent.md` — dedicated Aspire log/trace monitoring persona
- Skills:
  - `skills/aspire-run/SKILL.md` — start and confirm health of the app under test via Aspire
  - `skills/playwright-validation/SKILL.md` — drive browser validation via Playwright MCP with recorded evidence
  - `skills/playwright-screenshot/SKILL.md` — point-in-time screenshot evidence for a checkpoint or failure
  - `skills/playwright-recording/SKILL.md` — continuous video/trace evidence for a multi-step flow
  - `skills/aspire-log-monitor/SKILL.md` — continuously monitor Aspire logs/traces during testing
  - `skills/delegate-to-qa-monitor/SKILL.md` — hand off monitoring to the `qa-monitor` agent persona
  - `skills/feature-test-from-issue/SKILL.md` — derive test scenarios from a GitHub issue or Jira ticket (delegates fetching/updating to a GitHub or Jira skill; no GitHub/Jira-specific content here)
  - `skills/deployed-environment-validation/SKILL.md` — validate against a specific already-deployed test environment (staging/QA/UAT) instead of a local Aspire run
  - `skills/playwright-e2e-authoring/SKILL.md` — turn a validated scenario into a durable, committed Playwright test
- Hooks:
  - `hooks.json` (session-start reminder to always run, monitor, and record evidence)

## MCP Servers (required for full capability)

| MCP Server | Purpose |
|---|---|
| Aspire MCP (`aspire mcp start`) | Run the distributed app; query resource state, logs, and traces (no metrics tool) |
| Playwright MCP (`@playwright/mcp`) | Drive a real browser: navigate, interact, snapshot, screenshot, record video |

If either server is unavailable, the agent stops and asks the user to configure it —
see the [Setup](./agents/qa.agent.md#setup) section in the agent file.

## What the QA Agent Can Do

- **Test from a GitHub issue or Jira ticket** — derive confirmed test scenarios from acceptance criteria or repro steps via `feature-test-from-issue` (delegates all fetching/updating to a GitHub or Jira plugin skill; no GitHub/Jira-specific logic lives in this plugin).
- **Run the app under test** — start an Aspire-orchestrated solution and confirm every resource is healthy before testing begins, or use `deployed-environment-validation` to target a specific already-deployed staging/QA/UAT environment instead.
- **Validate features end-to-end** — use Playwright MCP to navigate, interact, and assert against the real running UI, not just source code.
- **Record evidence** — capture screenshots per checkpoint/failure, or video/trace recordings for multi-step flows.
- **Monitor logs continuously** — keep Aspire log/trace monitoring active for the entire session, catching backend errors a passing UI might hide, either directly or via the `qa-monitor` persona.
- **Codify durable regression tests** — turn a scenario validated interactively into a committed, re-runnable Playwright test via `playwright-e2e-authoring`.
- **Report findings** — structured Pass/Fail/Flaky results with severity, evidence paths, and correlated Aspire log/trace findings.

## Multi-Agent Design: Same-Session vs. True Parallel

This plugin ships **two agent personas** (`qa` and `qa-monitor`), but a custom agent's
own `.agent.md` tool set (used the same way across Copilot CLI, VS Code, and the GitHub
Copilot App) cannot spawn a separate, truly parallel session — that capability is not
part of the documented custom-agent tool surface, and no plugin in this repository relies
on it. Two options are available, at different levels:

- **Portable (this plugin)** — `qa` optionally hands off to `qa-monitor` via the
  standard `agent` tool (`delegate-to-qa-monitor` skill). This works in any host, but the
  two personas still take turns within one session; it is not literal concurrent
  execution.
- **App-only (used by `delivery` flow skills)** — the `delivery` plugin's
  `flow-feature`, `flow-bug`, and other flow skills reach the shared QA Validation
  phase (`phase-qa-validation`), which references `qa` and `qa-monitor` directly.
  When running inside the **GitHub Copilot App**, `qa-monitor` can be run in a
  genuinely separate, concurrent child session (`create_session` plus cross-session
  messaging) while `qa` drives the browser in the current session. That capability
  belongs to the host rather than to a plugin agent's tool set, so a flow documents
  it inline rather than in a separate skill.

## Scope

- **In scope**: runtime/E2E feature validation, exploratory and regression testing through a real browser (locally or against a deployed test environment), authoring durable Playwright E2E tests from validated scenarios, evidence-backed QA reporting.
- **Out of scope**: writing unit/integration test code (see the `development` plugin's testing agent), architecture/security review, and implementing code fixes (the agent reports and offers a handoff instead).

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/qa
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/qa
```

## Uninstall

```bash
copilot plugin uninstall qa
```
