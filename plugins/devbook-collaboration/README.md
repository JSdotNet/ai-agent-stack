# devbook-collaboration

Review, comment, and hand-off workflows over [devbook](../devbook) chapters.

An L1 extension: it depends on `devbook` and nothing else, and every fact it
remembers about a chapter lives under `ext.devbook-collaboration.*` in that
chapter's own `meta` block — the opaque namespace devbook carries through
untouched. It adds no field to devbook's schema, materializes nothing into a
repository, and needs no devbook release of its own.

## Installation

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `devbook-collaboration` with `/plugin`. `devbook` is a declared
dependency, so the host installs and enables it alongside.

## The pass

One chapter moves through four skills, and the state it carries always says who
owes the next move:

| Skill | Who runs it | Leaves behind |
|---|---|---|
| `chapter-handoff` | The author | `review: requested` and the reviewer's name, plus a brief to send |
| `chapter-review` | The reviewer | `review: changes-requested` with one `open-<n>` per finding, or `review: cleared` |
| `chapter-approve` | Whoever approves | devbook's `status: approved` with `approved-by` and `approved-at` — and no collaboration state at all |
| `chapter-review-queue` | Anyone | Nothing. It reads the folders and reports what is waiting |

Approval is devbook's own field and keeps devbook's meaning. This plugin never
writes it without a person choosing it in that session, and clears its own
namespace in the same change: an approved chapter carries the decision, not the
road to it.

## The state

| Key | Value |
|---|---|
| `ext.devbook-collaboration.review` | `requested` · `changes-requested` · `cleared` |
| `ext.devbook-collaboration.reviewer` | One handle, name, or role |
| `ext.devbook-collaboration.review-at` | `YYYY-MM-DD` |
| `ext.devbook-collaboration.open-<n>` | One unresolved finding, one line, numbered from 1 |

```meta
status: draft
ext.devbook-collaboration.review: changes-requested
ext.devbook-collaboration.reviewer: @jsdotnet
ext.devbook-collaboration.review-at: 2026-09-03
ext.devbook-collaboration.open-1: The 30-day window in the refund rule table has no tests entry.
```

The full contract — the three states, why a finding is one key rather than a
list entry, and the rule that none of it is chapter content — is in
[`instructions/chapter-collaboration.instructions.md`](instructions/chapter-collaboration.instructions.md).

## What this release does not do

Comments are still single-line findings in `ext`, not threads — and as of
devbook 1.1.0 that is one release out of date. The
[Layered Annotations](https://claude.ai/code/artifact/219b5bbb-8ea1-4ae2-8dbc-4cd10f4d6d19)
design puts a threaded `annotation` fence in devbook itself, with authors,
replies, quoted passages, and a sweep, and [devbook has now shipped
it](../devbook/instructions/knowledge-annotations.instructions.md). This plugin
has not moved yet, so a repository with both installed has two places to leave
a comment. The migration is one pass: every `open-<n>` becomes one fence with
`body` set from the line and `author` unknown. See
[the decision](../../.devbook/arc42/09-architecture-decisions.md#comments-are-findings-until-the-fence-lands).
