# 31. Every Run Opens With Update Base

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/9-the-point-set-is-closed.md", ".devbook/domain/plugin-authoring/domain.md#flow-skill"]
```

Every flow opens with an **Update Base** phase that fetches the base branch and brings the
working branch onto it, and the `flow-runner` prepends that phase to the stage list rather than
any `flow-*/SKILL.md` naming it.

The problem it fixes is that a worktree is cut from the local checkout, never from the remote. A
branch created while the local default branch is three commits behind starts three commits
behind, and nothing downstream notices: the build is green, QA passes, and the pull request is
the first thing to say the branch is stale — after the whole run has been paid for.

Prepending it is the one place the engine names a phase a skill does not, and the asymmetry is
deliberate. The closing tier differs per skill — code-modifying flows run seven phases,
documentation/config flows four — so a skill has to say which it runs. The opening phase is
identical for every flow, a bridge plugin's included, so naming it per skill would be twenty
copies of one sentence and twenty places to drift, in the file whose stated purpose is that a
maintainer edits a phase once.

Rebase rather than merge, and only while the branch is still private. Until it is pushed for
review, rewriting its history is free and keeps it linear; once a reviewer is reading it the same
rewrite detaches their comments, which is why the phase skips a branch that already has an open
pull request and names `update-pr-branch` instead. A conflict blocks the phase rather than being
resolved inline, because that is separate work with its own scope.

Consequence: the phase can honestly do nothing. A dirty tree, an open pull request, or no remote
each mark it `skipped`, so a run can still start stale and only the stage output says so. It
never stashes to get past a dirty tree — the stash stack is shared by every worktree of the
repository, and another session can pop what this one pushed.
