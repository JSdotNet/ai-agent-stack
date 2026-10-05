---
name: smell-baseline
description: The twelve code smells a reviewer checks a diff against where the repository's own rules say nothing — each what it is and how to fix it, from Fowler's Refactoring, chapter 3 — and the two rules that bind them.
---

# Smell Baseline

Twelve smells from Fowler's *Refactoring*, chapter 3, as ported from Matt Pocock's
`/code-review`. They apply where the repository documents nothing, and two rules bind them:

- **The repository overrides.** A documented rule always wins. Where it endorses something
  the baseline would flag, the smell is suppressed.
- **Always a judgement call.** A smell is a labelled heuristic — "possible Feature Envy" —
  never a violation, so it is advisory and never a blocker. Skip anything tooling enforces.

Each reads *what it is* → *how to fix it*. Match it against the diff, never the whole file.

| Smell | What it is | Fix |
| --- | --- | --- |
| Mysterious Name | A function, variable, or type whose name does not reveal what it does or holds | Rename it; if no honest name comes, the design is murky |
| Duplicated Code | The same logic shape in more than one hunk or file of the change | Extract the shared shape and call it from both |
| Feature Envy | A method that reaches into another object's data more than its own | Move the method onto the data it envies |
| Data Clumps | The same few fields or parameters keep travelling together | Bundle them into one type and pass that |
| Primitive Obsession | A primitive or string standing in for a domain concept | Give the concept its own small type |
| Repeated Switches | The same `switch` or `if` cascade on the same type recurs across the change | Polymorphism, or one map both sites share |
| Shotgun Surgery | One logical change forces scattered edits across many files | Gather what changes together into one module |
| Divergent Change | One file or module edited for several unrelated reasons | Split it so each module changes for one reason |
| Speculative Generality | Abstraction, parameters, or hooks for needs the spec does not have | Delete it; inline back until a real need shows |
| Message Chains | Long `a.b().c().d()` navigation the caller should not depend on | Hide the walk behind one method on the first object |
| Middle Man | A class or function that mostly delegates onward | Cut it and call the real target directly |
| Refused Bequest | A subclass or implementer that ignores or overrides most of what it inherits | Drop the inheritance and use composition |
