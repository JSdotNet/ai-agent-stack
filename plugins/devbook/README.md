# devbook

Encapsulates the `.arc42` / `.domain` / `.tech` / `.design` / `.backlog` /
`.ai` knowledge-folder convention: durable, cross-linked Markdown knowledge with
machine-readable `meta` blocks, derived `_meta/` indexes, a graph canvas, and a
CI check that keeps references honest.

## Installation

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `devbook` with `/plugin`. During development, add this working copy by
path instead of by repository.

## What the convention is

Each knowledge folder holds Markdown chapters. Every chapter carries a `meta`
block declaring its identity, status, number, date, its relationships to other
chapters, and the test cases that assert what it claims. A generator walks the
corpus and writes derived indexes under `_meta/`, which CI validates on every
pull request and a scheduled job keeps current.

| Folder | Holds |
|--------|-------|
| `.arc42/` | arc42 architecture chapters, ADRs, TDRs |
| `.domain/` | Bounded contexts, ubiquitous language, aggregates, domain flows |
| `.tech/` | Technology graph: platforms, runtimes, frameworks, versions, maturity |
| `.design/` | UX and visual design guidelines, tokens, design rules |
| `.backlog/` | Durable work-item chapters |
| `.ai/` | How the team develops with AI: usage per flow stage, concepts, adoption status |

Adoption is partial by design — a repository may take only `.domain` and
`.arc42`, and the tooling emits scopes for the folders that actually exist.

## Features

### Skill: `knowledge-base-init`

Scaffolds the convention into a repository: creates the chosen folders, installs
the generator to `.github/tools/knowledge-meta/`, installs the CI workflow and
the two refresh paths, offers repository routing policy, and generates the
first indexes.

**Trigger keywords:** `knowledge base`, `knowledge folders`, `scaffold .arc42`,
`scaffold .domain`, `set up .tech`, `set up .design`, `knowledge-meta`,
`adopt knowledge convention`

### Skill: `knowledge-base-validate`

Runs the check and repairs what it reports — broken references, missing or
malformed `meta` blocks, fields the schema no longer defines, stale committed
indexes.

**Trigger keywords:** `knowledge-meta failed`, `broken reference`, `stale _meta`,
`validate knowledge folders`, `knowledge base check`, `build.mjs --check`

### Skill: `knowledge-tech-update`

Refreshes a repository's `.tech/` technology graph from deterministic package
inventories for .NET and frontend dependencies, then analyzes the repository for
non-package technologies such as runtimes, services, platforms, protocols, and
tooling before delegating graph authoring through `orch-tech`.

**Trigger keywords:** `update technology graph`, `refresh .tech`,
`technology inventory`, `.NET packages`, `frontend packages`, `package graph`

### Skill: `orch-arc42-content`

Orchestrates direct content edits to `.arc42/` chapters — refreshing a chapter,
section, or diagram — with metadata enforcement and a consistency review. Defers
decision-record and blueprint-scale work to `orch-adr`, `orch-tdr`,
`orch-blueprint`, and `orch-architecture`.

**Trigger keywords:** `update arc42 chapter`, `refresh runtime view`,
`arc42 diagram`, `add glossary term`, `edit .arc42`, `quality requirements`

### Skill: `orch-domain`

Orchestrates `.domain/` changes — bounded-context model, features, model and
flow diagrams, dependencies, and naming — through `domain-design:domain-architect`
with template and metadata enforcement.

**Trigger keywords:** `bounded context`, `context map`, `new aggregate`,
`domain model`, `ubiquitous language`, `domain flow`, `edit .domain`

### Skill: `orch-backlog`

Orchestrates `.backlog/` work-item chapters — Items and Sub-items grouped by
concern — drafting through `to-epic` / `to-story` / `to-bug` and
publishing through `create-github-issue` / `update-github-issue`.

**Trigger keywords:** `backlog item`, `add sub-item`, `work item chapter`,
`publish to issue`, `edit .backlog`, `concern file`

### Skill: `orch-tech`

Orchestrates `.tech/` technology-graph changes — adding a technology, pinning a
version, promoting or retiring a status, adding a layer — and keeps the graph
diagram in sync with the `depends-on` edges.

