# Risks and Technical Debt

```meta
number: 11
related: [".devbook/arc42/tdr/README.md", ".devbook/arc42/09-architecture-decisions.md"]
```

What this repository owes, and what it is exposed to. Records live in
[`tdr/`](tdr/README.md) and are linked from here rather than restated, the same way
[chapter 9](09-architecture-decisions.md) is meant to relate to `adr/`.

## Technical Debt

```meta
related: [".devbook/arc42/tdr/README.md"]
```

| Record | Logged | Severity | State | In one line |
| --- | --- | --- | --- | --- |
| [1. The body budgets are unenforced](tdr/1-body-budgets-unenforced.md) | 2026-09-04 | Low | in-progress | AGENTS.md states three body budgets and `check-assets --budgets` reports against them; 8 of 79 budgeted assets meet them, and the kinds that are long by nature are exempted by decision rather than trimmed. |
| [2. fleet names the Claude CLI directly](tdr/2-fleet-names-the-cli-directly.md) | 2026-09-03 | Medium | identified | `fleet` names a host's CLI although no asset here may name one, so on any other host a sweep dispatches nothing — and its manifest does not say so. |
| [3. The devbook asset rename ships no migration](tdr/3-devbook-rename-has-no-migration.md) | 2026-09-05 | Medium | identified | The `knowledge-*` -> `devbook-*` rename moved payload paths with no migration to carry them, so a re-synced repository grows a second spelling of the same tooling. |
| [4. delivery depends on devbook](tdr/4-delivery-depends-on-devbook.md) | 2026-09-07 | Medium | identified | `delivery` declares no dependency, yet five of its flows are named after devbook folders, restate devbook's schema rules, and run devbook's installed generator by path — and one binding has already drifted unnoticed. |
| [5. The derived index is not optional](tdr/5-derived-index-is-not-optional.md) | 2026-09-08 | Medium | identified | devbook ships the derived `_meta/` index as foundation although nothing here reads it, its one consumer is another repository's app, and six foundation skills run the writer against the rule that forbids it. |

Records 1 and 2 were carried out of chapter 9, where they had been written as decisions. Neither is one:
each ends in options rather than a choice, which is the test for whether a record belongs
[here instead](tdr/README.md).

## Risks

```meta
```

No standing risk register. Risks that are real here are consequences of decisions and stay
written where the decision is, because a risk restated away from its cause loses the reason it
is acceptable — see the consequence paragraphs in
[chapter 9](09-architecture-decisions.md), several of which are exactly that.

Open one when a risk exists that no decision produced. Nothing has needed it yet, and an empty
register invites the scaffolding this convention asks authors not to write.

## Known Gaps in This Chapter Set

```meta
```

`adr/` does not exist. All forty-five decisions sit inline in
[chapter 9](09-architecture-decisions.md), which the convention describes as a chapter that
links out and does not restate. That is tolerable while one file holds them and a reader can
still find one by heading; it stops being tolerable when a decision needs its own number, date,
and supersession chain. Split them out then, and this chapter's shape is the model.

Forty-five is past where that argument starts to strain, and both halves of the trigger have
now fired. Three decisions carry a supersession note — one outright, two in part — so the
chain the split was being held for exists; and the count has grown faster than the file's
readability. The next reader to lose a decision in it is the last signal there will be.
