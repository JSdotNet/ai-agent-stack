---
name: sre
description: 'SRE practices for .NET services — error budgets, SLOs, runbooks, incident context, and reliability improvements. Use when diagnosing incidents, reviewing service reliability, or implementing SRE patterns in C# code.'
---

# SRE — Site Reliability Engineering for .NET Services

Apply SRE practices to improve the reliability, observability, and incident response of .NET services.

## Core Concepts

| Concept | Definition |
|---|---|
| **SLI** (Service Level Indicator) | A measurable signal of service health (e.g., request success rate, p99 latency). |
| **SLO** (Service Level Objective) | A target for an SLI (e.g., 99.9% success rate over 30 days). |
| **Error budget** | The allowed failure margin before the SLO is breached (e.g., 0.1% of requests over 30 days). |
| **Toil** | Repetitive manual work that scales with service growth — eliminate through automation. |
| **Runbook** | Documented response procedure for a known failure mode. |

## Defining SLIs in .NET (OpenTelemetry Metrics)

```csharp
// Success rate SLI: track successes and total requests
private static readonly Meter Meter = new("MyService.Reliability");
private static readonly Counter<long> RequestsTotal =
    Meter.CreateCounter<long>("requests.total");
private static readonly Counter<long> RequestsSuccess =
    Meter.CreateCounter<long>("requests.success");

public async Task<Result> HandleAsync(Request req, CancellationToken ct)
{
    RequestsTotal.Add(1);
    try
    {
        var result = await _handler.ExecuteAsync(req, ct);
        RequestsSuccess.Add(1);
        return result;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Request failed for {RequestId}", req.Id);
        throw;
    }
}
```

Register the meter and export to Aspire dashboard or Azure Monitor (see `open-telemetry` skill).

## Health Checks

Add health and readiness endpoints for Kubernetes/Aspire probes:

```bash
dotnet add package Microsoft.Extensions.Diagnostics.HealthChecks
```

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("database", () => HealthCheckResult.Healthy())
    .AddCheck("dependency", () => /* check downstream */ HealthCheckResult.Healthy());

app.MapHealthChecks("/health");
app.MapHealthChecks("/ready");
```

Aspire automatically wires health checks when using `AddServiceDefaults()`.

## Resilience Patterns (Microsoft.Extensions.Resilience)

```bash
dotnet add package Microsoft.Extensions.Http.Resilience
```

```csharp
builder.Services.AddHttpClient<IMyClient, MyClient>()
    .AddStandardResilienceHandler();  // retry + circuit breaker + timeout
```

Custom policy:

```csharp
builder.Services.AddResiliencePipeline("my-pipeline", pipeline =>
{
    pipeline
        .AddRetry(new RetryStrategyOptions
        {
            MaxRetryAttempts = 3,
            Delay = TimeSpan.FromMilliseconds(200),
            BackoffType = DelayBackoffType.Exponential
        })
        .AddCircuitBreaker(new CircuitBreakerStrategyOptions
        {
            FailureRatio = 0.5,
            SamplingDuration = TimeSpan.FromSeconds(30)
        })
        .AddTimeout(TimeSpan.FromSeconds(10));
});
```

## Runbook Template

Store runbooks under `.wip/runbooks/<service-name>/<alert-name>.md`.

```markdown
# Runbook: <Alert Name>

## Alert Condition

<Describe what triggers this alert — metric threshold, error rate, etc.>

## Impact

<User-facing impact and severity.>

## Diagnostic Steps

1. Check `list_resources` in Aspire MCP — is the service running?
2. `list_structured_logs` for <service> — look for error patterns.
3. `list_traces` — identify failing request paths, then `list_trace_structured_logs` for one.
4. Check downstream dependencies (database, queues, external APIs).

## Mitigation

- **Quick fix**: <e.g., restart service, scale out>
- **Permanent fix**: <link to issue or fix description>

## Escalation

<Who to contact if mitigation fails and SLO breach is imminent.>
```

## Incident Context Collection

When investigating an incident, gather:

1. **When** — first occurrence timestamp, duration.
2. **What** — error messages, affected endpoints, impacted users.
3. **Where** — which service, which dependency, which region.
4. **Why** — trace ID and root cause from `list_traces` / `list_structured_logs`.
5. **How to fix** — immediate mitigation and long-term remediation.

Use the `aspire-logging` skill to retrieve logs and traces from running services — it also
records the current tool names and how to resolve their `mcp__` prefix.

## Error Budget Burn Tracking

Monitor burn rate in dashboards (Azure Monitor, Grafana):

- **Fast burn** (>14× budget in 1 hour) → page on-call immediately.
- **Slow burn** (>1× budget over 6 hours) → create ticket, investigate next sprint.
- **Within budget** → no action required.

## Reference

- Resilience in .NET: `https://learn.microsoft.com/en-us/dotnet/core/resilience/`
- Health checks: `https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks`
- SRE book (Google): `https://sre.google/sre-book/table-of-contents/`
