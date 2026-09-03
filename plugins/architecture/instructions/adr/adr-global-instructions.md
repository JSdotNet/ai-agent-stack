---
applyTo: 'skills/create-architectural-decision-record/**/*.md'
description: Defines required ADR content and decision-traceability quality gates.
---

# ADR Global Instructions

## Purpose

- Standardize Architecture Decision Records across this plugin workflow.
- Ensure decisions are justified, traceable, and review-ready.

## Rules

- State one decision per ADR.
- Include context, decision drivers, selected option, and rejected alternatives.
- Use a clear status such as proposed, accepted, superseded, or deprecated.
- Document consequences, risks, and migration or rollback notes.
- Add traceability links to impacted arc42 sections and related TDR entries.

## Output Requirements

- ADRs must be Markdown documents.
- Use stable identifiers and titles that remain meaningful over time.
- Keep rationale explicit and evidence-based.

## Validation Checklist

- [ ] Decision statement is clear and scoped.
- [ ] Alternatives and rationale are documented.
- [ ] Consequences and risk impact are explicit.
- [ ] Status and ownership are present.
- [ ] Links to related architecture artifacts are included.
