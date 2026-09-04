---
name: csharp-xunit
description: 'xUnit best practices for C# .NET unit testing, including data-driven tests, fixtures, and assertions. Use when writing or reviewing xUnit tests.'
---

# xUnit Best Practices for C#

Write effective unit tests with xUnit covering standard and data-driven approaches.

## Project Setup

- Separate test project: `[ProjectName].Tests`
- Required packages: `Microsoft.NET.Test.Sdk`, `xunit`, `xunit.runner.visualstudio`
- Run tests: `dotnet test`

## Test Structure

- No class attribute required (unlike MSTest/NUnit).
- Use `[Fact]` for single-behavior tests.
- Use `[Theory]` + `[InlineData]` for parameterized tests.
- Name tests: `MethodName_Scenario_ExpectedBehavior`.
- Follow Arrange-Act-Assert (AAA) pattern.
- Use constructor for setup and `IDisposable.Dispose()` for teardown.
- Use `IClassFixture<T>` for shared context within a class.
- Use `ICollectionFixture<T>` for shared context across classes.

## Assertion Guidelines

- `Assert.Equal(expected, actual)` — value equality.
- `Assert.Same(expected, actual)` — reference equality.
- `Assert.Throws<T>(() => ...)` / `await Assert.ThrowsAsync<T>(...)` — exception testing.
- `Assert.Contains` / `Assert.DoesNotContain` — collection membership.
- Prefer **FluentAssertions** or **AwesomeAssertions** if already used in the project.

## Data-Driven Tests

```csharp
[Theory]
[InlineData(1, 2, 3)]
[InlineData(-1, 1, 0)]
public void Add_TwoNumbers_ReturnsSum(int a, int b, int expected)
{
    var result = Calculator.Add(a, b);
    Assert.Equal(expected, result);
}
```

For method-based or class-based data, use `[MemberData]` or `[ClassData]`.

## Mocking

- Use **Moq** or **NSubstitute** (whichever is already in the solution).
- Mock only external dependencies; never mock code under test.
- Verify that mock outputs match real dependency outputs (write an explicit/skipped test if needed).

## Test Organization

- Group by feature or component.
- Use `[Trait("Category", "...")]` for categorization.
- Use `ITestOutputHelper` for diagnostic output.
- Skip tests conditionally: `[Fact(Skip = "reason")]`.

## Validation

```bash
dotnet test
dotnet test --filter "Category=Unit"
```
