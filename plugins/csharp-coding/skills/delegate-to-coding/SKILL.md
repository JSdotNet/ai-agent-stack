---
name: delegate-to-coding
description: 'Delegate C# .NET coding tasks to the coding agent. Use this skill from any other agent when a task requires writing, reviewing, optimizing, or testing C# code, and the coding agent is installed.'
---

# Delegate to Coding Agent

Use this skill to hand off C# .NET coding work to the `coding` agent from within another agent.

## When to Delegate

Delegate to the `coding` agent when the current task requires:

- Writing new C# code or implementing a feature.
- Reviewing a pull request or specific C# files.
- Optimizing code for performance or readability.
- Running or improving a TDD cycle.
- Reviewing and improving test project quality.
- Refactoring C# code.
- Managing NuGet packages.
- Writing a structured feature proposal.
- Azure SDK or Aspire integration coding work.
- Setting up OpenTelemetry tracing, metrics, or logging.
- Analyzing logs retrieved via Aspire MCP.

## How to Delegate

1. Save any relevant context (plans, specs, partial work) to `.wip/` and note the file path.
2. Compose a delegation prompt using the template below.
3. Present the prompt to the user and ask for approval before switching to the `coding` agent.
4. Only switch after explicit user approval.

## Delegation Prompt Template

```
Agent: coding

Context:
- Objective: <what needs to be implemented or reviewed>
- Relevant files: <paths to source, test, or plan files>
- Constraints: <TFM, C# version, test framework, known limitations>
- Artifacts: <path to .wip/ plan or partial work if any>

Task:
<Specific ask — e.g., "Implement X following the plan at .wip/plans/feature-x.md and write xUnit tests.">
```

## Notes

- The `coding` agent is self-contained: no further handoffs are expected from it.
- If the `coding` agent is not installed, note the limitation and continue in the current agent's scope.
