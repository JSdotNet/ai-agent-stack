---
name: context-mapping
description: 'Define and validate bounded context boundaries and map relationships between contexts using DDD strategic design patterns.'
---

# Context Mapping

Use this skill to define bounded context boundaries and map their relationships.

## Trigger Conditions

Use when the user needs to finalize bounded context boundaries, map interactions between contexts, or validate existing context definitions.

## Inputs

- Domain exploration output (events, commands, subdomains, ubiquitous language).
- Existing bounded context definitions (if refining).
- Team structure and ownership information (optional).

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md` and `instructions/ddd/strategic-design-instructions.md`.
2. Validate or define bounded context boundaries using the five heuristics:
   - Language boundary
   - Business capability boundary
   - Team boundary
   - Data consistency boundary
   - Change frequency boundary
3. For each bounded context:
   - Write a clear purpose statement.
   - Define the ubiquitous language within the context.
   - Verify the context can be developed and evolved independently.
   - Classify its deployment type as **Service** or **Module** (see `instructions/ddd/strategic-design-instructions.md`).
4. Map relationships between contexts using DDD patterns:
   - Shared Kernel, Customer-Supplier, Conformist, Anti-Corruption Layer, Open Host Service, Published Language, Separate Ways, Partnership.
5. Produce a context map diagram in Mermaid showing all contexts and labelled relationships. Colour-code each bounded context node by deployment type (Service vs Module) per `instructions/ddd/strategic-design-instructions.md`; do not colour edges/lines.
6. Run the boundary validation checklist from `instructions/ddd/strategic-design-instructions.md`.
7. Update or create output files following `instructions/output/domain-documentation-structure-instructions.md`.

## Output

- Updated `domain.md` with bounded context map and index.
- One file per bounded context with purpose, language glossary, and relationship summary.
- Context map diagram (Mermaid).

## Quality Checks

- Each context has a single, clear purpose.
- No context requires direct access to another context's internal model.
- Ubiquitous language is consistent within each context and explicitly different across contexts where needed.
- All relationship patterns are labelled on the context map.
- Each bounded context node's colour matches its deployment type (Service vs Module); edges/lines are not coloured.
