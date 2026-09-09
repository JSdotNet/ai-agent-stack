# 16. A Surface Declares Only the Contract's Tool Names

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/15-three-surfaces-one-contract.md", ".devbook/domain/plugin-authoring/domain.md#surface"]
```

Each surface exposes exactly the tool names its capability groups name, and nothing else. The
ported dashboard lost two tools in the move — `get_view` and `pop_view`, which the rendered
page used to read and rewind a viewer — and the page reaches the same state over the server's
own HTTP origin instead.

An extra tool is not free the way an extra function is. It is one more name in the live tool
list, one more thing a caller can come to depend on, and the first thing that makes one
implementation not substitutable for another: a run that calls `pop_view` works on the
dashboard and fails on the canvas, and nothing in the contract said it would.

The same rule reaches into the run schema, in two renames the port made:

- `githubIssue` became `workItem`, and the stage the report hides when it is absent matches
  `Work Item Update` rather than `GitHub Issue Update`. A surface that only knows GitHub
  cannot show a run tracked in Jira or in Markdown chapters, which is exactly what
  [a tracker being a binding](13-a-tracker-is-a-binding-not-a-phase-name.md) means.
- `approval.personalValidation` became `approval.state`. Personal Validation is one instance
  of the gate mechanism, and a surface whose schema names it cannot record the decision of any
  other gate a repository adds.

Consequence: a run file written by the predecessor dashboard does not read correctly here — the
work item and the approval decision land in fields nothing looks at. Nothing migrates them,
because the new plugins keep their own state directories and no run has been written to one
yet. That is the one moment these renames are free.
