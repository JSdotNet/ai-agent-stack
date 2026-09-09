# 3. One Authored Copy Per Asset

```meta
date: 2026-09-02
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/tech/hosts.md#copilot-plugin-api"]
```

An asset is written once and read by both hosts, relying on both ignoring keys they do not
know. The cost is paid in the authored file: the tool list carries both hosts' tool ids, a
model pin must be a value both accept, and anything one host ignores — `handoffs`, `applyTo` —
is restated in prose or by path.
