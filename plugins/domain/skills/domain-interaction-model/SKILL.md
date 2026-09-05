---
name: domain-interaction-model
description: 'Model interactions between bounded contexts — integration events, anti-corruption layers, shared kernels, published language, and communication patterns.'
---

# Domain Interaction Model

Use this skill to design and document how bounded contexts interact with each other.

## Trigger Conditions

Use when the user needs to define integration contracts, design event flows between contexts, or specify anti-corruption layer mappings.

## Inputs

- Context map with labelled relationships (from `context-mapping` skill).
- Bounded context files with aggregate and event definitions.
- Communication requirements (synchronous, asynchronous, event-driven).

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md` and `instructions/ddd/strategic-design-instructions.md`.
2. For each relationship on the context map, design the interaction:
   - **Shared Kernel** — document the shared model subset, ownership rules, and change protocol.
   - **Customer-Supplier** — define the upstream API contract, downstream expectations, and negotiation process.
   - **Anti-Corruption Layer** — specify translation mappings between upstream and downstream models. Document which terms change meaning and how values are transformed.
   - **Published Language** — define the shared schema or contract format, versioning strategy, and evolution rules.
   - **Open Host Service** — specify the protocol, endpoints or event channels, and consumer registration process.
   - **Conformist** — document what is accepted as-is from upstream and any limitations this creates.
3. For each integration point, specify:
   - **Direction** — inbound or outbound relative to the context.
   - **Mechanism** — integration event, command, query, or shared data store.
   - **Communication pattern** — synchronous (request-response), asynchronous (fire-and-forget), or event-driven (publish-subscribe).
   - **Data contract** — what data crosses the boundary and in what shape.
   - **Failure handling** — what happens when the interaction fails (retry, compensating action, circuit breaker).
4. Produce interaction diagrams using Mermaid sequence or flowchart syntax. Use skill `domain-interaction-diagram` for detailed diagram generation.
5. Update bounded context files with integration contracts following `instructions/output/domain-documentation-structure-instructions.md`.

## Output

- Updated bounded context files with Integration Contracts sections.
- Interaction diagrams (Mermaid) produced by skill `domain-interaction-diagram`.
- Anti-corruption layer mapping tables where applicable.
