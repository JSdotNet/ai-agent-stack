---
applyTo: 'agents/**/*.agent.md'
description: Defines mandatory approval flow and wording for cross-agent handoffs in this plugin.
---

# Agent Handoff Approval Instructions

## Purpose

- Define one shared handoff policy for UX design agents.
- Ensure handoffs are proposed when needed and never executed without user approval.

## Mandatory Policy

- Always propose a handoff when another specialist agent is better suited for the request.
- Always ask for explicit user approval before performing a handoff.
- Never switch agents without explicit user approval in the current conversation.
- If approval is not granted, continue in the current scope and clearly state limitations.
- For recurring transitions, prefer agent frontmatter `handoffs` so the next step is explicit and easy to approve.

## Required Handoff Flow

1. Explain why a handoff is recommended.
2. Name the target agent and expected benefit.
3. Ask the user for explicit approval to proceed.
4. If artifacts exist, store them under `.wip/` and reference the path in the handoff context.
5. Perform the handoff only after approval is granted.

## Compliance Checklist

- [ ] Handoff was proposed only when needed.
- [ ] Explicit user approval was requested before switching.
- [ ] No handoff was executed without approval.
- [ ] Relevant partial artifacts were saved under `.wip/` and referenced.
- [ ] If rejected, current agent continued with best in-scope support.
