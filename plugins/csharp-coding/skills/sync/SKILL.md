---
name: sync
description: 'Rebase the current session worktree branch onto the latest `main`, resolve integration conflicts, and validate with compile and unit tests.'
---

# Sync

Rebase the current session branch onto `main` and validate the branch before continuing work.

## Inputs

- Source branch: `main`.

## Workflow

1. Confirm current branch and repository state:
   ```bash
   git --no-pager branch --show-current
   git --no-pager status --short
   ```
2. If there are local uncommitted changes, stop and ask the user to commit or stash first.
3. Fetch latest `main` from origin:
   ```bash
   git --no-pager fetch origin main
   ```
4. Check whether current branch is behind:
   ```bash
   git --no-pager log HEAD..origin/main --oneline
   ```
5. If there are no incoming commits, report that the branch is already up to date.
6. Rebase current branch onto `origin/main`:
   ```bash
   git --no-pager rebase origin/main
   ```
7. If conflicts occur:
   - List conflicted files:
     ```bash
     git --no-pager diff --name-only --diff-filter=U
     ```
   - Resolve conflicts in each file, then stage resolved files:
     ```bash
     git --no-pager add <resolved-file>
     ```
   - Continue until rebase completes:
     ```bash
     git --no-pager rebase --continue
     ```
   - If resolution is not possible, abort and report:
     ```bash
     git --no-pager rebase --abort
     ```
8. Validate after upstream integration:
   ```bash
   dotnet restore
   dotnet build
   dotnet test
   ```
9. If compile or tests fail, report failing project/test output and keep the branch unresolved until fixed.

## Output

- Updated branch head (or already up to date).
- Rebase result and conflict-resolution summary when applicable.
- Compile and unit-test validation result.

## Notes

- This skill updates only the current session/worktree branch.
- This skill does not push changes to remote.
