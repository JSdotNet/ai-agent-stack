---
applyTo: 'skills/architecture-blueprint-generator/**/*.md'
description: Defines baseline structure and quality expectations for architecture blueprint artifacts.
---

# Blueprint Global Instructions

## Purpose

- Establish one consistent structure for architecture blueprint documentation.
- Keep blueprint artifacts traceable to arc42 sections, ADRs, and TDRs.

## Rules

- Define system scope, boundaries, and stakeholders before solution details.
- Document architecture style, major components, and integration patterns.
- Describe dependency directions and ownership boundaries explicitly.
- Capture operational concerns: deployment, scalability, resilience, and observability.
- Link major design choices to ADRs when decisions are already recorded.
- Record unresolved questions and assumptions.

## Output Requirements

- Blueprint content must be Markdown.
- Include sections for context, structure, interactions, risks, and next decisions.
- Keep diagrams optional, but describe relationships in text when no diagram is available.

## Validation Checklist

- [ ] Scope and boundaries are explicit.
- [ ] Components and dependencies are internally consistent.
- [ ] Risks and assumptions are documented.
- [ ] Traceability to related architecture artifacts is present.
