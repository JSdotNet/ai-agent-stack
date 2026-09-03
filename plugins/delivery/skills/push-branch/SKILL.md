---
name: push-branch
description: "Push the current branch to its remote and stop there — no pull request. Use when: pushing a branch, publishing local commits, setting the upstream for a new branch, or getting commits onto the remote so CI runs."
---

# Push Branch

## Purpose

Get the current branch and its commits onto the remote, and nothing more. This is the
lightweight alternative to `create-pull-request` for when the branch just needs to exist
on the remote — to back up work, to trigger CI, or because a pull request already exists
and only needs the new commits.

## Inputs

- None required. Everything is read from the repository.
- Optional: the remote name (default: `origin`).

## Hard Constraints

- Never create, update, or publish a pull request. That is `create-pull-request`.
- Never force-push. If the remote has diverged, stop and hand off to `update-pr-branch`.
- Never commit, amend, stash, or rebase on the user's behalf without being asked.
- Never push secrets, `.env` files, or local settings — inspect the outgoing diff first.
- Never push to the default branch without explicit user confirmation.

## Workflow

### 1 — Check the branch

Read the current branch and working-tree state:

```bash
git --no-pager branch --show-current
git --no-pager status --short --branch
```

- If the branch is the repository default branch (`main`, `master`), say so and ask for
  confirmation before pushing.
- If there are uncommitted or untracked changes, list them and report that they will stay
  local. Ask whether to commit them first only if the user's intent looks like "push my
  work".
- If there is nothing to push (no commits ahead, upstream already current), report that and
  stop.

### 2 — Review what goes out

List the commits and files that the push will publish:

```bash
git --no-pager log @{upstream}..HEAD --oneline
git --no-pager diff @{upstream}..HEAD --stat
```

For a branch with no upstream yet, compare against the default branch instead:

```bash
git --no-pager log origin/<default>..HEAD --oneline
git --no-pager diff origin/<default>...HEAD --stat
```

Scan the file list for anything that should not leave the machine (credentials, `.env`,
local settings). Stop and report if something looks wrong.

### 3 — Push

For a branch that already has an upstream:

```bash
git push
```

For a branch being published for the first time:

```bash
git push --set-upstream origin <branch>
```

### 4 — Handle a rejected push

If the remote rejects the push because the branch diverged, do not force-push. Report the
rejection and hand off to `update-pr-branch` to integrate the base branch first.

If the push fails on authentication, report the error and the remote URL so the user can
fix their credentials.

### 5 — Report

State the branch, the remote and upstream it now tracks, and the commits pushed. If an open
pull request already exists for this branch, report its URL and check status so the user can
see the effect of the push:

```bash
gh pr view --json number,url,state 2>/dev/null
gh pr checks 2>/dev/null
```

Skip this step when `gh` is unavailable or unauthenticated — it is informational only.

## Output

- The branch pushed, its remote tracking reference, and the list of commits now on the
  remote.
- Any local changes deliberately left behind.
- The existing pull request URL and check status, when there is one.

## Related Skills

- `create-pull-request` — push and open a reviewable pull request with a diff-grounded body.
- `update-pr-branch` — integrate the base branch and resolve conflicts after a rejected push.
- `fix-pr-checks` — diagnose and fix checks that go red after the push.

## Notes

- `gh` is optional here; every required step uses `git` alone.
- This skill reports through normal chat and does not use the bound delivery surface —
  a single push does not warrant a run.
