# Delivery

```meta
type: flow
related: [".devbook/domain/delivery/skills.md#flow-repo", ".devbook/domain/delivery/flow.md"]
```

> `flow-repo` — creating and governing a repository, before there is a project in it. What the
> skill does is in [skills.md](skills.md#flow-repo); the shared spine every flow runs is in
> [flow.md](flow.md).

## flow-repo

```mermaid
flowchart TD
    base["Update Base"]
    s0["Repository Creation (Manual)"]
    s1["README"]
    s2["MCP Configuration"]
    s3["Repository Instructions"]
    s4["Branch Protection"]
    s5["Issue and PR Templates"]
    s6["Repository Governance"]
    c0["Personal Validation"]

    base --> s0
    s0 --> s1
    s1 --> s2
    s2 --> s3
    s3 --> s4
    s4 --> s5
    s5 --> s6
    s6 --> c0
    c0 --> g{"approve, revise, or decline"}
    t0["Create Pull Request"]
    t1["Work Item Update"]
    t2["Summary"]
    g -->|approve| t0
    t0 --> t1
    t1 --> t2
    g -->|revise| s0
    g -->|decline| blocked(["Blocked"])
```

It closes through the documentation tier. Every tier opens with Update Base, prepended by the
runner and named by no skill.

- **The first stage is a person.** Creating the repository is manual by design; everything after it
  is configuration this flow can own, and the split is where the flow's authority actually starts.
- It closes through the documentation tier because it produces no runnable change — governance,
  instructions, and templates are files, and there is nothing to build or validate.
- Run it before [flow-project](flow.flow-project.md). The order is the whole relationship between
  the two.

The roles and MCP servers each stage resolves are in the engine's own `FLOW-DIAGRAMS.md`, which
is where a binding table belongs — this chapter is the model, not the wiring.
