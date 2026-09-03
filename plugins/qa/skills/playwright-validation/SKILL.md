---
name: playwright-validation
description: 'Validate a feature or run extensive end-to-end testing against a running app using the Playwright MCP server, capturing screenshots or video as evidence. Use after the app under test is running (see the aspire-run skill).'
compatibility: Requires the Playwright MCP server (`@playwright/mcp`).
---

# Playwright Validation — Evidence-Backed Feature Testing

Drive real browser interactions against the running application through the Playwright
MCP server, and capture concrete evidence (screenshots or video) for every check. Do not
rely on static code reading to claim a feature works — prove it by running it.

## Prerequisites

- The app under test is already running and healthy (see the `aspire-run` skill).
- Aspire log/trace monitoring is already active (see the `aspire-log-monitor` skill) —
  start it before this skill, not after.
- The Playwright MCP server is configured before QA starts, for example:

  ```json
  {
    "servers": {
      "playwright": {
        "command": "npx",
        "args": ["-y", "@playwright/mcp@latest"]
      }
    }
  }
  ```

- The session/runtime has been restarted or MCP tools have been reloaded after
  configuration, so the `browser_*` tools are visible in the validation session.
- The prefix is resolved from the tool list you actually have. The Playwright server ships
  with this plugin, so its tools normally surface as `mcp__plugin_qa_playwright__<tool>`; the
  same server registered directly in a repository's own MCP configuration surfaces as
  `mcp__playwright__<tool>`. This skill names tools bare (`browser_navigate`) — prepend
  whichever prefix your tool list shows rather than assuming one.

## Available Playwright MCP Tools (typical set)

| Tool | Description |
|---|---|
| `browser_navigate` | Navigate to a URL |
| `browser_snapshot` | Get an accessibility-tree snapshot of the current page (preferred for locating elements) |
| `browser_click` / `browser_type` / `browser_select_option` | Interact with elements |
| `browser_take_screenshot` | Capture a screenshot of the current page or element |
| `browser_find` | Find elements by description without a full snapshot |
| `browser_evaluate` | Read computed state (e.g. a CSS value) the snapshot does not expose |
| `browser_console_messages` | Read browser console output (client-side errors) |
| `browser_network_requests` | Inspect network requests/responses made by the page |
| `browser_wait_for` | Wait for text, element state, or a time interval |

Exact tool names depend on the installed Playwright MCP version — use `browser_snapshot`
first on an unfamiliar page to confirm available element references before interacting.

**There are no tracing/recording tools in the current server** (checked against
`@playwright/mcp` 0.0.79): no `browser_start_tracing` / `browser_stop_tracing`. Continuous
evidence therefore means a screenshot sequence, not a video — see `playwright-recording`, and
never describe a screenshot sequence as video in a report.

## Workflow

### 0. Preflight Capture

Before scenario validation, prove capture works in this session:

1. `browser_navigate` to the target page or a lightweight health/render page.
2. `browser_take_screenshot` and save the smoke screenshot under the scenario evidence
   folder.

If navigation or screenshot capture fails, screenshot/video capture is unavailable. Stop or
mark the limitation according to the caller's validation policy, and do not claim
Playwright screenshot/video evidence was captured.

### 1. Define the Scenario

- Restate the feature or acceptance criteria being validated in concrete steps.
- For "more extensive testing", enumerate a scenario list (happy path, edge cases,
  invalid input, empty states, permission boundaries) before starting.

### 2. Navigate and Snapshot

1. `browser_navigate` to the feature's entry URL (from `aspire-run`).
2. `browser_snapshot` to confirm the page loaded and to find element references for
   the next interaction — avoid guessing selectors from source code alone.

### 3. Execute the Scenario

- Perform each interaction (`browser_click`, `browser_type`, etc.) in order.
- Choose the evidence type per scenario, applying the matching skill:
  - Single-state checkpoints or failures → apply the `playwright-screenshot` skill.
  - Multi-step or animated flows where the sequence itself matters → apply the
    `playwright-recording` skill (start it before the first action in the scenario).
  - The two are complementary — a recorded flow can still have checkpoint screenshots.
- Check `browser_console_messages` after each step for client-side JS errors.
- Check `browser_network_requests` when validating API-backed features — confirm status
  codes and payload shape match expectations.

### 4. Assert the Outcome

- Compare the final `browser_snapshot` (or screenshot) against the expected outcome.
- Cross-reference the Aspire log/trace stream (from `aspire-log-monitor`) for the same
  time window — a visually correct page can still hide a swallowed server-side error.
- Record Pass / Fail / Flaky with the evidence path(s) and any console/network findings.

### 5. Repeat for Each Scenario

- Use a fresh `browser_navigate` (or a full page reload) between independent scenarios
  to avoid state leakage skewing results.
- Keep all evidence files for the whole session — do not overwrite prior scenario
  evidence.

## Evidence Requirements

- Every scenario must have at least one screenshot; multi-step flows should have a
  screenshot per step or a video covering the full sequence.
- Every failure must have a screenshot taken at the point of failure, plus the
  `browser_console_messages` and `browser_network_requests` output at that moment.
- Evidence file paths must be included in the final QA report — do not describe a
  screenshot without a path the user can open.
- Browser-canvas snapshots and smoke output can be cited only as browser-canvas fallback
  evidence; they are not Playwright MCP screenshots, videos, or traces.

## Common Pitfalls

- Don't guess CSS/XPath selectors from source code when `browser_snapshot` can give an
  accurate accessible reference for the live DOM.
- Don't skip the console/network check just because the visual result looks correct.
- Don't stop Aspire log monitoring before finishing all scenarios.
- Don't reuse a stale snapshot reference after the page has re-rendered — re-snapshot.

## Related Skills

| Skill | When to use |
|---|---|
| `playwright-screenshot` | Point-in-time evidence for a checkpoint or failure |
| `playwright-recording` | Continuous video/trace evidence for a multi-step flow |

## Reference

- Playwright MCP server: `https://github.com/microsoft/playwright-mcp`
- Playwright docs: `https://playwright.dev`
