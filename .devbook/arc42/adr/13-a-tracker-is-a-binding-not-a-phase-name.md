# 13. A Tracker Is a Binding, Not a Phase Name

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#tracker"]
```

The closing phase that reports a finished run to the work item is **Work Item Update**, not
GitHub Issue Update. The ported skills named GitHub in the phase itself, in the stage list every
one of them passes to `start_run`, and in their prose.

A phase that names one implementation cannot be bound to another. `bindings["delivery.tracker"]`
is the whole point: GitHub issues, Jira tickets, and Markdown chapters are three
implementations of `find_item`, `read_item`, `create_item`, `comment`, `transition`, and
`link_change`, and a repository that plans work as Markdown has been doing the third all along.

Consequence: the stage name changed in 32 skills at once, so a run resumed from state written
before this release finds a stage name that no longer matches. Nothing resumes across it,
because nothing has run yet — which is the one moment this rename is free.

The same rule reaches a skill's own id, and the two pickup skills were the last place it had
not: `azure-sre-to-github-issue` became `sre-alerts-to-work-items` in `delivery` 2.4.0, and
both it and `start-session-from-issue` now name the tracker operations rather than calling `gh`.
Azure stays in the one name because it is the alert source, which is bound separately from the
tracker the item lands in. An id is visible identity, so renaming one is not free the way a
stage name was — but nothing referenced it beyond this repository's own README and devbook, and
carrying a provider in the identity of a skill the binding exists to keep neutral costs more
than the rename.
