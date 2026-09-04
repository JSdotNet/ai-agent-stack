---
name: playwright-screenshot
description: 'Capture screenshots as point-in-time evidence during Playwright MCP validation. Use at every scenario checkpoint and on every failure — this is the default evidence type for single-state checks.'
compatibility: Requires the Playwright MCP server (`@playwright/mcp`).
---

# Playwright Screenshot — Point-in-Time Evidence

Capture a still image of the page (or a specific element) as evidence for a single
checkpoint, assertion, or failure during Playwright MCP validation.

## When to Use

- After navigation, to confirm the correct page loaded.
- After each interaction that changes visible state (form submit, toggle, modal open).
- At the exact moment a failure is detected — capture before taking any recovery action.
- For any scenario where a single before/after comparison is enough evidence (no need
  to prove a continuous sequence — use `playwright-recording` for that instead).

## Steps

### 1. Stabilize the Page First

- Use `browser_wait_for` (text, element state, or a short timeout) to let animations,
  network calls, or transitions settle before capturing. A screenshot taken mid-transition
  is misleading evidence.
- Prefer waiting for a specific expected element/text over a fixed sleep.

### 2. Capture

```
Tool: browser_take_screenshot
```

(Tool names here are bare. The Playwright server ships with this plugin, so its tools
normally surface as `mcp__plugin_qa_playwright__<tool>` — `mcp__playwright__<tool>` when the
server is registered directly in a repository's own MCP configuration. Take the prefix from
your tool list.)

- Full-page screenshot by default; scope to a specific element reference (from a prior
  `browser_snapshot`) when only one component's state matters (e.g. a single form field
  error, a toast, a modal).
- Use the PNG/JPEG format the MCP server defaults to unless the user requests otherwise.

### 3. Name and Store Consistently

Save every screenshot under:

```
.wip/qa/<feature-name>/screenshots/<NN>-<short-description>.png
```

- `<NN>` — zero-padded step number (`01`, `02`, ...) so evidence sorts in execution order.
- `<short-description>` — kebab-case, e.g. `login-form-loaded`, `invalid-password-error`.
- Failures should be named to make the failure obvious, e.g. `05-submit-500-error.png`.

### 4. Reference in the Report

- Every claim in the QA report ("the form validated correctly", "the error was shown")
  must cite the screenshot path that proves it.
- Do not describe a visual outcome without an attached screenshot path.

## Common Pitfalls

- Capturing before the page/network settles, producing a blank or loading-state image.
- Overwriting a previous step's screenshot by reusing the same filename.
- Taking a full-page screenshot when only a scoped element matters, making the relevant
  detail hard to find in review.

## Reference

- Playwright MCP server: `https://github.com/microsoft/playwright-mcp`
