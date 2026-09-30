# Weekly retro report

The frame and its rules are `../../resources/report-contract.md`. Follow this shape exactly.

```markdown
## Weekly retro · <owner/repo> · <YYYY-MM-DD>

**<Verdict: ran or stopped, and why — the window that stopped it, or how many recommendations landed.>**

| Window | Used | Resets |
| --- | --- | --- |
| <weekly all models, the reviewer's weekly window, the short rolling window> | <n>% | <ISO datetime UTC> |

| Reviewer model | From | Window | Pull requests | Surface runs | Sessions |
| --- | --- | --- | --- | --- | --- |

### Needs you
| What | Where | Do |
| --- | --- | --- |
| Keep or drop each recommendation | [#<n>](<url>) | [commits](<url>/commits) |

### For you
| Habit or setting | Evidence |
| --- | --- |

### Run
| Outcome | What | Why |
| --- | --- | --- |

*`schedule-weekly-retro@<version>` · <since>..<now> · <ISO datetime UTC>*
```

A run the gate stops is the heading, the verdict, the window table, and *Run*. The
recommendation ledger lives in the pull request body; the report links it and does not repeat it.