**Trigger keywords:** `technology graph`, `add technology`, `pin version`,
`promote to adopted`, `retire technology`, `edit .tech`

### Skill: `orch-ai`

Orchestrates `.ai/` changes — a usage recorded at a flow stage, an adoption
status promoted or demoted, a concept, a stage added — with a placement and
boundary check that keeps tool registration in `.tech/` and keeps the adoption
map in sync with the stage files.

**Trigger keywords:** `AI adoption`, `we now use this agent`, `add to the flow`,
`promote to adopted`, `retire this practice`, `AI harness`, `edit .ai`

### Skill: `orch-design`

Orchestrates `.design/` guideline changes — principles, tokens, typography and
layout, interaction, accessibility, component libraries — grounded in the
repository's authoritative design source, through `ux-design:ux-designer`.

**Trigger keywords:** `design tokens`, `color scheme`, `design guideline`,
`interaction rule`, `accessibility guideline`, `component library`, `edit .design`

### Skills: `to-spec-<kind>` and `from-spec-<kind>`

Two directions between a knowledge chapter and the code that implements it. The chapter is
the **spec**, which is what the `spec` in each name refers to — `<kind>` alone would be
ambiguous, because an aggregate is both a chapter and a class.

- **`to-spec-<kind>`** — something exists in the application and the
  chapter is missing, thin, or stale, so read the implementation and write the
  chapter. Source and tests are the only evidence; comments, TODOs, and disabled
  tests are not. The write routes through the folder's own orchestration skill.
- **`from-spec-<kind>`** — a chapter is agreed but unbuilt, so turn it
  into a change brief (outcomes, invariants, ubiquitous language, out of scope,
  acceptance checks) plus a change category, then stop. It never edits a source
  or test tree, and never names a code-side orchestration — which delivery flow
  picks the brief up is the user's decision, made after reading it.

**The `from-spec-` direction covers both from scratch and update.** The change
category is that axis, and counterpart resolution picks between them before the
brief is written: `new functionality` when no counterpart exists at all, `change
to existing behaviour` when one exists and the chapter asks for more, and
`defect` when one was believed to already satisfy an agreed chapter and does not.
That is why a `from-spec-` skill reads code — not to change it, but to establish what is
already there so the brief asks only for the delta, and an update brief lists
where the current behaviour lives.

Five kinds, two directions each:

| Kind | Target | `type` value(s) | Spec-side write |
|------|--------|-----------------|-----------------|
| `aggregate` | `.domain/<context>/domain.md` | `aggregate`, `entity`, `value-object`, `enum`, `shared-value-objects`, `shared-enums`, `domain-event` | `orch-domain` |
| `domain-service` | `.domain/<context>/domain.md` | `domain-service`, plus `domain-event` for events the service itself raises | `orch-domain` |
| `feature` | `.domain/<context>/features.md` | `feature`, `sub-feature` | `orch-domain` |
| `building-block` | `.arc42/05-building-block-view.md` | none — `.arc42` defines no value set | `orch-arc42-content` |
| `design-component` | `.design/component-libraries.md` | none — `.design` defines no value set | `orch-design` |

**The aggregate is the unit, not its parts.** One pass covers the root, every
entity, value object, and enum it owns, the shared value-object and enum
groupings, and the domain events it raises. An aggregate is a consistency
boundary and its parts are only meaningful in terms of that boundary, so
capturing them separately would mean reading the same root several times and
deciding the boundary several times, with several chances to decide it
differently — and building them separately would produce work items that cannot
land independently.

A **domain service** is the deliberate exception: it is defined by coordinating
across boundaries rather than living in one, so folding it into a boundary's pass
would be backwards. It keeps its own pair, and owns the events it raises itself.

**`to-spec-feature` runs the application.** `features.md` is the one knowledge
file written from the user's point of view, so that pass starts the app, walks
the feature, and captures a screenshot per step — reading a controller tells you
a route exists, while using the feature tells you what the product lets someone
do, in what order, with what wording. It prefers the repository's own runtime and
QA workflows (`qa:aspire-run`, `qa:playwright-screenshot`) where installed, runs
only against a local or disposable environment, never exercises a destructive
step to document it, and keeps the screenshots as report evidence rather than
committing them to a knowledge folder.

