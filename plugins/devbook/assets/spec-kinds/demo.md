# Kind: demo

What `capture-specs`, `apply-change`, and `verify-change` need to know about a
demo that `assets/code-sync-protocol.md` does not already say. The protocol
carries the resolution ladder, the evidence rules, the five verdicts, the status
rules, the brief contract, and the report table; this file carries the kind.

| | |
|---|---|
| Chapters | None: a demo is not a chapter. The unit is one `*.demo.html` and every screen, state, anchor, and walkthrough its `demo-model` lists, with the chapters whose `demo` field names it and the `### Requirement:` chapters whose `demo` names one of its walkthroughs |
| File | `.devbook/domain/<context>/demo.html`, a `<page>.demo.html` beside its page, or any other `*.demo.html` a `demo` field names — or the same path under a change's `devbook-delta/domain/<context>/` |
| Folder rule | `devbook-domain.md` for what a demo is and where it lives, `devbook-chapter-metadata.md` for the `demo` field, and `resources/demo-address.md` for what an address resolves against |
| Context to load | The demo's `demo-meta` and `demo-model`, and the `main[data-demo-app]` screens; the page it belongs to, and the `requirements.md` chapters whose `demo` names its walkthroughs; `context.md` or `actors.md` for the actor and switch keys its panel lists |
| Plan target | None. Only `/prototype` writes a demo; see **Capturing** below |
| Index scope | `--scope domain` |
| Extra input | For capturing, a runnable environment on the terms `feature.md` sets: local or disposable, never shared or production |

## Location is agreement

A demo has no `status`, and never will: the file knows its question and nothing
else, per `.devbook/arc42/adr/demos.md`. Where it sits is the status row of the
protocol's table:

| Where the file sits | Reads as |
|---|---|
| `.devbook/domain/<context>/` | `active` — the agreed screens |
| A change's `devbook-delta/domain/<context>/` | The change's demo, under the protocol's rule for a change: pending truth once the change is agreed, `proposed` before |
| Anywhere else | A prototype. Out of scope for all three skills: it was never agreed |

A demo is not a sync unit of its own: `units.mjs` lists none, and a demo is
part of the fingerprint of the page it belongs to. Take it as the scope when a
person names the file, or as part of a context or folder scope that holds one.

## What is compared

A demo shows four things, and each is compared with what the application
renders — read from its UI source by `verify-change`, observed running by
`capture-specs` — and with the e2e tests a requirement's `tests` names beside
the walkthrough its `demo` names.

| Demo element | Compared with | Not compared |
|---|---|---|
| Screens — `section[data-screen]` and `demo-model.screens` | The routes, pages, and views the product reaches, and the navigation between them: a screen's place in the shell, the screens its `data-goto` and links reach | Pixel layout and styling, which are `design-component`'s; the template's managed region and control panel |
| States — a screen's `of` children with `data-state` | The empty, error, refused, and completed states the view renders, and what moves it into each | Transitional states nobody stops at — a spinner, a fade |
| Copy | The labels, headings, messages, and button text the product shows, and the ubiquitous-language terms they carry | The hard-coded data: names, amounts, and rows are there at real density, never as seed data or a fixture |
| Walkthroughs — `demo-model.walkthroughs`, one per `#### Scenario:` | The scenario they play and the e2e test the same requirement's `tests` names: the steps the test drives, in order, on the screens the walkthrough visits | A walkthrough no requirement names, beyond the coverage warning below |

The panel's switches pair by key. A role, flag, or setting the panel lists is
the `key` of an actor or switch chapter, and what `data-if-role`,
`data-if-flag`, and `data-if-setting` show and hide is compared with the role
and flag checks that gate the same view in code. A panel key no chapter carries
is `unresolved`, not a capture: the `actor` or `setting` kind settles it first.

Counterpart resolution runs the protocol's ladder per screen: the `aliases` of
the chapters whose `demo` names the screen, then the building block that holds
the user interface, then the repository's routing convention. A screen nothing
in the product matches is `spec-ahead` once resolution has looked; a screen
several views could be is `unresolved`.

A requirement whose `demo` names a walkthrough and whose `tests` reach no `e2e`
test, and a walkthrough no requirement names, are coverage warnings beside the
verdict: the walkthrough shows the scenario, and only the test proves it.

## The verdicts here

| Verdict | For a demo |
|---|---|
| `aligned` | Every screen, state, copy string, and walkthrough step has its counterpart, and the e2e tests drive the steps the walkthroughs show |
| `code-ahead` | The product renders a screen, a state, a step, or copy the demo does not show. A user-interface change that starts in code, with no demo revision, lands here |
| `spec-ahead` | The demo shows a screen, a state, a step, or copy the product does not render, or a walkthrough step its e2e test does not drive |
| `conflict` | Both have the screen and disagree on what it means: a walkthrough step the product refuses, a screen a role sees that the code withholds, copy naming one term where the code uses another for a different concept |
| `unresolved` | A screen with no single counterpart, or a panel key with no chapter |

Copy that differs and names the same concept is `code-ahead` when the
product's wording is the ubiquitous language's and `spec-ahead` when the
demo's is; when neither carries the term, it is `unresolved` and the term is
the question.

## Capturing — `capture-specs` never writes a demo

`capture-specs` reaches the verdicts here and never plans or writes a demo, in
plan mode or write mode: only `/prototype` writes one, and only a change's
delta lands it in `domain/`. For a `code-ahead` row the action is a `/prototype`
revision started from the current demo with its screen ids kept, carried by a
change, per `.devbook/arc42/adr/demos.md`.

Run the application as `feature.md` says, walk each screen and walkthrough the
demo lists, and record what the product shows beside what the demo shows. The
chapters around the demo are still capture's: a promise the product keeps and
no requirement states is a `feature`-kind entry in the same plan, and a chapter
that shows a screen and has no `demo` entry for it may gain one — an address
that resolves against `demo-model`, never a screen id invented for it.

## Applying — `apply-change`

A demo is briefed with the page it belongs to, never alone: its screens are the
picture of the outcomes, not the outcomes. The outcomes and acceptance checks
are the `### Requirement:` chapters whose `demo` names a walkthrough, quoted as
they stand; each walkthrough is carried as the demo address beside its
scenario, so the implementer sees what the scenario looks like. A screen or
state no requirement covers is carried as an address and named as a
requirement the page still owes.

Ubiquitous language: the copy's terms, with the `aliases` of the chapters that
name them. Out of scope: the hard-coded data, the panel, the template's region,
styling beyond the declared tokens, and every screen of the same demo the brief
does not name. Acceptance checks: each screen and state reachable as the demo
shows it, the copy as written, each walkthrough's steps driven by an e2e test.

## Do not

- Do not write, revise, or trim a demo, in any mode — that is `/prototype`'s,
  through a change.
- Do not read a prototype outside `domain/` or a change's delta as a spec.
- Do not compare the hard-coded data, the panel, or the managed region.
- Do not treat a walkthrough as proof: the e2e test its requirement names is.
- Do not add a `status`, a page name, or a verdict to a demo.
