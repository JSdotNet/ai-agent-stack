---
name: open-telemetry
description: 'Set up OpenTelemetry in .NET for distributed tracing, metrics, and logging. Use when adding observability to a C# service — covers SDK setup, exporters (OTLP, Console, Azure Monitor), and integration with Aspire.'
---

# OpenTelemetry for .NET

Add distributed tracing, metrics, and structured logging to C# services using the OpenTelemetry SDK.

## Core Packages

```bash
# SDK base
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Extensions.Hosting

# Instrumentation
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
dotnet add package OpenTelemetry.Instrumentation.Http
dotnet add package OpenTelemetry.Instrumentation.EntityFrameworkCore  # if using EF Core

# Exporters — choose one or more
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol  # OTLP (Aspire, Jaeger, Tempo)
dotnet add package OpenTelemetry.Exporter.Console                # local dev
dotnet add package Azure.Monitor.OpenTelemetry.AspNetCore        # Azure Application Insights
```

## Minimal Setup (ASP.NET Core)

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter())          // sends to Aspire dashboard or collector
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddOtlpExporter())
    .WithLogging(logging => logging
        .AddOtlpExporter());
```

## Aspire Integration

When running under Aspire, use the `Aspire.OpenTelemetry` defaults extension — it configures OTLP endpoints automatically from Aspire environment variables:

```bash
dotnet add package Aspire.OpenTelemetry
```

```csharp
builder.AddServiceDefaults(); // includes OTel wiring from Aspire ServiceDefaults project
```

The Aspire dashboard displays traces, metrics, and logs without additional exporter config.

## Custom Tracing

```csharp
private static readonly ActivitySource Source = new("MyService.Orders");

public async Task ProcessOrderAsync(string orderId, CancellationToken ct)
{
    using var activity = Source.StartActivity("ProcessOrder");
    activity?.SetTag("order.id", orderId);

    // ... work ...
}
```

Register the source:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddSource("MyService.Orders"));
```

## Custom Metrics

```csharp
private static readonly Meter Meter = new("MyService.Orders");
private static readonly Counter<long> OrdersProcessed =
    Meter.CreateCounter<long>("orders.processed");

public async Task ProcessOrderAsync(...)
{
    // ...
    OrdersProcessed.Add(1, new TagList { { "status", "success" } });
}
```

Register the meter:

```csharp
builder.Services.AddOpenTelemetry()
    .WithMetrics(m => m.AddMeter("MyService.Orders"));
```

## Best Practices

- Propagate `Activity` context through all async call chains.
- Use semantic conventions for tag names (e.g., `db.system`, `http.method`).
- Never log PII in trace tags or metric labels.
- Use `CancellationToken` in all instrumented operations.
- Prefer `AddServiceDefaults()` in Aspire projects over manual OTel wiring.

## Reference

- OpenTelemetry .NET: `https://opentelemetry.io/docs/languages/net/`
- Aspire observability: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/telemetry`
- Azure Monitor: `https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-enable`
