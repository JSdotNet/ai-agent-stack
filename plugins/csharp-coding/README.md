# csharp-coding

Installable GitHub Copilot CLI plugin for C# .NET coding expertise.

A focused, single-agent plugin for writing, reviewing, optimizing, and testing C# .NET code.

## Includes

- Agents:
  - `agents/coding.agent.md`
- Skills:
  - `skills/tdd/SKILL.md`
  - `skills/code-review/SKILL.md`
  - `skills/code-optimization/SKILL.md`
  - `skills/refactor/SKILL.md`
  - `skills/nuget-manager/SKILL.md`
  - `skills/csharp-xunit/SKILL.md`
  - `skills/microsoft-code-reference/SKILL.md`
  - `skills/feature-proposal/SKILL.md`
  - `skills/delegate-to-coding/SKILL.md`
  - `skills/sync/SKILL.md`
  - `skills/azure/SKILL.md`
  - `skills/aspire/SKILL.md`
  - `skills/open-telemetry/SKILL.md`
  - `skills/aspire-logging/SKILL.md`
  - `skills/sre/SKILL.md`

## MCP Servers (optional, enhance capabilities)

| MCP Server | Purpose |
|---|---|
| Microsoft Learn | Official .NET/C# API docs and code samples |
| Aspire MCP | Aspire orchestration and integration docs |
| JSdotNet Project Guideline MCP | Project-specific coding standards |

The agent works without MCP servers using `web/fetch` as a fallback.

## What the Coding Agent Can Do

- **Write code** — idiomatic C# with SOLID, async/await, and proper error handling.
- **Review code** — structured review with Blocking / Important / Suggestion severity levels.
- **Optimize code** — performance, allocation, and readability improvements.
- **TDD** — Red-Green-Refactor cycle with test framework detection.
- **Test feedback** — review and improve existing test projects.
- **Refactor** — behavior-preserving structural improvements.
- **Package management** — NuGet add, remove, and update via dotnet CLI.
- **Feature proposals** — scoped proposals stored under `.wip/proposals/`.
- **Learning resources** — official docs via Microsoft Learn MCP or web fetch.

- **Azure SDK** — Azure service integrations with `DefaultAzureCredential`.
- **Aspire** — AppHost wiring, service discovery, and integration tests.
- **OpenTelemetry** — tracing, metrics, and logging setup.
- **Aspire logging** — retrieve and analyze logs/traces via Aspire MCP.
- **SRE** — error budgets, resilience patterns, health checks, and runbooks.
- **Delegate to coding** — skill for other agents to hand off coding tasks here.

## Optional Handoffs

The coding agent can propose handoffs (with explicit user approval) to:

- `architect` agent — for architectural concerns.
- `security` agent — for security review findings.
- `development-plan` agent — for full implementation planning from scratch.

Install the `development` or `arc42` plugin to enable those agents.

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/csharp-coding
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/csharp-coding
```

## Uninstall

```bash
copilot plugin uninstall csharp-coding
```
