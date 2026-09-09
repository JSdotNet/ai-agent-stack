# 10. One Config File, Two Kinds of Key

```meta
date: 2026-09-03
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/domain/plugin-authoring/domain.md#stamp"]
```

`.devbook/config.json` carries both the engine's four keys — `bindings`, `extensions`,
`policy`, `gates` — and every component's `components.<name>` entry, in one committed file that
nobody but the owner writes into.

The alternative was a second file for the engine. One file wins because the two halves are read
by the same people at the same moment: whoever decides which folders devbook adopts is
deciding, in the same sitting, which tracker the flows post to. Two files would also give the
repository two places to disagree with itself about what is installed.

`policy` keys are closed enums or numbers with documented defaults, so an absent key means the
engine's own choice rather than undefined, and an unknown key is rejected by name rather than
ignored — the same discipline `claude plugin validate --strict` applies to a manifest, which is
what makes the file safe to hand-edit. `pr.base` is the single exception to the closed-enum
rule and is validated as a git ref instead.

Consequence: two components can conflict on the file itself when both write it in one session.
Each writes only its own key, so the conflict is textual rather than semantic, but nothing
enforces that yet beyond the rule being written down.
