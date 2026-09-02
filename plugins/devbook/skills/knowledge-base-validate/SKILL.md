---
name: knowledge-base-validate
description: 'Validate and repair the .arc42/.domain/.tech/.design/.ai knowledge folders — resolve broken metadata references, remove fields the schema no longer defines, add missing meta blocks, and refresh drifted _meta indexes. Use when: the knowledge-meta check fails, CI warns about drifted indexes, references do not resolve. Triggers on: "knowledge-meta failed", "broken reference", "stale _meta", "validate knowledge folders", "knowledge base check", "build.mjs --check".'
---

# Knowledge base validate

## Purpose

Run the `knowledge-meta` check over a repository's knowledge folders and repair
whatever it reports: unresolved references, fields the schema no longer defines,
missing or malformed `meta` blocks, and drifted committed `_meta/` indexes.

## Steps

1. **Run the check** from the repository root:

   ```
   node .github/tools/knowledge-meta/build.mjs --check
   ```

   Exit codes:

   | Code | Meaning | Action |
   |------|---------|--------|
   | `0` | Every reference resolves, every block matches the schema | Go to step 4 |
   | `1` | One or more problems at `error` severity | Go to step 2 |
   | `2` | No knowledge folder found | Wrong directory, or the repo has not adopted the convention — run `knowledge-base-init` instead |

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

   Fix the **source Markdown**, never the generated JSON. Anything under `_meta/`
   is derived; see `knowledge-derived-artifacts.instructions.md`.

3. **Re-run the check** until it exits `0`.

4. **Refresh the derived indexes** if you want this branch current:

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

If the generator itself is missing from the repository, install it with the
`knowledge-base-init` skill rather than copying files ad hoc.

## Do not

- Do not hand-edit files under `_meta/` to make the check pass.
- Do not delete a chapter to resolve a dangling reference — repoint the reference.
- Do not weaken or remove the CI workflow to get a pull request green.
