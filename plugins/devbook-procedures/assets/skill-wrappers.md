# A procedure, in the repository

`assets/skills/` holds five procedures every repository has and no plugin can write: **run**,
how its application is built and comes up; **capture**, how evidence is taken; **diagnose**, how a cause is found inside the running
application; **estimate**, how work is sized against the repository's own finished work; **prototype**, how a
design question is settled with throwaway standalone HTML and its answer kept. Each
is repository-specific by nature — one product runs `aspire start`, the next `docker compose
up`; one has tracing, the next has screenshots; a 3 in one codebase is not a 3 in the next —
and each has one goal that never varies. So the plugin fixes the goal and seeds the procedure, in the shape
`devbook:init` uses for its rules: one editable copy, a managed wrapper per host.

```
plugins/devbook-procedures/assets/skills/<name>.md    what the plugin ships
  └── .agents/skills/<name>.md                        the procedure, verbatim on first install
        ├── .claude/skills/<name>/SKILL.md            goal → pointer
        └── .github/skills/<name>/SKILL.md            goal → pointer
```

## The seed's frontmatter

Three fields: `name`, `description`, and `goal`. `name` and `description` are what a host and
a routing hook match on. `goal` is the one sentence that must hold whatever the procedure
says — what the caller gets back — and it is the plugin's, never the repository's. No host
loads `.agents/skills/`, so the extra key costs nothing there and never reaches a host.

## The procedure

`.agents/skills/<name>.md`, byte-for-byte on first install, filename included. **This is the
copy a repository edits**, and editing it is the point. Once its hash matches no release this
plugin shipped it is customized: `managed: false` in the stamp, reported on every later
reconcile, never overwritten. The rules — key, hash, customized, orphan — are
`assets/reconcile-protocol.md` in the devbook plugin under **The stamp**, followed exactly.

`.agents/` is where a repository keeps host-neutral authored assets, one copy with a wrapper
per host; `assets/rule-wrappers.md` in the devbook plugin put the rules there first.

## The two wrappers

Rendered from the plugin's seed, never from the repository's copy, and never a second copy of
the procedure. Frontmatter carries `name` and `description` only — a host validates what it
loads. The body is the goal, then the pointer:

```markdown
---
name: capture
description: "Capture screenshots and recordings as evidence for the feature being built …"
---

**Goal, fixed by devbook-procedures:** Return evidence a reviewer can open instead of taking
your word for it: one file per checkpoint and per failure, every path under the git worktree
root, and the form named honestly.

Read `.agents/skills/capture.md` and follow it. It is this repository's own procedure; where it
and the goal above disagree, the procedure is what needs fixing.
```

The wrappers stay **managed**: the goal and the matching text are refreshed on every upgrade,
and everything that decides *what actually happens* stays the repository's. A repository that
edits a wrapper anyway keeps it — reported, left alone, like any customized file.

## `run`, the exception

`run` has no `.agents/skills/run.md`. Claude Code ships its own `run` skill, which follows a
project recipe at `.claude/skills/run-<name>/SKILL.md` that its `/run-skill-generator` records,
so the body lives there and Claude Code's `run` is the Claude wrapper:

```
.claude/skills/run-<name>/SKILL.md     the procedure: the generator's recipe, or this seed
  └── .github/skills/run/SKILL.md      goal → pointer, Copilot's twin
```

- **Where the generator is reachable** — Claude Code, the person typing `/run-skill-generator`
  when the host does not let a skill invoke it — the recipe it writes is the body. Otherwise
  `assets/skills/run.md` lands there, its `name` rendered `run-<id>`, `<id>` being `id` in
  `.devbook/config.json`. Either way the body is the repository's from the moment it lands:
  stamped `managed: false`, never written to again. Several `run-*` recipes — one per unit of a
  monorepo — are each a body.
- **The Copilot twin** is the wrapper above with `name: run`, the seed's `description` and
  `goal`, and one pointer per body: ``Read `.claude/skills/run-<name>/SKILL.md` and follow it``,
  saying which unit each launches when there are several. It stays managed.
- **A caller names `run`** and gets Claude Code's skill or the twin, one name on both hosts.

## Which procedures, and when

`components.devbook-procedures.adopted` in `.devbook/config.json` names them, without
ceremony: a repository with nothing to start drops `run` and `diagnose`; one that takes
no evidence drops `capture`; `estimate` and `prototype` need neither. `init` asks on a first run
and `update` never re-asks what the stamp answers. None is a dependency of anything: a caller that names one of these skills
and finds it absent does without and says so.
