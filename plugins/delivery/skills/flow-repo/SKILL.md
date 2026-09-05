---
name: flow-repo
description: 'Run GitHub repository creation and configuration for a new project. Use this skill to create the repository, expand the README, write repository instructions, set up MCP servers, configure branch protection, add issue and PR templates, and establish repository governance. Run flow-project after this skill to scaffold the development project.'
---

# Flow: Repository Creation

Repository-level setup only: create the repo, configure it, establish its governance. The
development project structure inside it belongs to `flow-project`, run next — everything
under `.github/instructions/`, the CI workflows, the AppHost and service scaffolding, the
`src/`/`tests/` layout, and the build and run validation are its work, not this one's.

Agent transitions follow `instructions/flow-phases.instructions.md`; per-stage model choice
follows `instructions/flow-model-selection.instructions.md`.

## Input Expectations

- Repository name, description, and visibility.
- Primary language and framework, for the topic tags.
- Branch protection rules — default branch, required reviewers, status checks.
- MCP servers to enable.
- Collaborators or teams to add.

## Stage 1: Repository Creation *(manual)*

Run this one yourself; the rest are agent-assisted.

```bash
gh repo create <org>/<name> --description "<description>" --private --clone
```

- Set the default branch and initialize with a `README.md`.
- Add the topics, the `.gitignore` for the target stack, and a license where one applies.

## Stage 2: README

- Expand `README.md` with the project description, architecture overview, setup steps, and
  contribution guide.

**Agents:** `documentation:profile` *(preferred)*

## Stage 3: MCP Configuration

- Query `jsdotnet-guidelines-mcpserver` for the recommended server selection for this project
  type.
- Configure the servers in `.github/github-app.yml`, with their permissions and scopes: the
  core three are `jsdotnet-guidelines-mcpserver`, `microsoft-learn`, and `playwright`; add
  `jsdotnet-design-mcpserver` when the repository expects UX design flows.

**MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 4: Repository Instructions

- Query `jsdotnet-guidelines-mcpserver` for the coding standards and agent guidance for this
  project type.
- Create the repository agent instructions file bound to the `repo-instructions` slot: tech
  stack, conventions, key patterns, agent guidance.
- Add the repo-level instruction files under `.github/instructions/` with `spec-builder`'s
  `create-instruction` skill when it is installed.

**MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 5: Branch Protection

- Protect the default branch: reviews before merge, status checks passing, branches up to
  date, pushes restricted.
- Configure the merge strategies, and auto-delete of head branches after merge.

**Tools:** `gh api`

## Stage 6: Issue and PR Templates

- Query `jsdotnet-guidelines-mcpserver` for the template structures and label conventions.
- Create the issue templates and the PR template with its checklist.
- Add `CODEOWNERS` to assign default reviewers per path, and configure the repository labels.

**MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 7: Repository Governance *(optional)*

- Configure Dependabot for dependency updates and security alerts.
- Enable secret scanning and CodeQL code scanning.
- Set up rulesets for governance beyond branch protection.
- Invite the collaborators or teams at the right permission level, and add a `SECURITY.md`.

## Final Phases (Shared)

Documentation/config tier of `instructions/flow-phases.instructions.md`, in order: Personal
Validation → Create Pull Request → Work Item Update → Summary. That file defines them; change
them there, for every flow.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`. With no
surface bound, skip the calls, say so once, and continue — file artifacts remain the source
of truth.

- `start_run` with `skillId: "flow-repo"` and stages: Repository Creation, README, MCP
  Configuration, Repository Instructions, Branch Protection, Issue and PR Templates,
  Repository Governance, Personal Validation, Create Pull Request, Work Item Update, Summary.
- During README, open/update `render_markdown` with the expanded README.
