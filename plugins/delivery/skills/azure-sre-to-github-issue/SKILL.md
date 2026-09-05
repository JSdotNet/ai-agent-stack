---
name: azure-sre-to-github-issue
description: >
  Create GitHub issues from active Azure Monitor SRE alerts.
  Use when: triaging Azure alerts, translating SRE incidents to tracked work,
  syncing Azure Monitor findings to GitHub, bulk issue creation from alert feed.
---

# Azure SRE to GitHub Issue

## Purpose

Query Azure Monitor for active SRE alerts and create a corresponding GitHub issue
per alert, enriched with context, severity, and suggested next steps.
Skips alerts that already have an open GitHub issue to avoid duplicates.

## Inputs

- Azure subscription ID or name (required).
- Resource group or resource filter (optional; default: all resources).
- Minimum alert severity to include: `Sev0`, `Sev1`, `Sev2`, `Sev3`, `Sev4` (default: `Sev2`).
- GitHub repository in `owner/repo` format (required).
- Label to apply to created issues (default: `sre`, `alert`).
- Assignee GitHub username (optional).
- Dry-run mode: `true` skips issue creation and only reports what would be created (default: `false`).

## Workflow

### Phase 1 — Fetch Active Alerts

1. Use the Azure skill or MCP tool to retrieve active Azure Monitor alerts:
   - Filter by subscription and optional resource group.
   - Filter by severity threshold.
   - Filter to `fired` state only (skip `resolved` alerts).
2. List all matching alerts with: alert name, resource, severity, fired time, description.

### Phase 2 — Deduplicate Against Open GitHub Issues

3. Search existing open GitHub issues in the target repo for each alert name:
   ```bash
   gh issue list --repo <owner/repo> --state open --search "<alert-name>" --json number,title
   ```
4. Mark alerts that already have a matching open issue as **skipped**.
5. Present the full list — to-create and skipped — and ask for confirmation before proceeding
   (unless `dry-run` is `true`, in which case stop here with the preview).

### Phase 3 — Create GitHub Issues

6. For each alert not already tracked, create a GitHub issue using this structure:

**Title:** `[SRE] <Alert Name> — <Resource Name> (<Severity>)`

**Body:**

```markdown
## Alert Details

| Field | Value |
|-------|-------|
| **Alert Name** | `<alert-name>` |
| **Resource** | `<resource-id>` |
| **Severity** | `<Sev0–Sev4>` |
| **Fired At** | `<ISO timestamp>` |
| **Subscription** | `<subscription-name>` |
| **Resource Group** | `<resource-group>` |

## Description

<alert description from Azure Monitor>

## Condition

<metric/log condition that triggered the alert>

## Suggested Actions

- Review the resource in Azure Portal: [Open in Portal](<azure-portal-link>)
- Check recent deployments or configuration changes for `<resource-name>`.
- Consult the runbook if available: `<runbook-url if present>`.
- Escalate to on-call if severity is Sev0 or Sev1.

## References

- Azure Alert ID: `<alert-id>`
- Azure Monitor: [View Alert](<direct-link>)
```

7. Apply labels (`sre`, `alert`, severity label such as `sev2`) and optional assignee.
8. Record the created issue number against the alert ID.

### Phase 4 — Summary

9. Output a summary table:

| Alert Name | Resource | Severity | Action | Issue |
|------------|----------|----------|--------|-------|
| `<name>` | `<resource>` | Sev2 | Created | #42 |
| `<name>` | `<resource>` | Sev1 | Skipped (existing #38) | #38 |

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`.
With no surface bound, skip the calls, say so once, and continue — file artifacts remain
the source of truth.

- `start_run` with `skillId: "azure-sre-to-github-issue"` and these stages: Fetch Active
  Alerts, Deduplicate Against Open GitHub Issues, Create GitHub Issues,
  Summary.

## Output

- One GitHub issue per new alert.
- Summary table with action taken for each alert.
- No duplicate issues created.

## Notes

- Requires Azure skill or Azure MCP tool for alert retrieval.
- GitHub access is provided by the active session; no extra authentication needed.
- For Jira integration, replace the GitHub issue creation step with a Jira ticket creation
  using the Jira skill, keeping the same field mapping.
