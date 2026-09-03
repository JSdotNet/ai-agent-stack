---
applyTo: 'skills/create-technical-debt-record/**/*.md'
description: Defines required structure and governance metadata for technical debt records.
---

# TDR Global Instructions

## Purpose

- Standardize Technical Debt Records for consistent prioritization and remediation planning.
- Keep debt records traceable to architecture decisions and delivery risk.

## Rules

- Describe the debt item, origin, and affected components.
- Capture impact across quality attributes, operations, and delivery.
- Record severity, owner, and target remediation timeframe.
- Document candidate remediation options with trade-offs.
- Link each TDR to related ADRs, arc42 sections, and work planning artifacts.

## Output Requirements

- TDRs must be Markdown documents.
- Use a consistent status model such as identified, planned, in-progress, or resolved.
- Keep remediation expectations measurable when possible.

## Validation Checklist

- [ ] Debt scope and impact are explicit.
- [ ] Severity, owner, and timeline are documented.
- [ ] Remediation options are actionable.
- [ ] Traceability links to architecture artifacts are included.
