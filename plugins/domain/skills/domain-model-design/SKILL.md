---
name: domain-model-design
description: 'Design tactical domain models within a bounded context — aggregate roots, entities, value objects, domain events, and invariants.'
---

# Domain Model Design

Use this skill to design the tactical domain model for a specific bounded context.

## Trigger Conditions

Use when the user needs to design aggregates, entities, value objects, domain events, or domain services within a bounded context.

## Inputs

- Bounded context file with purpose, ubiquitous language, and integration contracts.
- Business rules and invariants for the context.
- Use cases or user stories scoped to this context (optional).

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md` and `instructions/ddd/tactical-design-instructions.md`.
2. Identify **aggregates** within the context:
   - Determine consistency boundaries: what must be immediately consistent in a single transaction?
   - Identify the aggregate root for each aggregate.
   - Keep aggregates small. Split if two concepts can be eventually consistent.
3. For each aggregate, design:
   - **Aggregate root** — name, responsibilities, and public interface.
   - **Internal entities** — entities that exist only within this aggregate.
   - **Value objects** — immutable concepts defined by their attributes.
   - **Invariants** — business rules that must always hold within this aggregate.
   - **Domain events** — events raised when significant state changes occur.
4. Validate the design against `resources/ddd-checklist.md`.
5. Check for anti-patterns using `resources/ddd-anti-patterns.md`.
6. Document domain services for logic that spans multiple aggregates or does not belong to a single entity.
7. Update the bounded context file following `instructions/output/domain-documentation-structure-instructions.md`.

## Output

- Updated bounded context file with aggregate designs, invariants, domain events, and domain services.
- Invariant documentation table for each aggregate.
- Flagged anti-patterns or design concerns.
