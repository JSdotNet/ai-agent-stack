---
name: domain-interaction-diagram
description: 'Generate Mermaid flowchart diagrams that visualise integration contracts, communication patterns, and anti-corruption layer mappings between bounded contexts.'
---

# Domain Interaction Diagram

Use this skill to produce integration diagrams that show how bounded contexts communicate — what crosses each boundary, by which mechanism, and through which integration pattern.

## Trigger Conditions

Use after `domain-interaction-model` has defined integration contracts, or when the user wants to visualise existing cross-context interactions.

## Inputs

- Bounded context files with Integration Contracts sections populated by `domain-interaction-model`.
- Context map (from `context-mapping`) to confirm relationship patterns.

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md` and `instructions/diagrams/ddd-diagram-instructions.md`.
2. Read all Integration Contracts sections across the bounded context files and extract for each integration point:
   - The two participating contexts.
   - The integration pattern (ACL, Customer-Supplier, Published Language, Open Host Service, Shared Kernel, Conformist).
   - The mechanism: integration event, command, query, or shared data.
   - The communication pattern: synchronous, asynchronous, or event-driven.
   - The ACL translator name (if an anti-corruption layer is present).
3. Produce a **Domain Interaction Overview** diagram using `flowchart LR` following `instructions/diagrams/ddd-diagram-instructions.md`:
   - One rectangle node per bounded context.
   - One hexagon node per ACL translator between contexts.
   - Labelled directional edges showing the mechanism and communication pattern.
   - External systems as stadium-shape nodes.
4. For each anti-corruption layer, produce a dedicated **ACL Translation** diagram using `flowchart LR` following `instructions/diagrams/ddd-diagram-instructions.md`:
   - Show the upstream concept, the ACL translator, and the downstream concept as three nodes.
   - Label the upstream edge with the upstream term and the downstream edge with the translated term.
5. Insert the Domain Interaction Overview diagram into `domain.md` under a **Domain Interaction Overview** section.
6. Insert each ACL Translation diagram into the relevant bounded context file under its Integration Contracts section.
7. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-output-file>` from the plugin root to generate SVG files alongside the Markdown output.

## Output

- `domain.md` updated with a Domain Interaction Overview `flowchart LR` diagram.
- Relevant bounded context files updated with ACL Translation `flowchart LR` diagrams where anti-corruption layers exist.

## Quality Checks

- Every integration contract documented in bounded context files appears on the overview diagram.
- ACL translators are shown as explicit intermediate nodes, never as direct edges between contexts.
- Edge labels identify the mechanism (event name, command name, or query name) and communication pattern (sync/async/event-driven).
- No context node exposes internal aggregate structure; only integration contracts cross the boundary.
- ACL Translation diagrams use ubiquitous language terms on both sides of the translation.
- SVG file(s) generated in `diagrams/` alongside the Markdown output using `scripts/generate-diagram-svgs.ps1`.
