---
name: phase-scope
description: 'Shared Scope phase for flow-code and flow-spec: restate the request, derive the kind and the acceptance criteria, find the impacted paths and the rules that govern them, select the devbook chapters every later phase loads, and for code write the spec implement builds on. Invoked by the flow-runner with a brief file; never by a person.'
context: fork
---

# Phase: Scope

Open the reply with `delivery@<version>`, `version` read from `../../.claude-plugin/plugin.json`, not recalled.

Does:

- Restates the request and derives the kind and acceptance criteria (flow-spec: the folder and the chapter kind)
- **Selects the relevant devbook chapters**: those naming the impacted paths or the scope's terms, then their `related` and `depends-on` links, read through the devbook database where present
- Finds the impacted paths and the rules that govern them
- For code: turns it into the spec implement builds on, with seams, constraints, integration points, and for a refactor the target layout and references to update
- Escalates a new decision or bounded context to flow-spec
- Writes the scope record and the chapter list every later brief draws from

Doesn't:

- Implement anything
- Load a devbook folder whole, or read annotation fences as content
- Write devbook chapters (drafting and spec-check do)
- Adopt a folder (that's devbook:init or update)

## Context

Loads the brief's request and origin, the repository instructions, the rule files whose `paths` match the impacted paths, and the chapters it selects. Never loads the run transcript, a whole devbook folder, an `annotation` fence, or anything under `_meta/`. Refuse a brief that asks for more.

## Steps

1. **Restate** the request in one or two sentences — for a defect, observed versus expected. Derive the kind from the table in the calling flow's `SKILL.md`; in `flow-spec`, the folder and the chapter kind. A folder the repository has not adopted stops here: say so.
2. **Criteria.** At least one measurable acceptance criterion — for a defect, what the regression test proves; for a refactor, the expected tree, updated references, and a green build.
3. **Paths and rules.** The impacted paths and the integration points they touch — for a refactor, every surface encoding the old layout: solution files, manifests, scripts, CI path filters, links, architecture tests — and the instruction files and guideline ADRs that govern them.
4. **Chapters.** Select from the corpus as `node .devbook/_tools/devbook-meta/build.mjs --print` emits it, else by search over the adopted folders: each chapter that names an impacted path or a scope term, then one hop of its `related` and `depends-on`. Each gets an id and one line of why.
5. **Spec, for code.** Seams — each public boundary, the behaviour it proves, the criterion it covers, tagged `frontend` or `backend` — then the constraints and integration points; for a refactor, the target layout and the references to update. A spec the brief carries approved is returned unchanged.
6. **Escalate, never decide.** A new architectural decision, bounded context, or cross-cutting redesign is a question for `flow-spec` per **Escalation** in `../../resources/flow-execution-model.md`; return it, do not resolve it.

## Output

Write `scope.md` into the run folder the brief names: request, kind, criteria, paths, rules, the chapter list, seams and the rest of the spec, open questions. Return its path and a five-line summary, never file contents. The flow-runner accepts the record, asks what only the user can answer, and persists the kind. Phase order: `../../resources/flow-phases.md`.
