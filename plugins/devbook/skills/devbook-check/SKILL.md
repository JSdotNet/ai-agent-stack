---
name: devbook-check
description: 'Check a repository against devbook without writing to it, and repair what it reports — broken metadata references, fields the schema no longer defines, missing meta blocks, outstanding migrations, stamp drift, and stale _meta indexes. The check-only half of devbook-sync. Use when: the knowledge-meta check fails, CI warns about drifted indexes, references do not resolve, or a migration may be outstanding. Triggers on: "devbook check", "knowledge-meta failed", "broken reference", "stale _meta", "validate knowledge folders", "build.mjs --check".'
---

# devbook check

## Purpose

Check this repository against devbook and write nothing; then repair whatever
the check reports. It is `devbook-sync`'s check-only half — the same three
questions, asked without changing anything: does the authored Markdown satisfy
the schema, is the migration ledger current, and does the stamp still describe
what is on disk.

This file exceeds the 40-line body budget on purpose. Most of it is the symptom
table in step 2 — one row per thing the generator can report, with the fix — and
compressing a lookup table costs a repair, not a sentence.

## Steps

1. **Check the authored Markdown** from the repository root:

   ```
   node .github/tools/knowledge-meta/build.mjs --check
   ```

   Exit codes:

   | Code | Meaning | Action |
   |------|---------|--------|
   | `0` | Every reference resolves, every block matches the schema | Go to step 4 |
   | `1` | One or more problems at `error` severity | Go to step 2 |
   | `2` | No knowledge folder found | Wrong directory, or the repo has not adopted the convention — run `devbook-sync` instead |

   `--check` parses and reports without writing. Add `--root <path>` when running
   from outside the repository root, and `--scope <folder>` to narrow the run to
   one knowledge folder.

2. **Fix the reported problems.** Each problem names the file it came from.
   Common causes and the correct fix:

   | Problem | Cause | Fix |
   |---------|-------|-----|
   | Unresolved reference | A `related`, `depends-on`, or `refines` target was renamed, moved, or never existed | Repoint the reference at the real chapter, or remove it if the relationship is gone. Never delete the target to silence the error. |
   | Missing `meta` block | A chapter was added without one | Add a block per `knowledge-chapter-metadata.instructions.md` |
   | Malformed `meta` block | Wrong field name, wrong value shape, or bad fencing | Correct it against `knowledge-chapter-metadata.instructions.md` |
   | Removed schema field | An `order` field left over from before reading order moved to the folder convention | Delete the field. If the generated order is then wrong, give the documents a `number` or mark the entry point `index: root` |
   | Duplicate `number` | Two documents in one directory claim the same number | Renumber one of them, in its filename or its `number` field, so each number identifies one document |
   | Two `index: root` | Two documents in one directory both claim to be its entry point | Keep the one that introduces the directory and drop the field from the other |
   | Bad `number` / `date` / `index` value | A non-integer number, a date that is not `YYYY-MM-DD`, or an `index` other than `root`/`exclude` | Correct the value; `date` is a calendar day the content records, not a modification timestamp |
   | `index` or `number` on a chapter block | Both place the document in its directory, so they belong on the file-level block | Move the field to the file-level block, or drop it if the chapter needed neither |
   | No entry point | A directory the convention covers is missing its root document, or has excluded it | Create the expected file, or mark the right one `index: root` |
   | Unknown status or type | A value outside the allowed ladder or value set | Use one of the values listed in the folder's own instruction file |
   | Approval with no signature | `status: approved` with no `approved-by` or `approved-at` (warning) | Add who approved it and on what day, or drop the rung — an unsigned approval records no decision |
   | Approval record with no rung | `approved-by` or `approved-at` on a chapter whose `status` is not `approved` (warning) | Either restore `status: approved`, or delete both fields in the same change that dropped the rung |
   | Bad `approved-at` value | Not a `YYYY-MM-DD` calendar day | Correct it; it is the day a person approved the chapter |
   | Missing `status` | A `.tech` or `.ai` block with no `status` — those folders rate, so absence states nothing | Add `status` from the folder's ladder. In `.domain`, `.arc42`, and `.design` an absent `status` is correct and means the resting value `active` |
   | Resting `status` stated explicitly | A `.domain`, `.arc42`, or `.design` block writes `status: active`, which is what an absent field already says (warning) | Delete the line. If the block is then empty, keep the empty `meta` fence — it is what makes the heading an addressable chapter |
   | Missing `type` | A `.domain`, `.tech`, or `.ai` block with no `type`, or a heading still carrying a kind prefix | Add `type` from the folder's value set and strip the prefix from the heading |
   | Malformed `tests` entry | Not `<level>:<runner>:<selector>`, an unknown level, or a chapter reference pasted into `tests` | Rewrite the entry per "Linking test cases" in `knowledge-chapter-metadata.instructions.md`. A link to another chapter belongs in `related` |
   | Unmapped test runner | A `tests` entry names a runner the tooling has no command for, so nothing can offer to run it (warning) | Leave it if the runner is genuinely what runs the test; add its command to `TEST_RUNNERS` in `.github/tools/knowledge-meta/metadata.mjs` to make it runnable |
   | Literal escape sequence in body text | A `` `r`n `` or `\n` was written instead of a line break, usually by a tool writing the file through a shell | Replace it with a real line break. Check whether a heading was glued onto the previous line and silently stopped being a heading |
   | Annotation before the first heading | An `annotation` fence with no chapter above it | Move it under the chapter it is about. A note is addressed by chapter and ordinal, so one outside a chapter has no address |
   | Annotation missing `author`, `date`, or `body` | The three required fields of a note | Add them. `author` is written, never inferred — a note outlives the rewrite `git blame` would have had to follow |
   | Unknown annotation `kind` or `status` | A value outside `comment`/`question`/`suggestion`/`flag`, or outside `open`/`resolved` | Use one of the listed values; both sets are closed so a reader can sort by them |
   | Annotation `quote` matches nothing above | The quoted phrase is not in the block the note attaches to (warning) | The passage probably moved out from under the note. Move the note to follow it, or drop the `quote`. Never resolve the attachment by the quote — position is the anchor |
   | Annotation `ext` is not a mapping | `ext` written as a scalar or a list | Write it as `ext.<namespace>`. L0 validates the shape and never reads inside it |
   | Unrecognized annotation field | A field outside the closed core set (warning) | Move it under `ext.<namespace>` — that is the seam an extension adds state through |

   Fix the **source Markdown**, never the generated JSON. Anything under `_meta/`
   is derived; see `knowledge-derived-artifacts.instructions.md`.

