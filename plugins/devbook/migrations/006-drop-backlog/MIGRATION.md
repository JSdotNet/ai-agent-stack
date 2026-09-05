# 006 — drop `.backlog`

```meta
contractVersion: 6
appliesTo: [backlog]
breaking: yes
```

## What

`.backlog` is no longer one of devbook's folders. The generator recognizes five
— `.arc42`, `.domain`, `.tech`, `.design`, `.ai` — and the `implements`
reference field, which only `.backlog` chapters carried, is gone with it.

## Why

devbook describes *what is being built*. Work items describe *what will be
done*, which is a tracker's job: GitHub and Jira remain the tracker contract's
implementations. Chapters as work items stay possible, but that needs a durable
work-item folder this design does not ship, so the half-wired folder comes out
rather than staying as a sixth ladder nothing else in the convention refers to.

## What breaks

A repository that adopted `.backlog` keeps its Markdown — devbook does not
delete a repository's content — but three things stop being true the moment the
generator is re-synced:

1. Every `related` or `depends-on` entry in another folder pointing at a
   `.backlog/…` chapter now resolves to nothing, so the check fails.
2. `.backlog/_meta/` is orphaned: nothing regenerates it, and it goes stale
   silently.
3. `.github/workflows/devbook-meta.yml` still filters on `.backlog/**`, so the
   check runs on edits to a folder it no longer reads. A repository that has not
   yet re-synced past the `knowledge-*` -> `devbook-*` asset rename carries that
   workflow under its old name, `knowledge-meta.yml`; the script matches either.

## Run it

```bash
node migrate.mjs --check
```

`--check` exits `1` while work remains and `0` when the repository is clean; it
writes nothing, and it is what CI and the plan phase of `devbook-sync` call.
Drop the flag to apply. Running it twice changes nothing. Both forms take
`--root <path>`, defaulting to the working directory.

## What the script does, and does not

It removes the broken cross-folder references, deletes the orphaned
`.backlog/_meta/`, and drops the `.backlog/**` filters from the workflow.

It never touches `.backlog/` itself. Those chapters are the repository's
content, and where they belong now — a tracker, an `.arc42` chapter, or nowhere
— is a decision this script has no standing to make. It reports the folder and
leaves it exactly as it found it.
