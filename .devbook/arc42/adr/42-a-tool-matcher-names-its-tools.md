# 42. A Tool Matcher Names Its Tools

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/41-a-session-start-hook-fires-only-where-the-repository-adopted-the-plugin.md", ".devbook/arc42/adr/15-three-surfaces-one-contract.md"]
```

`delivery-surface-dashboard` collects tool telemetry through `PreToolUse`/`PostToolUse`, and a
`"*"` matcher there is one process spawn per tool call, in every session the plugin is enabled
in, whether or not a run is active. The guards above do not reach it: the run-active check
happens inside the process, after it has already started.

The matcher now names shell, edits, `Artifact`, sub-agents, skills, and every MCP tool
including QA, and drops the read-only ones — `Read`, `Grep`, `Glob`, `WebFetch`, `WebSearch`,
`TodoWrite`. Those are the bulk of a session's calls and the least of its time.

Consequence: `categorizeTool`'s "Read" bucket no longer appears in a run's time-by-tool
breakdown, and the context gauge samples on matched calls only. A panel that needs a new tool
needs it in the matcher too — a dropped tool reaches none of the hook's code.
