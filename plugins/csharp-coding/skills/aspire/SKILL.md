---
name: aspire
description: '.NET Aspire orchestration for distributed C# applications. Use when adding Aspire to a project, wiring AppHost resources, configuring service discovery, or working with Aspire integrations.'
compatibility: Works best with Aspire MCP server (`aspire mcp start`). Falls back to web/fetch against https://aspire.dev.
---

# .NET Aspire — Distributed App Orchestration

Orchestrate distributed .NET applications with Aspire AppHost.

## When to Use

- Adding Aspire to an existing solution.
- Wiring services, databases, or queues in AppHost.
- Configuring service discovery between services.
- Using Aspire integrations (Redis, Postgres, Azure Service Bus, etc.).
- Writing integration tests against a running AppHost.

## Using the Aspire MCP Server

When the `aspire-mcp` server is available, use it to query official docs:

```
list_integrations          — list all available Aspire hosting integrations
get_integration_docs       — get docs for a specific integration package
search_docs                — search indexed aspire.dev documentation (CLI 13.2+)
get_doc                    — retrieve a doc by slug (CLI 13.2+)
```

Fallback: `web/fetch` against `https://aspire.dev` or `https://learn.microsoft.com/dotnet/aspire/`.

## Quick Start

```bash
# Install Aspire CLI
irm https://aspire.dev/install.ps1 | iex

# Add Aspire to existing solution
aspire init

# Run the distributed app
aspire run
```

## AppHost Wiring (C#)

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var redis = builder.AddRedis("cache");
var db = builder.AddPostgres("pg").AddDatabase("appdb");

var api = builder.AddProject<Projects.MyApi>("api")
    .WithReference(redis)
    .WithReference(db)
    .WaitFor(db);

builder.Build().Run();
```

## Service Discovery

Services reference each other by resource name. Aspire injects connection strings automatically:

- Database: `ConnectionStrings__appdb`
- HTTP service: `services__api__http__0`

No manual config needed when using `.WithReference()`.

## Adding an Integration

```bash
aspire add redis          # adds Redis hosting + client integration
aspire add postgres       # adds Postgres hosting + client integration
```

Or manually:

```bash
dotnet add AppHost package Aspire.Hosting.Redis
dotnet add MyService package Aspire.StackExchange.Redis
```

## Integration Testing

```bash
dotnet add package Aspire.Hosting.Testing
```

```csharp
[Fact]
public async Task Api_ReturnsHealthy()
{
    await using var app = await DistributedApplicationTestingBuilder
        .CreateAsync<Projects.AppHost>();
    await using var client = app.CreateHttpClient("api");

    var response = await client.GetAsync("/health");
    response.EnsureSuccessStatusCode();
}
```

## Reference

- Aspire docs: `https://aspire.dev`
- Integrations: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/integrations-overview`
- Samples: `https://github.com/dotnet/aspire-samples`