**`naming.md` term chapters have no pair of their own.** They are written through
`orch-domain`, and populated incrementally by the capture passes: whenever one
resolves a counterpart by inference rather than by an existing alias, it proposes
a term with the discovered code name as an `alias`, which turns a one-off
inference into a durable pairing for the next pass. The context folder itself, including
`naming.md`, is created by `orch-domain`.

`.tech` has no pair here — `knowledge-tech-update` already covers that direction
— and neither does `.backlog`.

The shared rules live once in `assets/code-sync-protocol.md`, which all 10 skills
reference and none repeats: counterpart resolution, the evidence rules (including
why unit tests are first-class evidence for capture rather than a cross-check), a
five-way drift verdict (`aligned`, `code-ahead`, `spec-ahead`, `conflict`,
`unresolved`, where `conflict` always stops and asks), the status rules, index
regeneration, and a shared report table.

Counterpart resolution deliberately uses **no metadata field** linking a chapter
to a code path — a path in a `meta` block rots on the first refactor and gives no
signal when it does. It goes through `naming.md` `aliases`, then the `.arc42`
building-block view, then the observed naming convention, and reports
`unresolved` rather than guessing.

The dependency on the `orch-*` skills is one-way. A `to-spec-` skill names its
folder's orchestration and hands over grounded input; no `orch-*` skill knows
these skills exist.

**Trigger keywords:** `document what we built`, `capture from code`,
`.domain is stale`, `build the aggregate we agreed`, `build this chapter`,
`change brief`, `spec code drift`, `the code has an invariant the chapter omits`

### Instructions (auto-applied)

| File | Pattern | Purpose |
|------|---------|---------|
| `knowledge-chapter-metadata.instructions.md` | all six folders | Required `meta` block fields, `status` ladders, `type` value sets, and the `tests` test-case link format |
| `knowledge-domain.instructions.md` | `.domain/**` | Bounded-context structure and ubiquitous language |
| `knowledge-arc42.instructions.md` | `.arc42/**` | arc42 chapter, ADR, and TDR structure |
| `knowledge-tech.instructions.md` | `.tech/**` | Technology graph, versions, maturity ladder |
| `knowledge-design.instructions.md` | `.design/**` | Design guideline scope and token rules |
| `knowledge-ai.instructions.md` | `.ai/**` | AI usage per flow stage, the adoption ladder, and the `.tech` boundary |
| `knowledge-backlog.instructions.md` | `.backlog/**` | Work-item chapter structure |
| `knowledge-derived-artifacts.instructions.md` | `**/_meta/**` | Placement, naming, and envelope rules for generated files |
| `knowledge-naming.instructions.md` | knowledge folders and `_meta` | Underscore and dot prefixes, kebab-case, no redundant suffixes |

Every glob is scoped to the knowledge folders, so the plugin stays silent in
repositories and files that have not adopted the convention.

### Extension: `knowledge-canvas`

Renders the knowledge graph as an interactive canvas — chapters as nodes,
`related` / `depends-on` / `implements` as edges — using the same graph code the
generator writes, so the live view and the committed indexes never disagree. The
node inspector lists a chapter's test links with the command that runs each one,
which is where a "run this test" button goes.

### Tooling: `knowledge-meta`

```powershell
./build/Update-KnowledgeIndex.ps1                      # refresh, and say what moved
./build/Update-KnowledgeIndex.ps1 -Scope .tech
./build/Update-KnowledgeIndex.ps1 -Check               # validate, write nothing
```

```bash
node .github/tools/knowledge-meta/build.mjs            # write every adopted scope
node .github/tools/knowledge-meta/build.mjs --check    # CI: verify only
node .github/tools/knowledge-meta/build.mjs --scope .tech
node .github/tools/knowledge-meta/build.mjs --root ../other-repo
```

Output is deterministic — no timestamps — so a clean `git diff` proves the
committed indexes are current. See `tools/knowledge-meta/README.md` for the
output shape and for when to refresh.

### Tooling: `knowledge-tech`

```bash
node .github/tools/knowledge-tech/dotnet-packages.mjs --root .
node .github/tools/knowledge-tech/frontend-packages.mjs --root .
```

