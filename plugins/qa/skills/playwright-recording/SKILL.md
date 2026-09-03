---
name: playwright-recording
description: 'Capture continuous step-by-step evidence of a multi-step Playwright MCP flow. Use for scenarios where the sequence of interactions matters, not just the end state — e.g. multi-page checkout, wizard flows, drag-and-drop.'
compatibility: Requires the Playwright MCP server (`@playwright/mcp`). Video/trace recording only if the installed version exposes tracing tools — 0.0.79 does not.
---

# Playwright Recording — Continuous Flow Evidence

Capture a continuous record of a multi-step interaction sequence, so the QA report can show
*how* a flow behaved, not just its final state. Use this alongside `playwright-screenshot` —
this skill covers the whole sequence, that one pins a single checkpoint for quick review.

## First: Check What Your Server Can Record

**Read your tool list before choosing a form of evidence.** `@playwright/mcp` 0.0.79 — the
version this plugin installs via `@playwright/mcp@latest` — exposes **no** tracing or video
tools (`browser_start_tracing` / `browser_stop_tracing` do not exist) and **no** `--save-trace`
or `--save-video` server option. Only `--save-session` (a session log of tool calls under
`--output-dir`) and screenshots are available.

So there are two paths, and the report must name which one was used:

| Your tool list shows | Evidence form | Follow |
|---|---|---|
| No tracing tools (current default) | **Numbered screenshot sequence**, one per step | [Screenshot sequence](#screenshot-sequence-default) |
| `browser_start_tracing` / `browser_stop_tracing` | Video or Playwright trace file | [Tracing tools](#tracing-tools-if-exposed) |

Never call a screenshot sequence a video or a trace in a QA report.

## Screenshot Sequence (default)

1. Take a `browser_take_screenshot` immediately after the app is confirmed healthy (see
   `aspire-run`) and before the first interaction, so the sequence covers the entry state.
2. Take one after **every** state-changing step, in order, without skipping steps that
   "looked fine" — the point is the sequence, not the endpoint.
3. Save them zero-padded and in order so the sequence reads as a flow:

   ```
   .wip/qa/<feature-name>/sequence/<scenario-name>/01-<step>.png
   ```

4. In the report, cite the folder plus the step each frame corresponds to, and state that
   the evidence is a screenshot sequence because the server exposes no recording tool.
5. If the server was started with `--save-session`, also cite the session file under its
   `--output-dir` — it records every tool call and is the closest thing to a replayable
   trace this server offers.

Timing-sensitive behavior (animation, drag-and-drop) is the known weakness of this form:
add a `browser_wait_for` before each screenshot so each frame captures a settled state, and
say plainly in the report what a still sequence could not prove.

## Tracing Tools (if exposed)

## When to Use

- Multi-page flows (checkout, onboarding wizards, multi-step forms).
- Interactions with animation, drag-and-drop, or timing-sensitive behavior that a still
  screenshot can't represent.
- Flaky or intermittent bugs — a recording lets the QA agent (or a human reviewer)
  replay exactly what happened instead of relying on memory or a single screenshot.
- Regression scenarios that should be replayable as reference evidence for future runs.

## Steps

### 1. Start Recording Before the First Action

```
Tool: browser_start_tracing
```

(Only if your tool list actually shows it — see
[First: Check What Your Server Can Record](#first-check-what-your-server-can-record). Tool
names here are bare; prepend the prefix your tool list shows, normally
`mcp__plugin_qa_playwright__`.)

- Start tracing immediately after the app is confirmed healthy (see `aspire-run`) and
  before the first `browser_navigate` of the scenario, so the recording covers the
  entire flow from entry point to outcome.

### 2. Execute the Full Scenario

- Perform every step of the scenario (`browser_navigate`, `browser_click`,
  `browser_type`, etc.) without stopping the recording mid-sequence.
- It is fine to also take individual screenshots at key checkpoints during a recorded
  run (see `playwright-screenshot`) — the two evidence types are complementary, not
  exclusive.

### 3. Stop and Save

```
Tool: browser_stop_tracing
```

Save the output under:

```
.wip/qa/<feature-name>/video/<scenario-name>.webm
```

(or `.zip`/`.trace` if the MCP server produces a Playwright trace file instead of a
video — note the actual format returned by the tool in the QA report).

- `<scenario-name>` — kebab-case, matching the scenario name used in the QA report
  (e.g. `checkout-happy-path`, `signup-wizard-back-navigation`).

### 4. Reference in the Report

- Cite the recording path wherever the report describes a multi-step behavior.
- If the recording captured a failure, note the approximate timestamp within the
  recording where the failure occurred, in addition to the file path.

## Common Pitfalls

- Starting the recording after the first interaction, missing the initial page state.
- Stopping the recording before an async effect (toast, redirect, background save)
  has finished — wait for the expected end state before stopping.
- Recording an entire long session as a single file when several independent scenarios
  are being tested — split recordings per scenario so evidence stays reviewable and a
  failure in one scenario doesn't force re-watching unrelated ones.

## Reference

- Playwright MCP server: `https://github.com/microsoft/playwright-mcp`
- Playwright tracing docs: `https://playwright.dev/docs/trace-viewer`
