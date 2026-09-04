---
name: microsoft-code-reference
description: 'Verify Microsoft .NET/Azure API signatures and retrieve official code samples before implementing. Works best with Microsoft Learn MCP Server. Use when working with .NET libraries, Azure SDKs, or any Microsoft API to avoid hallucinated methods, wrong signatures, or deprecated patterns.'
compatibility: Works best with Microsoft Learn MCP Server (https://learn.microsoft.com/api/mcp). Falls back to web/fetch against learn.microsoft.com.
---

# Microsoft Code Reference

Verify Microsoft API signatures and retrieve official code samples before generating implementation code.

## Core Workflow

1. **Search docs** — find the type or method to confirm it exists and retrieve the correct namespace.
2. **Fetch API page** — get full overloads, parameters, and return type details.
3. **Pull code samples** — retrieve language-specific examples from official documentation.
4. **Implement** — write code based on verified signatures and patterns.

## Using Microsoft Learn MCP Server

When the `microsoft-learn` MCP server is available:

```
Tool: microsoft_docs_search
Query: "<type/method name> <context>" language:csharp
```

```
Tool: microsoft_code_sample_search
Query: "<SDK method or pattern>" language:csharp
```

## Fallback: Web Fetch

When MCP is unavailable, use `web/fetch` against official sources:

- .NET API browser: `https://learn.microsoft.com/en-us/dotnet/api/`
- Azure SDK docs: `https://learn.microsoft.com/en-us/dotnet/azure/`
- What's new in .NET: `https://learn.microsoft.com/en-us/dotnet/core/whats-new`
- What's new in C#: `https://learn.microsoft.com/en-us/dotnet/csharp/whats-new`

## Key Use Cases

- Verifying a method signature before use.
- Finding the correct NuGet package for a feature.
- Checking for deprecated APIs and their replacements.
- Getting working code samples for Azure SDK integrations.
- Confirming C# version requirements for new language features.