The inventory scripts emit deterministic JSON from repository manifests. Use them
as the source of truth for package-derived `.tech` facts; use repository analysis
for technologies that do not appear in package manifests.

### Assets

| File | Purpose |
|------|---------|
| `assets/workflows/knowledge-meta.yml` | CI workflow template installed by the init skill: fails on broken references, warns on drifted indexes |
| `assets/workflows/knowledge-meta-nightly.yml` | Scheduled index refresh; opens one pull request when the output drifted, nothing when it did not |
| `assets/build/Update-KnowledgeIndex.ps1` | On-demand index refresh, with `-Scope` and `-Check`; reports which index files moved |
| `assets/routing-snippet.md` | Optional repository-local context-loading and routing policy, plus the `Read(_meta/**)` deny rule that keeps generated indexes out of agent context |
| `assets/code-sync-protocol.md` | Shared rules for the `to-spec-*` / `from-spec-*` skills: counterpart resolution, evidence rules including why unit tests are first-class evidence for capture, the five-way drift verdict, status rules, index regeneration, and the report table. An asset rather than an instruction, because an honest `applyTo` glob for these rules would have to cover source trees and would break the plugin's silence in non-adopting repositories |

### Hook configuration

- `hooks.json` adds a session-start guardrail: knowledge folders are task-scoped
  context rather than baseline context, `meta` blocks are mandatory on every
  chapter, and `_meta/` is never hand-edited.

## 0.15.0: `status` optional at rest

**A behaviour change in three folders, and a sweep worth doing.** `status` is no
longer required everywhere. In `.domain`, `.arc42`, and `.design` it is
**optional**, and an absent field means the resting value `active`:

```markdown
## Order

\`\`\`meta
type: aggregate
\`\`\`
```

`status` is written only while a chapter is in transition (`draft`, `proposed`)
or carries a standing warning (`deprecated`). It stays **required** in `.tech`,
`.ai`, and `.backlog`, and the asymmetry is the point: the field was doing three
unrelated jobs, and only one of them has a resting value.

| Folder | What `status` is | Resting value |
|---|---|---|
| `.domain`, `.arc42`, `.design` | editorial maturity — how settled the writing is | `active`, omitted |
| `.tech`, `.ai` | a *rating* on an adoption ladder | none; an unrated technology is not a `candidate` one, and a radar built from omissions renders blank |
| `.backlog` | a work state | none; an item with no status is untracked, not `done` |

Two rules make the difference safe:

- **The `meta` fence stays even when the block ends up empty.** `.arc42`,
  `.backlog`, and `.design` define no `type`, so a settled chapter with no
  relations has nothing left inside its fence. The fence is what marks the
  heading as an addressable chapter — one graph node per heading that carries a
  block — so deleting it as noise drops the chapter out of `graph.json` and out
  of every reference pointing at it.
- **The generator resolves an absent status rather than passing null through.**
  Both derived artifacts carry the resolved word plus `"statusDeclared": false`
  on the entries where that happened, so a viewer badges them correctly and a
  consumer that cares can still tell "at rest" from "nobody said". See
  `tools/knowledge-meta/README.md`.

Stating the resting value explicitly is reported as a warning, so one state does
not end up with two spellings. To adopt: re-sync `.github/tools/knowledge-meta/`,
run `build.mjs`, and delete the `status: active` lines it now flags — keeping the
fence behind them.

## 0.12.0: the `.ai` folder

**Additive, and nothing existing changes.** A sixth knowledge folder, `.ai`,
records **how the project develops with AI** — which practice, agent, skill,
hook, model, or guardrail is used at which position in the development flow,
the concepts underneath them, and how far adoption has actually got.

```
.ai/
  adoption-map.md       # root: the flow, the stage table, the adoption diagram
  01-<stage>.md         # one file per stage of the development flow
  02-<stage>.md
  concepts.md           # cross-stage concepts and practices
```

It is organized by **flow, not by tool**. A chapter sits in the stage file for
the position where it is used, and answers one question: at this point in how we
work, what do we use AI for, and is that real yet?

