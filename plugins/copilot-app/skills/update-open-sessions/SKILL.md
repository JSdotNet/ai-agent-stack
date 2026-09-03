---
name: update-open-sessions
description: >
  Rebase or merge all open Copilot sessions onto the latest source branch.
  Use when: syncing open feature branches before review, pulling in upstream fixes,
  keeping worktrees up to date, preparing sessions for PR submission.
---

# Update Open Sessions

## Purpose

Fetch the latest commits from the source branch and apply them to every open
Copilot session branch, keeping all in-progress work in sync with the trunk.

## Inputs

- Source branch to update from (default: repository default branch, usually `main` or `master`).
- Update strategy: `rebase` (default) or `merge`.
- Sessions to update: `all` (default) or a specific list of session branch names.
- Conflict behaviour: `skip` (default — leave conflicted sessions untouched and report them)
  or `abort` (roll back the update for any session with conflicts).

## Workflow

### Phase 1 — Discover Open Sessions

1. List all git worktrees to discover open session branches:
   ```bash
   git --no-pager worktree list
   ```
2. Identify the source branch HEAD:
   ```bash
   git --no-pager log <source-branch> -1 --oneline
   ```
3. For each worktree, check whether the source branch has new commits since the
   session branched off:
   ```bash
   git --no-pager log <session-branch>..<source-branch> --oneline
   ```
4. Present the status table to the user and ask for confirmation before proceeding:

| Session | Branch | Behind by | Action |
|---------|--------|-----------|--------|
| `<name>` | `feature/x` | 3 commits | Will rebase |
| `<name>` | `feature/y` | 0 commits | Up to date — skip |

### Phase 2 — Update Each Session

5. For each session that is behind (in order):
   a. Change into the worktree directory.
   b. Fetch the latest source branch:
      ```bash
      git fetch origin <source-branch>
      ```
   c. Apply the chosen update strategy:

   **Rebase:**
   ```bash
   git rebase origin/<source-branch>
   ```

   **Merge:**
   ```bash
   git merge --no-edit origin/<source-branch>
   ```

   d. If the operation exits with conflicts:
      - If strategy is `skip`: run `git rebase --abort` or `git merge --abort`,
        mark session as **Conflict — skipped**, and continue to the next session.
      - If strategy is `abort`: roll back all changes made so far and stop.

6. After a successful update, record the new HEAD for the session.

### Phase 3 — Summary

7. Output a final summary table:

| Session | Branch | Result | New HEAD |
|---------|--------|--------|----------|
| `<name>` | `feature/x` | ✅ Updated | `abc1234` |
| `<name>` | `feature/y` | ⏭ Already up to date | `def5678` |
| `<name>` | `feature/z` | ⚠️ Conflict — skipped | — |

8. For any session marked **Conflict — skipped**:
   - List the conflicting files.
   - Suggest the user open that session and resolve conflicts manually before
     re-running this automation.

## Output

- All sessions behind the source branch are updated (rebased or merged).
- Summary table with result per session.
- Conflict report with file list for any sessions that could not be updated.

## Notes

- This is worktree maintenance, not a flow. It reports through chat and opens no run: the
  three phases above take seconds, and a run timeline would outlive the work it describes.
- This automation only modifies local worktree branches; it does not push to remote.
  Push manually or via the session's normal PR workflow after reviewing the update.
- Run this automation before submitting PRs to reduce merge conflicts at review time.
- If worktrees are managed by the Copilot app rather than plain git, use the app's
  session management tools to list sessions and update branches instead of raw git commands.