3. **Re-run the check** until it exits `0`.

4. **Check the migration ledger.** Run `migrate.mjs --check --root <repo>` for
   every `migrations/<id>/` folder in the plugin, oldest first. An exit of `1` is
   hard drift: work the ledger says is done that the repository has not had. Do
   not apply it here — `devbook-sync` owns the writing, and applying a migration
   outside phase 4 leaves the ledger describing something that did not happen.
   Report which migrations are outstanding and stop.

5. **Check the stamp.** Read devbook's entry in `.github/ai-agent-stack.json`
   per `assets/reconcile-protocol.md` and compare it with disk:

   | Drift | Severity | Fix |
   |---|---|---|
   | A migration the plugin's `contractVersion` requires is missing from the ledger | hard | Step 4 already reported it; run `devbook-sync` |
   | A file the stamp says was materialized is gone | hard | Run `devbook-sync` to put it back |
   | A folder exists on disk that `adopted` does not list, or the reverse | hard | Adoption changed without a reconcile; run `devbook-sync` |
   | No stamp at all | hard | The repository has never been reconciled; run `devbook-sync` |
   | A materialized hash matches an older release | stale | Nothing is broken. An upgrade is available |
   | A materialized hash matches nothing ever shipped | customized | Report it and leave it. Often deliberate — both workflows are edited on install |

   Fail on hard drift; report staleness and customization without failing. That
   split is the same one the CI workflow already makes about `_meta/`, and for
   the same reason: a stale generated file must not block an unrelated pull
   request.

6. **Refresh the derived indexes** if you want this branch current:

   ```
   ./build/Update-KnowledgeIndex.ps1
   ```

   Output is deterministic — no timestamps — so "nothing changed" means the
   committed indexes were already current.

   Committing the refresh is optional and usually not what you want. CI only
   *warns* about drifted indexes, and the nightly job reconciles the default
   branch in one pull request; regenerating them alongside an ordinary chapter
   edit is what makes the generated JSON conflict on merge. Commit the refresh
   when something is about to read the indexes from this branch — a release, a
   local consumer — and otherwise leave it. See
   `knowledge-derived-artifacts.instructions.md`.

## When CI fails but local is clean

A CI failure is about the *authored Markdown*, not the indexes: the workflow
fails only on an unresolved reference or a schema violation, which is
step 1 above. Drifted `_meta/` files produce a `::warning::` and never fail the
run, so "the indexes were not committed" is not the explanation.

If step 1 exits `0` locally but CI is red, compare against the merge result
rather than your branch tip — a reference can break when two branches land
together even though each was clean on its own.

If the generator itself is missing from the repository, install it by running
`devbook-sync` rather than copying files ad hoc — a copy made by hand lands
unstamped, and the next reconcile cannot tell it from a customized file.

## Do not

- Do not hand-edit files under `_meta/` to make the check pass.
- Do not delete a chapter to resolve a dangling reference — repoint the reference.
- Do not weaken or remove the CI workflow to get a pull request green.
- Do not apply a migration from here, and do not edit the stamp. Both belong to
  `devbook-sync`, which records what it did as it does it.
