---
name: knowledge-base-init
description: 'Scaffold the .arc42/.domain/.tech/.design/.backlog/.ai knowledge-folder convention into a repository, install the knowledge-meta generator and its CI check, and generate the first derived indexes. Use when: adopting the knowledge folders, bootstrapping documentation structure, adding .arc42 or .domain to a repo. Triggers on: "knowledge base", "knowledge folders", "scaffold .arc42", "scaffold .domain", "set up .tech", "set up .design", "set up .ai", "track AI adoption", "knowledge-meta", "adopt knowledge convention".'
---

# Knowledge base init

## Purpose

Materialize the knowledge-folder convention in a target repository: create the
folders the project actually needs, install the `knowledge-meta` generator and
its CI workflow, optionally add repository routing policy, and produce the first
`_meta/` indexes.

Run this once per repository. Re-running is safe — it never overwrites existing
content, only fills gaps.

## Recognized folders

| Folder | Holds | Adopt when |
|--------|-------|-----------|
| `.arc42/` | arc42 architecture chapters, ADRs, TDRs | The system has architecture worth recording |
| `.domain/` | Bounded contexts, ubiquitous language, aggregates | The project models a non-trivial domain |
| `.tech/` | Technology graph: platforms, runtimes, frameworks, versions | The stack has layers or versions worth tracking |
| `.design/` | UX and visual design guidelines and tokens | The product has a user interface |
| `.backlog/` | Durable work-item chapters | Work is planned as Markdown, not only in a tracker |
| `.ai/` | How the team develops with AI, stage by stage, with adoption status | AI is part of how the work gets done and that is worth tracking |

Adopt only what the repository will actually maintain. An empty knowledge folder
is worse than an absent one — the generator skips folders that do not exist, and
partial adoption is fully supported.

## Steps

1. **Confirm scope.** Ask the user which folders to adopt, defaulting to the ones
   the repository plausibly needs based on what is already in it. Do not adopt all
   six by reflex.

2. **Create the folders.** For each adopted folder create the directory and a
   starting chapter with a valid `meta` block, following the matching instruction
   file:
   - `.arc42/` → `knowledge-arc42.instructions.md`
   - `.domain/` → `knowledge-domain.instructions.md`
   - `.tech/` → `knowledge-tech.instructions.md`
   - `.design/` → `knowledge-design.instructions.md`
   - `.backlog/` → `knowledge-backlog.instructions.md`
   - `.ai/` → `knowledge-ai.instructions.md`

   `.ai/` needs its stage set chosen before anything is written: ask which
   positions the repository's development flow actually has, create one
   numbered file per stage, and register them in `adoption-map.md`'s stage
   table. Do not impose a default flow.

   After creating `.ai/`, confirm git actually tracks it:
   `git check-ignore -v .ai/adoption-map.md`. A repository that handles Adobe
   Illustrator files often carries a `*.ai` rule, and that pattern matches the
   folder itself — the whole knowledge area would be silently ignored. Where it
   is, add a `!.ai/` negation next to the existing rule.

   Every chapter needs a `meta` block; see
   `knowledge-chapter-metadata.instructions.md` for the required fields.

3. **Install the generator.** Copy `tools/knowledge-meta/` from the plugin root
   into the repository as `.github/tools/knowledge-meta/`. Copy the whole folder —
   it is self-contained (`build.mjs`, `graph.mjs`, `outline.mjs`, `metadata.mjs`,
   `escape-lint.test.mjs`, `README.md`) and has no dependencies beyond Node.

   `escape-lint.test.mjs` is a standalone check of the escape-sequence lint;
   run `node .github/tools/knowledge-meta/escape-lint.test.mjs` after a sync to
   confirm the copy is intact. It is safe to omit if the repository would
   rather not carry it.

   Also copy `tools/knowledge-tech/` into `.github/tools/knowledge-tech/` when
   the repository adopts `.tech/`. These scripts provide deterministic .NET and
   frontend package inventories for `knowledge-tech-update`.

4. **Install the CI check.** Copy `assets/workflows/knowledge-meta.yml` from the
   plugin root into `.github/workflows/knowledge-meta.yml`, then trim the `paths`
   filters to the adopted folders and change the branch name if the repository's
   default branch is not `main`.

   This workflow *fails* on a broken reference or a schema violation, and only
   *warns* when the committed indexes have drifted — see step 5 for why.

   If the repository has no GitHub Actions setup, skip this step and tell the
   user the generator must be run manually before committing.

5. **Install the two refresh paths.** Because the CI check no longer forces a
   contributor to regenerate the indexes in their pull request — which is what
   made those generated files conflict on merge — the repository needs a
   deliberate way to refresh them instead. Install both:

   - Copy `assets/build/Update-KnowledgeIndex.ps1` from the plugin root into
     `build/Update-KnowledgeIndex.ps1`. This is the on-demand refresh: it wraps
     the generator, takes `-Scope` and `-Check`, and reports which index files
     moved. Put it wherever the repository keeps its scripts and adjust the
     paths quoted elsewhere in this step if that is not `build/`.
   - Copy `assets/workflows/knowledge-meta-nightly.yml` into
     `.github/workflows/knowledge-meta-nightly.yml`. This is the scheduled
     reconcile: it regenerates the indexes on the default branch and opens a
     single pull request when — and only when — something drifted.

   Two things to tune in the nightly workflow, both flagged in its header
   comment: the `cron` time (put it ahead of any release job that reads the
   indexes) and `REFRESH_BRANCH` (force-pushed on every run, so nothing else may
   use that branch name).

   The convention behind this split is in
   `knowledge-derived-artifacts.instructions.md`. If the repository has no
   GitHub Actions, install the script alone and tell the user refresh is now
   entirely manual.

6. **Offer repository routing policy.** Show the user `assets/routing-snippet.md`
   from the plugin root and offer to merge the relevant parts into the
   repository's `.github/copilot-instructions.md` and routing instructions. This
   is optional and repository-specific — never apply it silently.

7. **Generate the indexes.**

   ```
   ./build/Update-KnowledgeIndex.ps1
   ```

   This writes `_meta/graph.json` and `_meta/index.json` at the repository root
   and inside each adopted folder, and lists what changed. Commit the generated
   files — they are checked in so consumers can read them without a build step.

8. **Verify.**

   ```
   ./build/Update-KnowledgeIndex.ps1 -Check
   ```

   Exit code `0` means every reference resolves and the schema is satisfied.
   Exit code `2` means no knowledge folder was found — step 2 did not run or ran
   in the wrong directory.

## Notes

- The generator resolves the repository root from the current working directory;
  pass `--root <path>` when running it from elsewhere. The PowerShell wrapper
  resolves it from the enclosing git working tree instead, so it runs from
  anywhere in the repository.
- Never hand-edit anything under `_meta/`; see
  `knowledge-derived-artifacts.instructions.md`.
- Once the folders exist, the plugin's instruction files auto-apply to them, and
  the `knowledge-canvas` extension can render the resulting graph.
