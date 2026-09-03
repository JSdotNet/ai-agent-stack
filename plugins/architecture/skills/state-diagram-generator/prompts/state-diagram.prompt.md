---
name: state-diagram
description: Prompt for generating a Mermaid state machine diagram for an entity lifecycle or protocol.
---

# State Diagram Prompt

## Purpose

Produce a Mermaid `stateDiagram-v2` that models the lifecycle of a single stateful entity, domain aggregate, or protocol object.

## Pre-Draft Checklist

Confirm the following before generating the diagram:

1. What is the entity or protocol being modelled? (e.g., `Order`, `PaymentTransaction`, `CircuitBreaker`)
2. What are all the possible states?
3. What events or commands trigger each transition?
4. Are there guard conditions on any transitions? (e.g., `[retries exhausted]`)
5. Are there entry, exit, or transition actions that are architecturally relevant?
6. Are there composite or concurrent sub-states?
7. What is the initial state? Are there one or more terminal states?

## Mermaid Template

```mermaid
stateDiagram-v2
  %% State machine: {Entity / Protocol Name}
  [*] --> {InitialState}

  {InitialState} --> {NextState}: {event}
  {NextState} --> {HappyState}: {event} [{guard}] / {action}
  {NextState} --> {FailState}: {errorEvent}

  state {CompositeState} {
    [*] --> {SubState1}
    {SubState1} --> {SubState2}: {event}
    {SubState2} --> [*]
  }

  {HappyState} --> [*]
  {FailState} --> {InitialState}: {recoveryEvent}
```

## Guidance

- Name states with PascalCase noun phrases using the ubiquitous language (e.g., `PaymentAuthorised`, not `STATE_2`).
- Label every transition with the domain event or command that triggers it.
- Add guard conditions in `[square brackets]` when the same event can lead to different target states.
- Add actions after a `/` only when they are architecturally significant (e.g., `/ emitEvent`, `/ notifyObserver`).
- Use composite states (`state Name { }`) for nested lifecycles rather than duplicating transitions.
- Use `<<fork>>` / `<<join>>` stereotypes for concurrent regions.
- Limit to 10–15 states; split into sub-machines if the state space is larger.

## Output Requirements

- One `stateDiagram-v2` fenced `mermaid` code block with a `%% State machine:` comment header.
- Initial (`[*]`) and terminal states explicit.
- All transitions labelled; guards and actions added where relevant.
- Domain language used for all state and event names.
- Composite states used for nested lifecycles.
- Prose summary (2–4 sentences) explaining the lifecycle, key guards, and side effects.
- Traceability link to arc42 Section 6 (scenario-specific) or Section 8 (crosscutting pattern).
- Cross-reference to the domain model or aggregate definition.
- List of assumptions for any state or transition not confirmed by the user.
