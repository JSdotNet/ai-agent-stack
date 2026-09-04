---
name: tdd
description: 'C# .NET Test-Driven Development workflow following Red-Green-Refactor with xUnit, NUnit, or MSTest. Use when writing new features or fixing bugs with tests first.'
---

# TDD — Test-Driven Development for C#

Apply the Red-Green-Refactor cycle for all C# feature work.

## Cycle

### 1. Red — Write a Failing Test

- Write a test that describes the desired behavior before any production code exists.
- Use the test framework already in the project (xUnit, NUnit, or MSTest).
- Test name: `MethodName_Scenario_ExpectedBehavior` (or `WhenX_ThenY` for BDD style).
- Run `dotnet test` and confirm the test fails for the right reason.

### 2. Green — Make It Pass

- Write the minimal production code to make the test pass.
- Do not over-engineer: only implement what the test requires.
- Run `dotnet test` and confirm the test now passes.
- Do not proceed until all tests pass.

### 3. Refactor — Improve Without Breaking

- Apply the `refactor` skill to improve structure, naming, and duplication.
- Run `dotnet test` after every change to confirm no regressions.
- Commit clean, passing code.

## Rules

- One test per behavior.
- Tests must be independent and idempotent.
- No branching or conditionals inside tests.
- Follow the Arrange-Act-Assert (AAA) pattern.
- Mock only external dependencies; never mock code under test.

## Test Frameworks

| Framework | Fact/Test | Theory/Parameterized | Setup/Teardown |
|---|---|---|---|
| xUnit | `[Fact]` | `[Theory]` + `[InlineData]` | Constructor / `IDisposable` |
| NUnit | `[Test]` | `[TestCase]` | `[SetUp]` / `[TearDown]` |
| MSTest | `[TestMethod]` | `[DataRow]` | `[TestInitialize]` / `[TestCleanup]` |

## Validation

Run after each phase:

```bash
dotnet test
```

Or with coverage:

```bash
dotnet-coverage collect -f cobertura -o coverage.cobertura.xml dotnet test
```
