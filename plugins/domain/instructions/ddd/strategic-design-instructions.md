---
applyTo: '**/*.md'
description: Guidelines for bounded context identification, context mapping, and subdomain analysis.
---

# Strategic Design Instructions

## Purpose

Guide bounded context discovery, subdomain identification, and context mapping decisions.

## Bounded Context Identification

Use these heuristics to identify bounded context boundaries:

1. **Language boundary.** When the same word means different things to different groups, a context boundary likely exists between them.
2. **Business capability boundary.** Each bounded context should align with a distinct business capability or subdomain.
3. **Team boundary.** Contexts should be ownable by a single team. If two teams need to change the same model independently, split the context.
4. **Data consistency boundary.** Data that must be immediately consistent belongs in the same context. Data that can be eventually consistent may span contexts.
5. **Change frequency boundary.** Parts of the domain that change at different rates are candidates for separate contexts.

## Context Boundary Validation

Before finalizing a bounded context, verify:

- [ ] The context has a single, clear purpose statement.
- [ ] The ubiquitous language within the context is consistent and unambiguous.
- [ ] No entity in this context requires direct access to another context's internal model.
- [ ] The context can be developed, deployed, and evolved independently.
- [ ] The context owner (team or individual) is identified.
- [ ] The context's deployment type is classified as **Service** (independently deployable process, e.g. a microservice) or **Module** (in-process module within a shared deployable, e.g. a modular monolith).

## Context Mapping Patterns

Use these relationship patterns when mapping interactions between bounded contexts:

| Pattern | Description | Use when |
|---------|-------------|----------|
| Shared Kernel | Two contexts share a subset of the model. Changes require agreement from both teams. | Closely collaborating teams with a stable shared concept. |
| Customer-Supplier | Upstream context serves downstream context. Downstream needs influence upstream priorities. | Clear producer-consumer relationship with negotiation power. |
| Conformist | Downstream context adopts the upstream model as-is without translation. | Upstream has no incentive to accommodate downstream needs. |
| Anti-Corruption Layer | Downstream context translates the upstream model into its own language. | Protecting domain model integrity from external or legacy systems. |
| Open Host Service | Upstream context provides a well-defined protocol for integration. | Multiple downstream consumers need standardized access. |
| Published Language | A shared, well-documented language used for integration between contexts. | Industry standards or shared data formats are available. |
| Separate Ways | No integration between contexts. Each solves its own problem independently. | Integration cost exceeds benefit. |
| Partnership | Two contexts evolve together with mutual coordination. | Co-dependent features that must release together. |

## Context Map Diagram

Produce context maps using Mermaid flowchart syntax. Use labels on edges to indicate the relationship pattern (text only — do not colour edges/lines). Colour-code each bounded context **node** by its deployment type per the Color Conventions below (see `instructions/diagrams/ddd-diagram-instructions.md` for the general exception this makes to the "no hard-coded hex colours" rule).

## Color Conventions

Colour distinguishes bounded context deployment type at a glance; it is applied to nodes only, never to edges/lines — relationship patterns stay identifiable from the edge label text alone. Define both classes once per diagram with `classDef`, then assign each bounded context node to a class with `class <nodeId> service` / `class <nodeId> module`.

| Deployment Type | Fill | Border | Font | Meaning |
| --- | --- | --- | --- | --- |
| Service | `#1168BD` | `#0B4884` | `#FFFFFF` | Independently deployable process (e.g. microservice) |
| Module | `#85BBF0` | `#5D82A8` | `#000000` | In-process module within a shared deployable (e.g. modular monolith) |

Example structure:

```mermaid
flowchart LR
    classDef service fill:#1168BD,stroke:#0B4884,color:#FFFFFF
    classDef module fill:#85BBF0,stroke:#5D82A8,color:#000000

    A[Order Management] -->|Customer-Supplier| B[Inventory]
    A -->|Anti-Corruption Layer| C[Payment Gateway]
    B -->|Published Language| D[Warehouse]

    class A,C service
    class B,D module
```

## Subdomain Analysis

For each subdomain, document:

1. **Name** — aligned with ubiquitous language.
2. **Type** — core, supporting, or generic.
3. **Purpose** — one-sentence description of what this subdomain does for the business.
4. **Key domain concepts** — the most important entities, events, and rules.
5. **Bounded contexts** — which contexts implement this subdomain.
