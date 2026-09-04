---
applyTo: 'instructions/**/*.instructions.md'
description: Dedicated rules for creating and refining instruction files.
---

# Create Instruction Instructions

## Purpose

- Define clear standards for `.instructions.md` assets.
- Keep instruction files scoped, reusable, and low-noise.

## Minimum Structure

Required: YAML frontmatter with `applyTo` and `description`, a title, and a rules section.

Add a purpose section, examples, and a validation checklist when they change how the rules
are applied.

## Rules

- Use the narrowest `applyTo` pattern that still covers the intended files.
- Write behavior rules as actionable statements, and separate mandatory rules from
  recommendations.
- Keep each rule in the one instruction file that owns it; point at the others by path.
- Reference the file explicitly by path from every skill or agent that depends on it.
  `applyTo` is a Copilot optimisation, not the delivery mechanism — Claude has no
  glob-scoped instruction injection, so an unreferenced file silently does nothing there.
- Promote a rule that must apply with no explicit reference to the plugin's `hooks.json`
  `sessionStart` prompt, which both hosts honour.
- Follow [spec-conciseness.instructions.md](spec-conciseness.instructions.md) for pruning and
  the 60-line budget.

## Validation Checklist

- [ ] `applyTo` pattern matches intended files.
- [ ] `description` is specific and discoverable.
- [ ] Scope boundaries are explicit and non-contradictory.
- [ ] At least one skill or agent references the file by path, or the rule is promoted to a
      `sessionStart` hook.
- [ ] Every line changes behavior versus the model default, and no meaning appears twice.
