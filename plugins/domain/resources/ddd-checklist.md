# DDD Design Checklist

Validation checklist for domain design artifacts. Use during and after design sessions.

## Bounded Context Checklist

- [ ] The context has a single, clear purpose statement.
- [ ] The ubiquitous language within the context is consistent and unambiguous.
- [ ] No entity in this context requires direct access to another context's internal model.
- [ ] The context can be developed, deployed, and evolved independently.
- [ ] The context owner (team or individual) is identified.
- [ ] All interactions with other contexts are documented in the Integration Contracts section.
- [ ] The subdomain type (core, supporting, generic) is classified.

## Aggregate Design Checklist

- [ ] The aggregate has a clearly identified root entity.
- [ ] The aggregate enforces at least one business invariant.
- [ ] All state changes go through the aggregate root.
- [ ] The aggregate references other aggregates by ID only, never by direct object reference.
- [ ] The aggregate is no larger than needed for immediate consistency.
- [ ] Concurrent access is considered (optimistic concurrency or explicit locking strategy).
- [ ] One aggregate equals one transaction boundary.

## Entity Checklist

- [ ] The entity has a stable identity.
- [ ] State is encapsulated behind behavior methods.
- [ ] Public setters are avoided; state changes go through named methods.
- [ ] State transitions are validated within the entity.
- [ ] The entity name uses ubiquitous language.

## Value Object Checklist

- [ ] The value object is immutable.
- [ ] Equality is based on all component values.
- [ ] All constraints are validated in the constructor.
- [ ] The value object represents a concept defined by attributes, not identity.
- [ ] Primitive types are replaced with value objects for meaningful domain concepts.

## Domain Event Checklist

- [ ] The event is named in past tense (for example: `OrderPlaced`).
- [ ] The event carries only the data consumers need (aggregate ID and relevant fields).
- [ ] The event does not include full entity references.
- [ ] Event handlers are designed to be idempotent.
- [ ] Events are dispatched after persistence, not before.

## Context Map Checklist

- [ ] All bounded contexts are shown on the map.
- [ ] All relationships are labelled with the correct pattern (Shared Kernel, Customer-Supplier, ACL, etc.).
- [ ] The direction of each relationship is clear (upstream/downstream).
- [ ] Anti-corruption layers are specified where needed.
- [ ] No context exposes its internal model directly to another context.

## Ubiquitous Language Checklist

- [ ] Every domain term has exactly one definition within its bounded context.
- [ ] Terms that differ across contexts are documented in both contexts.
- [ ] Generic technical names are avoided for domain concepts.
- [ ] The glossary is maintained in each bounded context file.
- [ ] Domain experts can read the glossary and confirm accuracy.

## Documentation Structure Checklist

- [ ] A primary `domain.md` file exists with domain overview.
- [ ] One file exists per bounded context, named in kebab-case.
- [ ] `domain.md` links to each bounded context file.
- [ ] Each bounded context file has the required frontmatter.
- [ ] All required sections are present in each file.
- [ ] Cross-references between files use relative Markdown links.
