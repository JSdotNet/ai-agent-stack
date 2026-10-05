---
name: tdd-rules
description: The test-first rules phase-implement follows at every seam — where a test goes, what makes it worth keeping, the anti-patterns, when to mock, and the rules of the red-green loop — ported from Matt Pocock's /tdd.
---

# Test-First Rules

Ported from Matt Pocock's `/tdd` and `/implement` (`mattpocock/skills@4588b32`). They apply on
every cycle, before and during the loop. The repository's own rules win where they say more:
a test framework, a naming convention, a test-first skill its phase entry binds.

## Seams

A **seam** is the public boundary a test observes behaviour at, never an internal. Tests go
only at the seams `phase-scope` recorded, so the effort lands on the critical paths rather
than on every edge case.

- **No seams recorded** — the quiet failure the sources name, where test-first is skipped
  without a word. Name them first: each public boundary, the behaviour it proves, the
  criterion it covers. Write them to `implement.md` before any test, so review and the gate
  see them. Never skip test-first silently.
- **A defect's first seam** is the test that reproduces it, red before the fix.
- **Browser and end-to-end tests never go first** — too slow for the loop. They belong to
  `phase-verify` and the e2e suite `phase-build-test` runs.

## A test worth keeping

- Verifies behaviour through the public interface, and reads like a specification:
  "user can check out with a valid cart". It survives a refactor that keeps behaviour.
- Names a capability, not a mechanism. One logical assertion.
- Takes its expected value from an independent source: a known literal, a worked example, the
  spec — never recomputed the way the code computes it.

## Anti-patterns

- **Implementation-coupled** — mocks an internal collaborator, tests a private method,
  asserts call counts or order, or verifies through a side channel such as a database query
  instead of the interface. The tell: it breaks on a refactor that kept behaviour.
- **Tautological** — the assertion restates the implementation, so it passes by construction.
- **Horizontal slicing** — every test first, then every line of code. It tests an imagined
  shape. Work vertically: one test, one implementation, repeat; the first is a tracer bullet
  through the whole path.

## Mocking

Mock at system boundaries only: external APIs, time, randomness, and sometimes the file system
or the database (prefer a test database). Never mock a module the repository owns. Inject a
boundary rather than constructing it inside, and give it one function per operation rather than
one generic fetcher, so each mock returns one shape.

## The loop

- **Red before green.** The failing test first, then only enough code to pass it — no code for
  a test not yet written, no speculative feature.
- **One seam per cycle.** One test, one minimal implementation, then the next.
- **No refactor step.** Refactoring is what `phase-review` asks for, and the next fix round does.
- **Fast feedback.** Compile often and run the touched test files; the full suite runs once,
  in `phase-build-test`.
