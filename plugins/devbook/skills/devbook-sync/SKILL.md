---
name: devbook-sync
description: 'Reconcile a repository with devbook — adopt the .arc42/.domain/.tech/.design/.ai knowledge folders, install or refresh the knowledge-meta generator and its CI checks, run outstanding schema migrations, and write the stamp. One idempotent operation covering first install, plugin upgrade, a change in which folders are adopted, and migration-only. Use when: adopting devbook, upgrading it, adding or dropping a knowledge folder, or a migration is outstanding. Triggers on: "devbook sync", "set up devbook", "adopt the knowledge folders", "scaffold .arc42", "scaffold .domain", "set up .tech", "set up .design", "track AI adoption", "upgrade devbook", "run devbook migrations".'
---

# devbook sync

Reconcile this repository with the installed devbook release. Read
`assets/reconcile-protocol.md` first: it carries the stamp shape, the asset
table, and what each phase below does. None of it is repeated here.

Run the six phases in order, every time. A first install, an upgrade, a change
in adoption, and a migration are one operation — the stamp says which.

1. **Detect.** Stamp, installed version, disk state. Disk wins on existence,
   the stamp wins on provenance.
2. **Resolve.** Ask only about genuinely new choices. Adopt only folders the
   repository will actually maintain — an empty knowledge folder is worse than
   an absent one, and partial adoption is the normal case.
3. **Plan.** Show the diff table and write nothing. Never skip this.
4. **Migrate.** Ledger forward, oldest first, `--check` before and after each.
5. **Materialize.** Overwrite stale, report customized, never both.
6. **Stamp and verify.** Rewrite the entry, run `devbook-check`, report.

## Creating a folder

Each adopted folder gets its directory and one starting chapter with a valid
`meta` block, written to the matching instruction file:
`knowledge-arc42`, `knowledge-domain`, `knowledge-tech`, `knowledge-design`,
`knowledge-ai` `.instructions.md`. Required block fields are in
`knowledge-chapter-metadata.instructions.md`.

`.ai` needs its stage set chosen before anything is written: ask which positions
this repository's development flow actually has, create one numbered file per
stage, and register them in `adoption-map.md`. Do not impose a default flow.
Then confirm git tracks it — `git check-ignore -v .ai/adoption-map.md`. A repo
holding Adobe Illustrator files often carries a `*.ai` rule, which matches the
folder itself and silently ignores the whole area; add a `!.ai/` negation.

## Notes

- Offer `assets/routing-snippet.md` for the user to merge. Never apply it
  silently.
- Without GitHub Actions, install `build/Update-KnowledgeIndex.ps1` alone and
  say plainly that index refresh is now manual.
- Report a reconcile that ends on a failing check as failing, never as installed.