```markdown
## Agent-Driven TDD

\`\`\`meta
status: trial
type: practice
depends-on: [".tech/tooling.md#claude-code"]
\`\`\`

The failing test is written with the agent before any implementation.

- **Used for** — every change with a testable outcome.
- **Adopted by** — one developer, on feature branches, since 2026-07.
- **Evidence** — three merged pull requests; no measured cycle-time claim yet.
- **Limits** — not used for spike branches.
```

Three decisions are worth knowing before adopting it:

- **`.tech` stays the registry.** A tool with a vendor and a version is a
  `.tech` chapter, as it always was; `.ai` never re-registers it and points at
  it with `depends-on` instead. The test is *if it has a vendor and a version,
  it is `.tech`* — so "we use Claude Code, version X" is `.tech`, and "at Specify
  we draft chapters with it, `trial`" is `.ai`. The link is one-way: `.tech`
  chapters never point back.
- **Stage files are numbered, and the stage set is the repository's own.**
  `01-discover.md`, `02-specify.md`, `03-build.md` — the number is what makes the
  folder read in the order the work happens. The generator's numbered-set rule
  already handles that, so `.ai` needed no new ordering machinery: root first,
  stages by number, `concepts.md` after them. No flow is prescribed.
- **The status ladder is `.tech`'s**, deliberately: `candidate`, `trial`,
  `adopted`, `hold`, `retired`. One adoption vocabulary, applied to two
  different subjects — `.tech` rates a technology, `.ai` rates a way of working
  with one. A tool that is `adopted` whose use at a stage is still `trial` is
  the normal case, and the reason the folder exists. A `retired` chapter is
  never deleted: what was tried and dropped is the part nobody can reconstruct
  later.

`type` values are `practice`, `agent`, `skill`, `plugin`, `mcp-server`, `hook`,
`workflow`, `model`, `concept`, and `guardrail` at chapter level, and
`adoption-map`, `stage`, or `concepts` at file level. One folder-specific field
is added, `stage` — a list of stage slugs, on `concepts.md` chapters that span
the flow, omitted inside a stage file where it would only restate the filename.
Like `roadmap` it is a plain-slug attribute and produces no graph edges.

`schemaVersion` stays at 4 — `.ai` produces the same node and edge shapes every
other folder does. To adopt: re-sync `.github/tools/knowledge-meta/` from this
plugin, run `knowledge-base-init` (or create the folder by hand), add `.ai/**`
to the CI workflow's `paths` filters, and route edits through `orch-ai`.

## 0.11.0: invariants as a table

**Additive, and no migration.** Aggregate chapters in `.domain/<context>/domain.md`
now carry an `### Invariants` sub-section instead of describing their rules in
prose:

```markdown
## Order

\`\`\`meta
type: aggregate
tests: [unit:dotnet:Ordering.Domain.Tests.OrderTests]
\`\`\`

An order a customer is assembling, and the consistency boundary for its lines.

### Invariants

| Rule | Enforced at | Evidence |
|---|---|---|
| An order has at least one line before it can be confirmed | `Confirm()` | `Ordering.Domain.Tests.OrderTests.CannotConfirmAnEmptyOrder` |
| A confirmed order cannot be cancelled | `Cancel()` | `untested` |
| Line quantities are positive | `AddLine()` | `Ordering.Domain.Tests.OrderTests.RejectsZeroQuantity` |
| Whether a partially refunded order may be re-confirmed | `open` | Nobody owns this yet — asked in the 2026-08 session |
```

The rules were always the most valuable content in `.domain`, and the only
content with no shape. `from-spec-aggregate` already required each invariant written
out in full with one acceptance check per rule, and `to-spec-aggregate` already
mined unit tests for them — both against a paragraph, which is not quotable,
countable, or linkable. Three columns fix that:

- **`Rule`**, one per row, because a row is the unit a brief quotes and a check
  is derived from. Merged rows silently merge acceptance checks.
- **`Enforced at`** is the column prose loses: the constructor, or the named
  transition. It is what tells a build pass where the guard clause belongs, and
  a rule whose enforcement point cannot be named is usually a caller's rule
  rather than an invariant.
- **`Evidence`** is a `tests` selector or the literal `untested`. Coverage
  becomes visible per rule instead of per chapter.

