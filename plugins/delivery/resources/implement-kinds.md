---
name: implement-kinds
description: What phase-implement does inside one slice for each flow-code kind — feature, create, refactor, defect, config, dependency, project — including the dependency move and the project bootstrap and scaffold that were flows of their own.
---

# Implement, by Kind

The kind is the one `phase-scope` persisted. It changes what happens inside a slice, never
which phases run. Test-first follows `tdd-rules.md` wherever a seam exists.

- **feature** — tests first at each backend seam, then the code; frontend, backend or both, a frontend slice with no test-first seams.
- **create** — the unit `phase-plan` laid out, slice by slice in its order.
- **refactor** — the moves and reference updates scope listed, behaviour held still: the
  existing tests are the seams and stay green; a new test only where scope recorded one.
- **defect** — the reproducing test first, red; then the fix, green.
- **config** — tooling, CI, scripts, documentation outside the devbook: the change, unsplit.
  A test only where the change has a testable seam, such as a script's own tests.

## dependency

Unsplit. A routine update is patch, minor or security; a framework upgrade is a major version
of what the application is built on, and adds the baseline check and feature adoption.

1. **Analyse.** Every dependency with an available update, every CVE and advisory, and the
   breaking changes from the release notes. For a framework upgrade, inventory the packages,
   the SDK constraints and host integrations such as the AppHost, and the success criteria.
2. **Baseline check** *(framework upgrade).* Build, tests and runtime health before any
   change. Red items are recorded as pre-existing, then fixed in this run or excluded with the
   user's agreement — never upgraded over unrecorded, never a reason to decline.
3. **Update in batches**, security first, then low risk upward, each reversible on its own,
   through each ecosystem's manager: `dotnet` and `Directory.Packages.props` or the `.csproj`
   for NuGet and the SDK, the package manager for npm. A major version is raised with the user
   before it is taken. For a framework upgrade, the host integrations and the references that
   follow them, and the breaking changes in configuration and wiring. Confirm the lockfiles and
   the resolved tree, and run the inner loop after each batch.
4. **Security scan.** The SAST scan, the updated packages against current advisories, and the
   tree for transitive vulnerabilities. Record any exception to policy.
5. **Adopt features** *(framework upgrade).* The capabilities scope chose, configured in the
   host and the services, with the telemetry and health setup they need.

Record the depth, the batches, anything deferred, and the adopted features in `implement.md`,
so `phase-verify` runs startup-only, or smoke checks for a framework upgrade. A maintenance
policy or an architecture change is a decision: return `revise: phase-scope`.

## project

Unsplit. Creating the repository itself stays manual and precedes the run. Each step opens by
checking what is there; a step whose outcome is present is recorded and skipped.

1. **Stack setup.** `devbook-config:init`, or `:update` where the config exists, and the `run`
   recipe with its setup, command, entry points and readiness signals — or
   `phase-verify.app` set to `null` where nothing runs.
2. **README and instructions.** The README's description, architecture, setup and
   contribution guide; the repository's own guidance outside every component's managed section.
3. **Governance**, through the `pr-lane` slot: branch protection, merge settings, issue and PR
   templates, `CODEOWNERS`, labels. Unbound, written as file artifacts and reported as manual.
4. **CI workflows**: build and test on pull requests and pushes, release and dependency review
   where they apply, each with least-privilege token scopes.
5. **Tooling**: the base frameworks and SDKs, build, test, lint, logging and observability.
6. **Scaffold.** The AppHost with service discovery, health checks and the dashboard; the
   layout; an example service wired to it; the test framework with its first tests, test-first
   at the example service's seams.
