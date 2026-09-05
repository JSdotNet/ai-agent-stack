---
name: architecture-arc42-generator
description: Interactive arc42 documentation generator for drafting, validating, and iterating sections using reusable prompt and instruction assets.
---

# Architecture arc42 Generator

Use this skill for iterative arc42 architecture documentation workflows.

## Scope

- Section-by-section drafting and refinement
- Context-driven clarification of missing facts
- Cross-section consistency checks
- Structured handoff-ready architecture output

## Workflow

1. Load `instructions/arc42/arc42-global-instructions.md`.
2. For each target section, load `instructions/arc42/arc42-section-XX-instructions.md`.
3. Use section prompts from `skills/architecture-arc42-generator/prompts/`.
4. Draft or update section content with explicit assumptions and decision traceability.
5. Reconcile cross-section consistency for scope, constraints, risks, and quality goals.
6. Produce review-ready Markdown output.

## Prompt pack

This plugin includes arc42 section prompts under `skills/architecture-arc42-generator/prompts/`.

## Reference

Section prompts are stored in this plugin under `skills/architecture-arc42-generator/prompts/`.