An **`open`** row is the Event Storming hot spot, kept in place. The sync
protocol already said an unsettled rule is recorded as an open question rather
than captured as fact, but never said where it lived; now it does. An `open` row
does not block a chapter reaching `active` — a model can be current and still carry an
unanswered question — but `from-spec-*` reports it as a decision needed rather than
briefing a rule nobody agreed.

Nothing to re-sync: the generator needs no change, no `type` value is added, and
`schemaVersion` stays at 4. `### Invariants` is a structural sub-section like
`### Payload`, so `build.mjs --check` reports the same expected "heading with no
`meta` block" warning for it. To adopt, move an aggregate's rules out of its
prose as you next touch it — or run `to-spec-aggregate`, which now writes the
table directly from the guard clauses and tests it reads.

## 0.10.0: linking test cases

**Additive.** A new optional `tests` field, on chapter and file blocks in every
folder, records the test cases that assert what a chapter claims:

```markdown
## Order

\`\`\`meta
type: aggregate
tests: [unit:dotnet:Ordering.Domain.Tests.OrderTests, e2e:playwright:tests/e2e/checkout.spec.ts#Guest checkout completes]
\`\`\`
```

Each entry is `<level>:<runner>:<selector>`, coarse to fine: a level (`unit`,
`integration`, `e2e`) so a reader can see whether a capability is covered end to
end, a runner so a command can be derived, and that runner's own selector so it
can be handed over verbatim.

This is the one link from a chapter into a code tree that this convention allows,
and the reason is that it is **executable**. A source path in a metadata block
rots on the first refactor and gives no signal when it does — which is why
`code-sync-protocol.md` pairs chapters to code through naming instead. A test
identifier that stops resolving fails a run, out loud, in the same CI that runs
the suite.

`testCommand()` in `tools/knowledge-meta/metadata.mjs` turns one entry into an
argv and executes nothing, so a "run this test" affordance in a viewer and the
command this convention documents are the same one:

```js
testCommand("unit:dotnet:Ordering.Domain.Tests.OrderTests");
// → { level, runner, selector,
//     command: ["dotnet", "test", "--filter", "FullyQualifiedName~Ordering.Domain.Tests.OrderTests"] }
```

`dotnet`, `playwright`, `vitest`, `jest`, and `pytest` have command mappings; a
runner outside that set still records what covers the chapter and is reported as
a warning, because nothing can offer to run it. Add one by extending
`TEST_RUNNERS` in `metadata.mjs`.

Nothing existing breaks if you adopt none of it. To adopt: re-sync
`.github/tools/knowledge-meta/` from this plugin, add `tests` where a chapter has
tests worth naming, and regenerate — `graph.json` nodes and `index.json` file
entries carry the field, and `schemaVersion` goes to 4. A `to-spec-*` pass now
records the tests it read as `tests` entries, so the fastest way to populate an
adopted repository is to capture the chapters that already have suites.

## Migrating to 0.9.0: the `order` field is removed

**Breaking for every repository that adopted the convention before 0.9.0.** The
file-level `order` field is gone from the metadata schema, and `build.mjs
--check` reports an **error** on every block that still carries one.

A metadata block describes the thing it sits under, and a directory's reading
order is not a property of one document inside it. So reading order moved out of
metadata and into the folder convention: each directory's root document is read
first — `.domain/context-map.md`, a bounded context's `domain.md`,
`.tech/technology-graph.md`, `.design/README.md` — then that folder's prescribed
files in the sequence its instructions file documents, then anything else
filename-sorted. `.arc42` and `.backlog` sort by filename outright, as `.arc42`
always did. Nothing is authored per repository any more, so adding a file needs
no declaration and the whole class of drift between a list and its directory is
gone. The convention is encoded once, in `DIRECTORY_CONVENTION` in
`.github/tools/knowledge-meta/outline.mjs`.

To migrate, re-sync `.github/tools/knowledge-meta/` from this plugin, then:

1. **Delete every `order` field.** They are all on file-level blocks:
   `.domain/context-map.md`, each `.domain/<context>/domain.md`,
   `.tech/technology-graph.md`, `.design/README.md`. Remove the line; change
   nothing else in the block.
