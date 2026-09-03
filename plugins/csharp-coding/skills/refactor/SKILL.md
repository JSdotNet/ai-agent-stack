---
name: refactor
description: 'Surgical code refactoring to improve maintainability without changing behavior. Covers extracting methods, renaming variables, breaking down large functions, improving type safety, eliminating code smells, and applying design patterns.'
---

# Refactor

Use this skill for safe, behavior-preserving refactoring of C# .NET code.

## Principles

- Keep behavior unchanged.
- Make small, testable steps.
- Prefer one refactor concern at a time.
- Validate continuously with `dotnet test` after each step.

## Common Refactoring Patterns

### Extract Method

Split large methods into smaller, named helpers with a single responsibility.

### Rename for Clarity

Update variable, method, or class names to reflect intent and domain language. Use IDE rename (F2) to avoid missing references.

### Remove Code Smells

| Smell | Fix |
|---|---|
| God class | Extract focused classes by responsibility |
| Long method | Extract method, reduce nesting |
| Feature envy | Move method closer to the data it uses |
| Primitive obsession | Introduce value objects or records |
| Duplicate code | Extract shared helper or base class |
| Magic numbers | Replace with named constants or enums |

### Apply Design Patterns

- **Strategy** — replace conditional dispatch with polymorphism.
- **Factory** — centralize complex object creation.
- **Decorator** — add behavior without modifying existing classes.
- **Command** — encapsulate operations for undo/redo or queuing.

### Improve Type Safety

- Replace `string` sentinel values with enums or discriminated unions (records).
- Use `record` types for immutable value objects.
- Enable nullable reference types and eliminate `!` suppressions.

## Validation

Run after every change:

```bash
dotnet test
```

Commit after each passing refactor step.
