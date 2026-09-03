---
name: aggregate-diagram
description: 'Generate a Mermaid class diagram of aggregates, entities, value objects, and their relationships within a bounded context.'
---

# Aggregate Diagram

Use this skill to produce a visual class diagram of the tactical domain model for a bounded context.

## Trigger Conditions

Use after `domain-model-design` has produced a bounded context file with aggregate designs, or when the user wants to visualise an existing tactical model.

## Inputs

- Bounded context file with aggregate designs (aggregate roots, entities, value objects, domain events).
- `instructions/ddd/tactical-design-instructions.md` (already loaded if `domain-model-design` ran earlier).

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md` and `instructions/diagrams/ddd-diagram-instructions.md`.
2. Read the bounded context file and extract:
   - Aggregate roots with their key responsibilities.
   - Internal entities and the aggregate that owns them.
   - Value objects and the aggregate that owns them.
   - Cross-aggregate ID references.
   - Domain events raised by each aggregate.
3. Build a Mermaid `classDiagram` following `instructions/diagrams/ddd-diagram-instructions.md`:
   - Annotate each aggregate root with `<<AggregateRoot>>`.
   - Annotate each entity with `<<Entity>>`.
   - Annotate each value object with `<<ValueObject>>`.
   - Annotate each domain event with `<<DomainEvent>>`.
   - Use composition (`*--`) for entities and value objects contained within an aggregate.
   - Use dashed dependency (`..>`) labelled `uses id` for cross-aggregate references.
   - Use dashed dependency (`..>`) labelled `raises` for domain events emitted by an aggregate.
   - Apply the Color Conventions from `instructions/diagrams/ddd-diagram-instructions.md` to every class via a `style <ClassName> fill:...,stroke:...,color:...` line (not `classDef`/`:::`, which Mermaid does not apply to `classDiagram` nodes), colouring class boxes only — never relationship lines.
4. Insert the diagram into the bounded context file under an **Aggregate Diagram** subsection within the Aggregates section.
5. Confirm with the user before overwriting an existing diagram.
6. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-bounded-context-file>` from the plugin root to generate an SVG alongside the Markdown output.

## Output

- Updated bounded context file with an embedded Mermaid `classDiagram` of the aggregate model.

## Quality Checks

- Every aggregate root described in the file appears on the diagram.
- Cross-aggregate references are shown by ID only, never as direct composition.
- Value objects are differentiated from entities by the `<<ValueObject>>` annotation.
- Domain events are shown as separate nodes connected to their emitting aggregate.
- Every class is coloured per its stereotype's `style` line in `instructions/diagrams/ddd-diagram-instructions.md`; relationship lines remain uncoloured.
- The diagram accurately reflects the bounded context file content.
- SVG file generated in `diagrams/` alongside the Markdown output using `scripts/generate-diagram-svgs.ps1`.
