---
applyTo: '**/*.agent.md,**/*.instructions.md,**/SKILL.md'
description: Pruning rules and size budgets that keep authored customization assets short enough to stay predictable.
---

# Spec Conciseness Instructions

## Purpose

- Keep every authored asset short enough that the model attends to all of it.
- Give authoring a deletion discipline, so assets stop accumulating lines.

## Single Source Of Truth

- State each rule in exactly one file. Everywhere else, link to that file by relative path.
- Canonical sources: `dual-host-authoring.instructions.md` for the host contract, the
  repository's own instruction files for repository-wide standards, and the matching
  `create-*.instructions.md` for asset-specific rules.
- Prefer a one-line pointer over a summary. A summary is a second copy that drifts.
- The environment is a source of truth too: record what an author cannot find by looking —
  the unwritten convention, the reason behind a choice, the gotcha no config confesses.

## The No-Op Test

- Apply to every sentence: does it change behavior versus what the model does by default?
- When it does not, delete the whole sentence rather than shortening it.
- The test is model-relative. Settle a disagreement by running the asset, not by debate.
- Known no-ops: "keep content in English" (set repository-wide, if at all), "remove
  ambiguity", "validate consistency", "be thorough".

## Size Budgets

The budget is the trigger for a disclosure decision, not a hard limit. Count authored body
lines; frontmatter such as an agent `tools` list does not count.

| Asset | Budget |
|---|---|
| `SKILL.md` | 40 lines |
| `*.instructions.md` | 60 lines |
| `*.agent.md` | 80 lines |

- Past the budget, move on-demand reference into a `resources/` file and point at it, or split
  the asset by branch so each path carries only what it needs.
- Inline what every run needs; disclose behind a pointer what only some runs reach.
- State the reason in the file when an asset genuinely must exceed its budget.

## Positive Phrasing

- Write the target behavior: "pin every action to a commit SHA", not "avoid version tags".
- A prohibition drags the banned behavior into context and makes it more available.
- Keep a prohibition only as a guardrail with no positive phrasing, and pair it with the
  positive target.

## Validation Checklist

- [ ] Every line changes behavior versus the model default.
- [ ] No meaning appears in two files; duplicates are replaced by a relative-path pointer.
- [ ] The asset is within its budget, or states why it exceeds it.
- [ ] Rules are phrased as target behavior.