2. **Check the order you get is the order you want.** Run
   `node .github/tools/knowledge-meta/build.mjs` and read the resulting
   `index.json`. Where a hand-declared order disagrees with the convention, the
   convention wins — a repository-specific sequence is no longer expressible, by
   design.
3. **Give each directory the root document its folder names.** A directory
   without one is reported as a warning and simply sorts by filename.
4. **Commit the regenerated `_meta/` indexes.** Entry order may move; the
   `schemaVersion` does not change, because the derived shape is identical.

`.arc42` repositories are unaffected: they never declared `order`.

### New in the same release: `number`, `date`, `index`

Three **additive** fields give the generator what it needs to build a good
outline without any document listing its siblings. Nothing existing breaks if you
adopt none of them.

| Field | Level | What it does |
|---|---|---|
| `number` | file | This document's number in its directory — arc42 chapter 9, ADR 7, TDR 2. A numbered filename (`09-…`, `7-…`, `ADR-0007-…`) supplies it on its own, so the field is for when the filename cannot. A numbered directory sorts by number, so 10 follows 7 instead of following 1. |
| `date` | file or chapter | The calendar day the document records — a decision taken, debt logged — as `YYYY-MM-DD`. Not a modification timestamp. |
| `index` | file | `index: root` makes this document its directory's entry point, overriding the convention; `index: exclude` keeps it out of `index.json` while leaving it in `graph.json`. |

Worth doing on adoption: mark `.arc42/adr/README.md` and `.arc42/tdr/README.md`
with `index: root` — neither folder has a convention root, so without it each is
a bare numbered list — and give existing ADRs and TDRs their `date`. Both show up
in `index.json` and on `graph.json` file nodes immediately after a regenerate.

## Migrating to schema version 5

Schema version 5 is **additive** over 4 in shape, with one semantic change worth
knowing about. `status` on a `graph.json` node and on an `index.json` file entry
is now the block's **effective** status: where `.domain`, `.arc42`, or `.design`
omits the field, the artifacts carry the resolved resting value `active` rather
than `null`, plus a new optional `"statusDeclared": false` marking that the file
did not state it. Declared statuses are emitted exactly as before, so the only
diff on an unswept corpus is the bumped `schemaVersion`.

A consumer that read `status` to badge or group needs no change — it gets a real
value where it previously would have got `null`. A consumer that needs to know
whether a person actually chose the value reads `statusDeclared`.

## Migrating to schema version 4

Schema version 4 is **additive** over 3: both derived artifacts gained the
optional `tests` field described under "0.10.0: linking test cases" above, and
nothing else about their shape changed. Re-sync
`.github/tools/knowledge-meta/` and regenerate; the diff is the new field where
a document declares one, and the bumped `schemaVersion`.

## Migrating to schema version 3

Schema version 3 is **additive** over 2 and needs no authoring changes. A `file`
entry in `index.json` may now carry two optional fields — `summary`, the
document's lede, and `diagrams`, how many mermaid blocks and images it embeds —
so a viewer can render a knowledge folder's list view without opening any
Markdown. `graph.json` is unchanged apart from the version number.

Re-sync `.github/tools/knowledge-meta/` from this plugin and regenerate; the
diff is the new fields and the bumped `schemaVersion`. Also install the two
refresh assets that ship with this version — `assets/build/Update-KnowledgeIndex.ps1`
and `assets/workflows/knowledge-meta-nightly.yml` — and re-copy
`assets/workflows/knowledge-meta.yml`, whose staleness step now warns instead of
failing. See `knowledge-derived-artifacts.instructions.md` for the policy and
for the freshness contract a runtime consumer of these indexes has to honour.

## Migrating to schema version 2

Schema version 2 moves the *kind* of a chapter out of its heading and into a
`type` metadata field. A repository written against version 1 keeps parsing,
but `build.mjs --check` reports errors until it is migrated. Re-sync
`.github/tools/knowledge-meta/` from this plugin first, then:

