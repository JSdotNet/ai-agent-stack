---
applyTo: '**/*.md'
description: Defines the Markdown file structure for domain design output artifacts.
---

# Domain Documentation Structure Instructions

## Purpose

Define the file structure and heading conventions for domain design artifacts produced by the domain architect agent.

## File Structure

Each project produces the following domain documentation structure:

```
doc/domain/
├── domain.md                          # Primary domain overview
├── <bounded-context-name>.md          # One file per bounded context
├── <bounded-context-name>.md
└── ...
```

## Primary Domain File — `domain.md`

The `domain.md` file provides the high-level domain overview. It contains:

### Required Sections

1. **Domain Overview** — one-paragraph summary of the business domain.
2. **Subdomains** — table listing each subdomain with name, type (core, supporting, generic), purpose, and owning bounded context(s).
3. **Bounded Context Map** — Mermaid diagram showing all bounded contexts and their relationships, with each context node colour-coded by deployment type (Service vs Module) per `instructions/ddd/strategic-design-instructions.md`.
4. **Cross-Cutting Concerns** — domain-wide policies, shared constraints, or compliance requirements that span multiple contexts.
5. **Bounded Context Index** — table linking each bounded context name to its dedicated file, including its deployment type (Service or Module).

### Frontmatter

```yaml
---
title: Domain Overview
domain: <domain-name>
last-updated: <date>
---
```

## Bounded Context Files — `<bounded-context-name>.md`

Each bounded context gets a separate file named using kebab-case (for example: `order-management.md`, `identity-access.md`).

### Required Sections

1. **Context Purpose** — one-paragraph description of this context's responsibility.
2. **Ubiquitous Language** — glossary table with term, definition, and related terms.
3. **Aggregates** — for each aggregate:
   - Aggregate root name
   - Entities and value objects within the aggregate
   - Key invariants (business rules that must always hold)
   - Domain events raised by this aggregate
4. **Domain Events** — table listing all events with name, trigger, and payload summary.
5. **Integration Contracts** — inbound and outbound contracts with other bounded contexts:
   - Events consumed and produced
   - Commands or queries received from or sent to other contexts
   - Anti-corruption layer mappings (if applicable)
6. **Open Questions** — unresolved domain decisions or assumptions needing validation.

### Frontmatter

```yaml
---
title: <Bounded Context Name>
context: <bounded-context-name>
domain: <domain-name>
subdomain: <subdomain-name>
subdomain-type: core | supporting | generic
last-updated: <date>
---
```

## Cross-Reference Rules

- `domain.md` must link to each bounded context file in the Bounded Context Index.
- Each bounded context file must link back to `domain.md` in its Integration Contracts section when referencing cross-context interactions.
- Use relative Markdown links (for example: `[Order Management](order-management.md)`).

## Naming Conventions

- File names: kebab-case, no spaces, lowercase.
- Aggregate names: PascalCase as used in ubiquitous language.
- Domain event names: PascalCase, past tense (for example: `OrderPlaced`).
- Glossary terms: as used in spoken language by domain experts.

## Incremental Updates

- When adding a new bounded context, create a new file and update the index in `domain.md`.
- When modifying a bounded context, update only the affected file and adjust cross-references if needed.
- Always update the `last-updated` frontmatter field when modifying a file.
