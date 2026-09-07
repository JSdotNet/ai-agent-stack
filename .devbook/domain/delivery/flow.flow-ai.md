# Delivery

```meta
type: flow
related: [".devbook/domain/delivery/skills.md#flow-ai", ".devbook/domain/delivery/flow.md"]
```

> `flow-ai` — how the team works with AI, recorded stage by stage. What the skill does is in
> [skills.md](skills.md#flow-ai); the shared spine every flow runs is in [flow.md](flow.md).

## flow-ai

```mermaid
flowchart TD
    base["Update Base"]
    s0["Context Loading"]
    s1["Placement & Boundary Check"]
    s2["Authoring"]
    c0["Personal Validation"]

    base --> s0
    s0 --> s1
    s1 --> s2
    s2 --> c0
    c0 --> g{"approve, revise, or decline"}
    t0["Create Pull Request"]
    t1["Check & Review"]
    t2["Work Item Update"]
    t3["Summary"]
    g -->|approve| t0
    t0 --> t1
    t1 --> t2
    t2 --> t3
    g -->|revise| s0
    g -->|decline| blocked(["Blocked"])
```

It closes through the documentation tier. Every tier opens with Update Base, prepended by the
runner and named by no skill.

- **Placement & Boundary Check exists because this folder records a way of working and never
  instructs one.** A sentence telling somebody how to work belongs in a rule; this folder says what
  is actually done, and the check is what keeps the two apart.
- The derivable half — which plugins are installed, which flows the copies on disk ship, what the
  config wires — is reported by a read-only skill elsewhere. What this flow writes is the half no
  file on disk records.
- An adoption rating is never derived from an install. Something being present is not evidence that
  anyone uses it.

The roles and MCP servers each stage resolves are in the engine's own `FLOW-DIAGRAMS.md`, which
is where a binding table belongs — this chapter is the model, not the wiring.
