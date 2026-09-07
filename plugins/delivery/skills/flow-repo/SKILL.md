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

**Agents:** the `docs` role *(preferred)*

## Stage 3: MCP Configuration

- Decide the MCP servers this repository will use, by project type: a standards or
  guidelines server where the team runs one, `microsoft-learn` for a .NET stack, `aspire` and
  `playwright` for a runnable application, a design server when UX design flows are expected.
- Declare each server in the repository's own MCP configuration — `.mcp.json` for Claude
  Code, `.github/github-app.yml` for Copilot — with its permissions and scopes.
- Bind each server to the extension points that use it under `bindings["delivery.mcp"]` in
  `.github/ai-agent-stack.json`, creating the file with that key alone when it does not exist
  yet (`flow-project` fills the rest), and validate it with `node tools/stack-config/check.mjs`.
  A point left out takes the engine default — **MCP Server
  Strategy** in `instructions/flow-execution-model.instructions.md`.

## Stage 4: Repository Instructions

- Retrieve the coding standards and agent guidance for this project type from the MCP
  servers bound to `spec`, or derive them from the project type when none is bound.
- Create the repository agent instructions file bound to the `repo-instructions` slot: tech
  stack, conventions, key patterns, agent guidance.
- Add the repo-level instruction files under `.github/instructions/`, using an
  asset-authoring skill when one is installed.

## Stage 5: Branch Protection

- Protect the default branch: reviews before merge, status checks passing, branches up to
  date, pushes restricted.
- Configure the merge strategies, and auto-delete of head branches after merge.

**Tools:** `gh api`

## Stage 6: Issue and PR Templates

- Retrieve the template structures and label conventions from the MCP servers bound to
  `spec`, or use the host's defaults when none is bound.
- Create the issue templates and the PR template with its checklist.
- Add `CODEOWNERS` to assign default reviewers per path, and configure the repository labels.

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
