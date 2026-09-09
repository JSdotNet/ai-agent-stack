# 40. The Overlay May Add a Gate and Never Remove One

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/10-one-config-file-two-kinds-of-key.md", ".devbook/arc42/adr/11-the-stack-config-lives-in-devbook.md", ".devbook/arc42/adr/30-the-handback-is-the-commit-point.md"]
```

`.devbook/config.local.json` is a gitignored overlay over the four engine keys, merged over
`.devbook/config.json`. It exists because the committed file had no way to say *on this
machine*: running QA shallower than the team does meant editing the shared file and
remembering not to commit it, which turns a personal preference into everyone's next merge
conflict.

The merge is ordinary — objects key by key with the overlay winning, arrays replaced whole
because a chore list is an ordered whole — with one deliberate exception. **`gates` appends.**
The overlay can add a checkpoint and has no syntax for removing one, so the invariant that
[configuration may add a gate anywhere and never take one away](10-one-config-file-two-kinds-of-key.md)
survives a file that no reviewer will ever see.

Three keys are refused by name for the same reason: `policy.pr.required`,
`policy.qa.ceiling`, and `policy.gate.personalValidation`. The line between them and the rest
is whether the key describes what this repository *produces* or how one machine *runs*. QA
depth, role bindings, MCP servers, and budgets are the second kind and are yours. A ceiling is
the repository's limit and depth is your choice inside it, which is why one is locked and its
neighbour is not. `components` is refused outright: a stamp is repo-scope, and an overlay is
the one file that is not.

Stating it as a property rather than a list: **a gitignored file may not weaken what a
reviewer sees.** Everything a reader of the committed config concludes about the gates a run
passes, the pull request it opens, and the deepest QA it may reach stays true whatever any
overlay says.

The alternative was to trust the overlay completely, on the grounds that anyone who can write
it can also edit the committed file. That argument fails on visibility rather than on
capability: editing the committed file shows up in review, and this file never does.

Consequence: `check.mjs` validates three times over — the overlay's refusals, the overlay
alone, and the merged result, the last catching the pair that is only wrong together — and
devbook renders a `.gitignore` block so the overlay is genuinely ignored in every adopting
repository rather than in the ones that remembered.
