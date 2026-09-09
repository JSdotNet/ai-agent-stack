# 9. The Point Set Is Closed

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#extension-point", ".devbook/arc42/05-building-block-view.md#stack-config"]
```

`delivery` declares eleven extension points and a repository fills them. It never adds one, and
it never defines a stage.

The line is that configuration chooses among behaviour the engine already implements. A stage
is a prompt, not a program — "apply TDD", "escalate instead of continuing when the request
needs a new architectural decision" — so encoding one as JSON either drops the prose, which
makes the stage useless, or buries paragraphs in strings, which is a worse Markdown file with
no diff readability and nowhere to say why. A per-repository stage DSL would also re-create,
once per repository, exactly the drift that merging 27 duplicated skills into one engine just
removed.

The escape hatch is already there and is better: a repository that genuinely needs a different
shape writes a repo-native `flow-*` skill, which takes precedence for the categories it covers
and can still reuse `phase-*` and the service contracts.

Consequence: a repository whose need is not expressible as a provider, a gate, or a policy
switch has to write a skill, not file a feature request for a config key. If that turns out to
be common, the answer is a new point in the closed set — added here, deliberately — never an
open one.
