# Reconcile protocol

The shared detail behind `devbook-sync` and `devbook-check`: the stamp devbook
writes, the assets it materializes, and what each of the six phases actually
does. Read it before running either skill; neither repeats it.

## One reconcile, four situations

First install, a version upgrade, a change in which folders are adopted, and a
migration are the same idempotent operation. The stamp says which one this is:

| Situation | Detected by | What differs |
|---|---|---|
| New repository | no stamp file | It asks which folders to adopt. Everything after is identical. |
| New plugin version | stamped `pluginVersion` below the installed one | Runs the migration delta; re-materializes stale assets. |
| Adoption changed | `adopted` differs from what is on disk | Materializes what is newly needed; orphans what nothing claims. |
| Migration only | stamped `contractVersion` below the plugin's | Ledger forward, no asset movement. |

None of these is a separate procedure. Detect, resolve, plan, migrate,
materialize, stamp — every time.

## The stamp

`.github/ai-agent-stack.json`, repo-scope and committed. devbook owns exactly
one entry inside it and never edits another component's:

```json
{
  "components": {
    "devbook": {
      "pluginVersion": "1.0.0",
      "contractVersion": 6,
      "adopted": ["arc42", "domain", "tech"],
      "materialized": {
        ".github/tools/devbook-meta": { "from": "1.0.0", "hash": "sha256:9f2c…", "managed": true },
        ".github/workflows/devbook-meta.yml": { "from": "1.0.0", "hash": "sha256:41ab…", "managed": true },
        "build/Update-DevbookIndex.ps1": { "from": "0.15.0", "hash": "sha256:7e10…", "managed": false }
      },
      "migrations": [
        { "id": "006-drop-backlog", "applied": "2026-09-03" }
      ]
    }
  }
}
```

| Field | Means |
|---|---|
| `pluginVersion` | The devbook release that last reconciled this repository. |
| `contractVersion` | The schema contract the repository is on. Migrations key off this, not off `pluginVersion`, which is why most upgrades reconcile to nothing. |
| `adopted` | Which knowledge folders this repository maintains, without the leading dot. A migration's `appliesTo` is read against this list. |
| `materialized` | Every file devbook copied in, with the release it came from and the hash it had when it landed. |
| `managed: false` | The repository has taken ownership of that copy. Report drift on it; never write to it. |
| `migrations` | Append-only ledger. An entry may carry `"result": "not-applicable"` instead of `applied` where the migration's `appliesTo` names no adopted folder. |

What the stamp deliberately does not record: which plugins are installed, at what
version, by whom. That is personal and user-scope, and putting it here makes the
file wrong the moment a second person opens the repository.

## What devbook materializes

| From the plugin | Into the repository | When |
|---|---|---|
| `tools/devbook-meta/` | `.github/tools/devbook-meta/` | always |
| `tools/devbook-tech/` | `.github/tools/devbook-tech/` | `.tech` adopted |
| `assets/workflows/devbook-meta.yml` | `.github/workflows/devbook-meta.yml` | GitHub Actions present |
| `assets/workflows/devbook-meta-nightly.yml` | `.github/workflows/devbook-meta-nightly.yml` | GitHub Actions present |
| `assets/build/Update-DevbookIndex.ps1` | `build/Update-DevbookIndex.ps1` | always |

Both workflows are edited on the way in — path filters trimmed to the adopted
folders, the branch name corrected, the nightly `cron` and `REFRESH_BRANCH`
chosen. That makes them customized from the first reconcile onward, which is the
intended outcome: their hash matches no shipped release, so reconcile reports
them and leaves them alone.

`assets/routing-snippet.md` is never materialized. Routing policy is
repository-specific and is offered for the user to merge, never applied silently.

## The six phases

1. **Detect.** Read the stamp, the installed plugin version, and the actual disk
   state — which folders exist, what each materialized file hashes to. Disk wins
   on existence, the stamp wins on provenance. Never trust the stamp alone: a
   folder someone deleted is gone whatever the stamp says.

2. **Resolve.** Desired state is adopted folders × contract version × the asset
   table above. Ask the user only about genuinely new choices — which folders to
   adopt on a first install, a folder that has appeared on disk but is unstamped
   — and never re-ask what the stamp already answers.

3. **Plan.** Emit one diff table — `create`, `update`, `migrate`,
   `skip-customized`, `orphan` — and **write nothing**. This phase is what makes
   the skill safe to run against a repository nobody remembers configuring, so it
   is never skipped, not even when the plan is empty.

4. **Migrate.** Run the ledger forward, one migration at a time, oldest first.
   Each ships an idempotent `migrate.mjs`; call `--check` first, apply only if it
   exits `1`, then `--check` again to confirm. Record each in the ledger as it
   lands, or as `not-applicable` where its `appliesTo` names no adopted folder.
   Stop at the first failure with the ledger reflecting exactly what was applied.

5. **Materialize.** Copy assets, overwriting only where the file's hash matches a
   release devbook shipped — that is stale, and stale gets replaced. A hash
   matching nothing ever shipped is customized: report it and leave it alone.
   Orphan anything no adopted folder claims any more; report it, do not delete.

6. **Stamp and verify.** Rewrite devbook's entry, run `devbook-check`, and report
   what moved. A reconcile that ends with a failing check is reported as failing —
   never as "installed".

## Rules that hold in every phase

- Nothing is written before phase 3 has been shown.
- A customized file is never overwritten, in any phase, for any reason.
- A migration id is never invented, renamed, or removed from the ledger.
- devbook writes one component entry. Another component's entry, and the stamp's
  own top-level keys, belong to whoever owns them.
