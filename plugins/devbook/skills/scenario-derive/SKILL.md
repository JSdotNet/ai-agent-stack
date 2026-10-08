---
name: scenario-derive
description: 'Write or re-derive the Playwright spec that runs a scenario page, from the page: the // scenario: and // signature: header, the setup call, one test per part titled exactly as its ##, one step per step, and a shot call at each screenshot point, leaving to the implementer every step body the page cannot say. Builds on qa:playwright-e2e-authoring. Use when: a scenario page has no spec, its steps or parts changed, or the scenario coverage check reports page-without-spec, signature-mismatch, or label-drift. Triggers on: "derive the spec", "scenario-derive", "re-derive the scenario spec", "signature mismatch", "page without spec". DO NOT USE FOR: writing the page (scenario-write), running it (scenario-run), or the setup hook.'
---

# devbook scenario-derive

Open the reply with `devbook@<version>`, `version` read from `../../.claude-plugin/plugin.json`, not recalled.

Brings the spec to the page, never the page to the spec. It builds on
`qa:playwright-e2e-authoring` for the e2e folder, the repository's test conventions, and how a
step body is written; without that skill, follow the specs already there. This skill fixes the
shape. The contract and the runner are in `.devbook/_tools/scenarios/README.md`; where that
folder is missing, `devbook:update` materializes it once `domain/` is adopted.

## Steps

1. **Sign the page**: `node .devbook/_tools/scenarios/signature.mjs <page.md>`.
2. **Find the spec** whose first lines read `// scenario: <page path>`. With none, create
   `<stem>.spec.ts` in the e2e folder. The setup hook and the reporter in `playwright.config.ts`
   must already exist; when they do not, stop and name what the README asks the repository to add.
3. **Write the header** as the first two lines — `// scenario: <page path from the repository
   root>` and `// signature: <signature>` — and import `scenario` and `shot` from the
   materialized `setup` module by relative path.
4. **Write the shape.** `scenario('<stem>', ({ part }) => { … })` is the setup call: it applies
   the profile, data sets, flags, settings, and sign-in, and opens `start`, so no step repeats
   them. Inside it, one `part('<title>', async ({ page, step, portal }) => { … })` per `##`, in
   page order, titled exactly as the heading; in each, one `await step('<Keyword> <text>', …)`
   per step, titled as written without the bold, and `await shot(page, '<label>')` where the page
   puts each screenshot point. A step that names another portal uses `await portal('<name>')`.
5. **Re-derive in place.** Keep the body of every step whose text is unchanged; add, remove,
   reorder, and retitle parts, steps, and `shot` calls to match the page; write the new
   signature last.
6. **Fill what the page says**, per `qa:playwright-e2e-authoring`: a **When** is the action, a
   **Then** an assertion on what the user sees. A body that needs what the page cannot say — a
   selector, a seeded id, an endpoint — calls `test.fixme()` with a comment naming what the
   implementer must supply. Never invent an assertion.
7. **Check**: `node .devbook/_tools/scenarios/check.mjs` reports nothing for this page, and
   `npx playwright test --list <spec>` lists one test per part.

## Do not

- Edit the setup hook — the file `scenarioHook` names — `profiles.json`, or the page. A step that
  needs new setup is reported to the implementer, not written into the hook.
- Title a part or a step away from the page's text, add a test the page has no part for, or
  write a signature by hand.
