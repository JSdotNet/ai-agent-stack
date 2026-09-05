---
name: create-pull-request
description: "Open a pull request for the current branch — push it, derive title and body from the commits and the linked issue, apply the repository PR template, and set labels, reviewers, and issue links. Use when: opening a PR, raising a PR for a finished branch, or turning a draft PR ready for review."
---

# Create Pull Request

## Purpose

Turn a finished working branch into a reviewable pull request. The skill collects everything a
reviewer needs — a scoped title, a body grounded in the actual commits and diff, a linked issue,
and the right labels and reviewers — and creates the PR with `gh`.

## Inputs

- Base branch (default: the repository default branch from `gh repo view --json defaultBranchRef`).
- Draft or ready for review (default: `draft` when the branch has open TODOs or failing local
  checks, otherwise `ready`).
- Linked issue number (optional; inferred from the branch name or commit trailers).
- Reviewers and labels (optional).

## Hard Constraints

- Never push or create a PR without explicit user confirmation of the title, body, and base branch.
- Never force-push in this skill. History rewriting belongs to `update-pr-branch`.
- Never invent scope: the body describes only what the diff actually changes.
- Never commit secrets, `.env` files, or local settings — check the staged diff before pushing.

## Workflow

### Phase 1 — Assess Branch State

1. Capture the branch and working-tree state:

   ```bash
   git --no-pager branch --show-current
   git --no-pager status --short
   ```

2. If the branch is the default branch, stop and ask the user to create a feature branch first.
3. If there are uncommitted changes, list them and ask whether to commit them into the PR or
   leave them behind. Do not stash silently.
4. Check whether a PR already exists for this branch:

   ```bash
   gh pr view --json number,state,isDraft,url
   ```

   If one exists and is open, stop and report the URL — use `update-pr-branch` or
   `fix-pr-checks` instead. If it exists and is a draft the user wants to publish, skip to
   Phase 5.

### Phase 2 — Collect Change Context

5. Read the commits and diff that the PR would contain:

   ```bash
   git --no-pager fetch origin
   git --no-pager log origin/<base>..HEAD --oneline
   git --no-pager diff origin/<base>...HEAD --stat
   ```

6. Identify the linked issue, in this order:
   - An `owner/repo#123` or `#123` reference in a commit message or trailer.
   - A number embedded in the branch name (`feature/42-...`, `fix/37-...`).
   - Ask the user if neither is found and the repository convention requires one.

7. If the repository has a PR template, read it and follow its section structure:

   ```bash
   ls .github/pull_request_template.md .github/PULL_REQUEST_TEMPLATE/ 2>/dev/null
   ```

### Phase 3 — Draft Title and Body

8. Write the title as a single scoped sentence in the repository's existing style — check
   recent merged PR titles with `gh pr list --state merged --limit 10 --json title` and match
   the convention (Conventional Commits prefix, ticket prefix, or plain sentence).
9. Write the body from the template when one exists, otherwise from this structure:

   ```markdown
   ## Summary

   <what changed and why, 2-4 sentences grounded in the diff>

   ## Changes

   - <change per area, one line each>

   ## Validation

   - <build, test, or manual verification actually performed>

   Closes #<issue>
   ```

10. Use `Closes #<n>` only when merging the PR genuinely resolves the issue; otherwise use
    `Refs #<n>`.
11. Present the title, body, base branch, and draft/ready decision to the user and wait for
    confirmation.

### Phase 4 — Push the Branch

12. Push the branch and set upstream:

    ```bash
    git push --set-upstream origin <branch>
    ```

13. If the remote rejects the push because the branch diverged, stop and hand off to
    `update-pr-branch`.

### Phase 5 — Create the Pull Request

14. Create the PR:

    ```bash
    gh pr create --base <base> --head <branch> \
      --title "<title>" --body-file <body-file> \
      --draft
    ```

    Drop `--draft` when the PR is ready for review. Write the body to a temporary file rather
    than passing multi-line text inline.

15. Apply optional metadata when requested:

    ```bash
    gh pr edit <number> --add-label "<label>" --add-reviewer "<user-or-team>"
    ```

16. To publish an existing draft:

    ```bash
    gh pr ready <number>
    ```

### Phase 6 — Report

17. Output the PR number, URL, base, draft state, and linked issue.
18. Report the initial check status once CI has been triggered:

    ```bash
    gh pr checks <number>
    ```

    If checks are already failing, hand off to `fix-pr-checks`.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`.
With no surface bound, skip the calls, say so once, and continue — file artifacts remain
the source of truth.

- `start_run` with `skillId: "create-pull-request"` and these stages: Assess Branch State, Collect
  Change Context, Draft Title and Body, Push the Branch, Create the Pull Request,
  Report.

## Output

- An open pull request with a scoped title, a diff-grounded body, and the issue linked.
- PR number and URL.
- Initial CI check status.

## Related Skills

- `update-pr-branch` — bring the PR branch up to date with its base and resolve conflicts.
- `fix-pr-checks` — diagnose and fix failing PR checks.
- `pr-merge-ready` — score one pull request against the merge-ready checklist and clear its blockers, one PR per pass.
- `pr-remarks-review` (plugin: `review`) — work through reviewer comments.
- `flow-feature` / `flow-bug` — the flows that stop at Personal Validation, just
  before this skill takes over.

## Notes

- `gh` must be authenticated (`gh auth status`). GitHub MCP tooling is an acceptable substitute
  for every `gh` call here when configured.
- Draft is the safer default for long-running or exploratory branches: it keeps CI running
  without notifying reviewers.
- When the repository enforces a linear history, keep the branch rebased rather than merged so
  the PR stays mergeable — see `update-pr-branch`.
