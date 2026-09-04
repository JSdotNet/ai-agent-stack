---
applyTo: '**/*.md'
description: Core Domain-Driven Design principles and ubiquitous language enforcement rules.
---

# DDD Global Instructions

## Purpose

Define shared Domain-Driven Design principles that apply to all domain design work in this plugin.

## Core Principles

1. **Domain first.** Business domain concepts drive all design decisions. Technology choices follow domain boundaries, not the other way around.
2. **Ubiquitous language.** Use one shared language between domain experts, developers, and documentation. Every domain term must have exactly one definition within a bounded context.
3. **Bounded contexts are autonomous.** Each bounded context owns its models, language, and rules. The same real-world concept may have different representations in different contexts.
4. **Explicit boundaries.** Always define where one bounded context ends and another begins. Ambiguous boundaries lead to coupled systems.
5. **Model integrity.** Protect the domain model from corruption by external systems, legacy code, or other bounded contexts through anti-corruption layers and published language contracts.

## Ubiquitous Language Rules

- Every domain term must be defined in the glossary section of its bounded context file.
- Use domain terms consistently in all artifacts: documentation, code, API contracts, and conversations.
- When a term is ambiguous, resolve it with the domain expert before proceeding.
- Avoid generic technical names (`Manager`, `Handler`, `Processor`, `Service`) for domain concepts unless they genuinely reflect the domain language.
- When the same word means different things in different contexts, document both meanings explicitly and note which context each belongs to.

## Subdomain Classification

Classify each subdomain to guide investment and design effort:

- **Core domain** — competitive advantage. Invest the most design effort. Custom-build.
- **Supporting subdomain** — necessary but not differentiating. Moderate design effort. May custom-build or buy.
- **Generic subdomain** — commodity capability. Minimal design effort. Buy or use open-source.

## Technology Neutrality

- Domain design artifacts must remain technology-agnostic.
- Do not reference specific frameworks, databases, or infrastructure in domain model documentation.
- Technology decisions belong in architecture documentation, not domain design.

## Quality Standards

- Every bounded context must have a clearly defined purpose and responsibility.
- Every aggregate must enforce at least one business invariant.
- Every domain event must represent a meaningful business occurrence, named in past tense.
- Value objects must be immutable and validated at creation.
