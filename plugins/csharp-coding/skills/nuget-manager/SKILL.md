---
name: nuget-manager
description: 'Manage NuGet packages in .NET projects and solutions. Use when adding, removing, or updating NuGet packages. Enforces dotnet CLI for package management and safe version update procedures.'
---

# NuGet Manager

Manage NuGet packages safely using the `dotnet` CLI.

## Rules

- Use `dotnet add package` to add packages — never manually edit `.csproj` for new packages.
- Use `dotnet remove package` to remove packages.
- Direct `.csproj` edits are only permitted for version-only updates.
- Always run `dotnet restore` after version changes to validate the dependency graph.
- Prefer `Directory.Packages.props` (Central Package Management) when the solution already uses it.

## Common Operations

### Add a Package

```bash
dotnet add <project> package <PackageName> --version <version>
```

### Remove a Package

```bash
dotnet remove <project> package <PackageName>
```

### List Outdated Packages

```bash
dotnet list package --outdated
```

### Update a Package (version bump in `.csproj`)

Edit `<PackageReference Include="..." Version="..." />` directly in `.csproj`, then:

```bash
dotnet restore
dotnet build
dotnet test
```

### Central Package Management (`Directory.Packages.props`)

If the solution uses CPM, update the version in `Directory.Packages.props`, not in individual `.csproj` files:

```xml
<PackageVersion Include="PackageName" Version="x.y.z" />
```

## Validation

After any package change:

```bash
dotnet restore
dotnet build
dotnet test
```

Resolve all warnings about deprecated or incompatible packages before finalizing.
