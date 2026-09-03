---
name: architecture-blueprint-generator
description: 'Comprehensive project architecture blueprint generator that analyzes codebases to create detailed architectural documentation.'
---

# Architecture Blueprint Generator

Use this skill to generate and maintain architecture blueprints derived from codebase structure and implementation patterns.

## Trigger Conditions

Use when the user asks to create, refresh, compare, or review a project architecture blueprint.

## Inputs

- Project context and goals
- Existing architecture constraints (if available)
- Known quality goals and risks

## Workflow

1. Apply `instructions/blueprint/blueprint-global-instructions.md`.
2. Identify system scope, key components, and boundary assumptions.
3. Document architecture style, deployment model, and technology choices.
4. Capture component interactions, dependencies, and integration contracts.
5. Add quality, risk, and traceability sections with links to ADR/TDR items when present.
6. Produce a review-ready blueprint artifact in Markdown.

## Output

- One blueprint document with scope, components, interactions, and constraints
- Explicit open questions and follow-up decisions
- Traceability pointers to arc42 sections, ADRs, and TDRs where relevant

## Quality Checks

- Scope and boundaries are explicit.
- Component relationships are internally consistent.
- Decisions and risks are traceable.