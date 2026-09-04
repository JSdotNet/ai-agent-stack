---
name: code-optimization
description: 'Optimize C# .NET code for performance, readability, and maintainability. Use when profiling reveals hot paths, or when code has excessive allocations, sync-over-async, or unnecessary complexity.'
---

# Code Optimization — C# .NET

Identify and fix performance, readability, and maintainability issues. Always measure first — do not optimize without evidence.

## Principles

- Measure before optimizing (profiler, benchmarks, or allocation analysis).
- Optimize hot paths first; leave cold paths readable.
- Keep behavior unchanged; validate with tests before and after.
- Apply the `refactor` skill for structural changes; use this skill for performance-focused changes.

## Performance Checklist

### Allocation Reduction

- [ ] Avoid allocating in loops; reuse buffers.
- [ ] Use `Span<T>` / `Memory<T>` for slice operations instead of `string.Substring`.
- [ ] Use `ArrayPool<T>` or `MemoryPool<T>` for large, short-lived arrays.
- [ ] Prefer `StringBuilder` for repeated string concatenation.
- [ ] Use `struct` for small, value-semantic, short-lived objects.

### Async Efficiency

- [ ] No sync-over-async (`.Result`, `.Wait()`, `.GetAwaiter().GetResult()`).
- [ ] Stream large payloads: `GetAsync(..., ResponseHeadersRead)` → `ReadAsStreamAsync`.
- [ ] Use `ValueTask` only when measured to help; default to `Task`.
- [ ] Use `IAsyncEnumerable<T>` for streaming data sequences.

### LINQ and Collections

- [ ] Avoid multiple enumerations of `IEnumerable`; materialize with `.ToList()` or `.ToArray()` once.
- [ ] Use `Dictionary` / `HashSet` for O(1) lookups instead of `.FirstOrDefault()` in loops.
- [ ] Pre-size `List<T>` with capacity when collection size is known.
- [ ] Use `AsSpan()` on arrays where possible.

### I/O and Database

- [ ] Use async I/O end-to-end.
- [ ] Batch database calls; avoid N+1 query patterns.
- [ ] Use `IAsyncEnumerable` for streaming query results (EF Core `AsAsyncEnumerable()`).
- [ ] Apply `CancellationToken` to all I/O calls.

## Readability Checklist

- [ ] Long methods are broken into focused, named helpers.
- [ ] Magic numbers replaced with named constants or enums.
- [ ] Complex boolean conditions extracted to well-named predicates.
- [ ] Switch expressions used instead of if-else chains where appropriate.
- [ ] Pattern matching replaces type-cast chains.

## Validation

Run before and after optimization:

```bash
dotnet test
dotnet build --no-incremental
```

For allocation and performance measurement:

```bash
dotnet-counters monitor --process-id <pid>
dotnet trace collect -- dotnet run
```
