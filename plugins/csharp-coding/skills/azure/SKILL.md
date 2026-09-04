---
name: azure
description: 'Azure SDK integration patterns for .NET. Use when adding Azure services (Storage, Service Bus, Cosmos DB, Key Vault, App Configuration, etc.) to a C# project using the official Azure SDK for .NET.'
---

# Azure SDK for .NET

Integrate Azure services into C# .NET projects using the official Azure SDK.

## Core Principles

- Use the `Azure.Identity` package for all authentication — never hardcode credentials.
- Prefer `DefaultAzureCredential` for local dev and managed identity in production.
- Use `Azure.*` SDK packages — not legacy `Microsoft.Azure.*` libraries.
- Register SDK clients as singletons via dependency injection.
- Apply `CancellationToken` to all SDK calls.

## Authentication

```csharp
// Works locally (CLI/VS login) and in production (managed identity)
var credential = new DefaultAzureCredential();

// Register in DI
builder.Services.AddSingleton(new BlobServiceClient(
    new Uri("https://<account>.blob.core.windows.net"),
    new DefaultAzureCredential()));
```

## Common Integrations

### Azure Blob Storage

```bash
dotnet add package Azure.Storage.Blobs
```

```csharp
var client = new BlobServiceClient(new Uri("https://<account>.blob.core.windows.net"), new DefaultAzureCredential());
var container = client.GetBlobContainerClient("my-container");
await container.UploadBlobAsync("file.txt", stream, cancellationToken);
```

### Azure Service Bus

```bash
dotnet add package Azure.Messaging.ServiceBus
```

```csharp
await using var client = new ServiceBusClient("<namespace>.servicebus.windows.net", new DefaultAzureCredential());
var sender = client.CreateSender("my-queue");
await sender.SendMessageAsync(new ServiceBusMessage("hello"), cancellationToken);
```

### Azure Key Vault

```bash
dotnet add package Azure.Security.KeyVault.Secrets
```

```csharp
var kvClient = new SecretClient(new Uri("https://<vault>.vault.azure.net/"), new DefaultAzureCredential());
var secret = await kvClient.GetSecretAsync("my-secret", cancellationToken: cancellationToken);
```

### Azure App Configuration

```bash
dotnet add package Microsoft.Azure.AppConfiguration.AspNetCore
```

```csharp
builder.Configuration.AddAzureAppConfiguration(options =>
    options.Connect(new Uri("https://<store>.azconfig.io"), new DefaultAzureCredential()));
```

### Cosmos DB

```bash
dotnet add package Microsoft.Azure.Cosmos
```

```csharp
builder.Services.AddSingleton(new CosmosClient(
    "<account-endpoint>",
    new DefaultAzureCredential()));
```

## Best Practices

- Use `Azure.Core.Pipeline` retry policies (built-in by default in all Azure SDK clients).
- Log SDK activity with `AzureEventSourceListener` for diagnostics.
- Use `@Microsoft Learn MCP` or `https://learn.microsoft.com/dotnet/azure/` to verify SDK method signatures before implementation.
- Validate SDK versions with `dotnet list package --outdated`.

## Reference

- Azure SDK for .NET: `https://learn.microsoft.com/en-us/dotnet/azure/`
- Azure Identity docs: `https://learn.microsoft.com/en-us/dotnet/api/azure.identity`