1. **Strip kind prefixes from `.domain` headings.** `## Aggregate: Order`
   becomes `## Order`; the same for `Domain Service:`, `Domain Event:`,
   `Feature:`, `Sub-feature:`, and `Term:`. File titles lose theirs too —
   `# Domain: Order Management`, `# Features: Order Management`, and
   `# Naming: Order Management` all become `# Order Management`.
   `## Shared Value Objects` and `## Shared Enums` keep their headings: those
   name a grouping, not a single thing. `.domain/context-map.md` has no context
   name to fall back to, so prefer titling it after the system the map covers
   (`# Backlog`), with `type: context-map` carrying the kind; a plain
   `# Context Map` is also accepted. If it already has a sensible title, leave
   it — this step is about stripping *kind prefixes*, and that file never had
   one.
2. **Add `type` to every `meta` block.** Values come from the folder's own
   instructions file — `knowledge-domain.instructions.md` for `.domain`,
   `knowledge-tech.instructions.md` for `.tech`. File-level blocks take a
   file-level value (`domain`, `features`, `model`, …) matching the filename.
   `.arc42`, `.backlog`, and `.design` define no value set and take no `type`.
3. **Promote Entity, Value Object, and Enum sub-chapters one level.** Delete
   the `### Entities`, `### Value Objects`, and `### Enums` grouping headings
   and lift their `#### <Name>` children to `### <Name>` directly under the
   aggregate. Each now carries its own `meta` block with `type: entity`,
   `type: value-object`, or `type: enum` — they are no longer covered by the
   parent aggregate's block.
4. **Rewrite every anchor.** Any `related` / `depends-on` entry pointing at a
   prefixed heading now points at the bare name:
   `#aggregate-order` → `#order`, `#feature-checkout` → `#checkout`,
   `#term-basket` → `#basket`. Anchors in prose links need the same treatment.
5. **Rename `.tech`'s `kind` field to `type`.** Easy to miss, because it is a
   separate mechanical edit in a different folder from all the work above, and
   nothing fails if you skip it. Values are unchanged — only the field name
   moves, so this is a find-and-replace of `kind:` to `type:` across
   `.tech/*.md`. `kind` remains supported as a deprecated alias that reports a
   **warning, never an error**, so `.domain` can be migrated and landed on its
   own and `.tech` can follow in a later commit.
6. **Regenerate and check.**

   ```bash
   node .github/tools/knowledge-meta/build.mjs
   node .github/tools/knowledge-meta/build.mjs --check
   ```

   Run `knowledge-base-validate` for anything still reported.

## Folder structure

After running `knowledge-base-init`, a repository that adopted everything has:

```
.arc42/
├── _meta/{graph.json,index.json}
└── <chapter>.md
.domain/
├── _meta/{graph.json,index.json}
└── <bounded-context>/<chapter>.md
.tech/
├── _meta/{graph.json,index.json}
├── technology-graph.md
└── <layer>.md
.design/
├── _meta/{graph.json,index.json}
└── <guideline>.md
.backlog/
├── _meta/{graph.json,index.json}
└── <item>.md
.ai/
├── _meta/{graph.json,index.json}
├── adoption-map.md
├── <nn>-<stage>.md
└── concepts.md
_meta/{graph.json,index.json}          # repository-wide rollup
build/
└── Update-KnowledgeIndex.ps1          # on-demand index refresh
.github/
├── tools/knowledge-meta/              # the generator
├── tools/knowledge-tech/              # deterministic package inventory scripts
├── workflows/knowledge-meta.yml       # the CI check
└── workflows/knowledge-meta-nightly.yml   # the scheduled index refresh
```

## Enforcement

Five layers, weakest to strongest:

1. **Instructions** auto-apply on the governed paths in every repository where
   the plugin is installed.
2. **The session-start hook** stops agents treating knowledge folders as baseline
   context or hand-editing derived files.
3. **`meta` block rules** make every chapter's relationships explicit and
   checkable.
4. **`build.mjs --check`** fails on unresolved references and schema violations.
5. **The CI workflow** fails the pull request on broken references or a `meta`
   block that violates the schema. Drifted `_meta/` indexes are reported as a
   warning, not a failure — making every knowledge pull request carry a
   regenerated index is what turns those files into merge conflicts. Refresh is
   deliberate instead: `build/Update-KnowledgeIndex.ps1` on demand, the nightly
   workflow on a schedule. A consumer that reads an index at runtime owes the
   other half of that contract — re-read any source newer than the index.

## License

MIT
