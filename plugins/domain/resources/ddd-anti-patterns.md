# DDD Anti-Patterns

Common Domain-Driven Design mistakes to watch for during domain design reviews.

## Aggregate Anti-Patterns

### Cross-Aggregate Navigation

**Problem:** Aggregates hold direct object references to other aggregates (navigation properties).

**Why it hurts:** Creates tight coupling, causes lazy-loading performance issues, and makes it impossible to split into separate services later.

**Fix:** Reference other aggregates by ID only.

### Modifying State Outside the Root

**Problem:** External code directly modifies internal entities or collections within an aggregate.

**Why it hurts:** Business invariants are bypassed. Rules like quantity limits or status checks are not enforced.

**Fix:** All mutations go through methods on the aggregate root.

### Multiple Aggregates in One Transaction

**Problem:** A single handler or use case modifies multiple aggregates and saves them in one transaction.

**Why it hurts:** Database locks, deadlocks under load, and inability to scale. Violates bounded context autonomy.

**Fix:** Modify one aggregate per transaction. Use domain events or the outbox pattern for cross-aggregate coordination.

### Oversized Aggregate

**Problem:** An aggregate contains entities and collections that do not need to be immediately consistent (for example: `Order` containing `Items`, `Payments`, `ShippingHistory`, and `AuditLog`).

**Why it hurts:** Loading the aggregate pulls unnecessary data, and locks block unrelated operations.

**Fix:** If two concepts do not need transactional consistency, split them into separate aggregates.

### Child Entity Calling Parent Root

**Problem:** A child entity within an aggregate holds a reference to the root and calls methods on it directly.

**Why it hurts:** Creates circular dependencies, bypasses root invariants, and duplicates transition logic.

**Fix:** Only the aggregate root manages state transitions. Children report through return values or internal events.

## Entity Anti-Patterns

### Anemic Domain Model

**Problem:** Entities contain only getters and setters. All business logic lives in external service classes.

**Why it hurts:** Business rules are scattered across services, easily duplicated, and easily bypassed.

**Fix:** Move behavior into the entity. Services orchestrate, entities enforce rules.

### Public Setters on Domain State

**Problem:** Entity properties have public setters, allowing any code to change state directly.

**Why it hurts:** State transitions are unprotected. Invalid states (for example: `Delivered` → `Submitted`) cannot be prevented.

**Fix:** Use private setters with named behavior methods (for example: `order.Cancel()` instead of `order.Status = Cancelled`).

## Value Object Anti-Patterns

### Mutable Value Object

**Problem:** A value object has public setters or mutable properties.

**Why it hurts:** Value objects guarantee equality by value. Mutation breaks this contract and causes bugs in collections and dictionaries.

**Fix:** Use immutable records or classes with readonly properties.

### Value Object Without Constructor Validation

**Problem:** A value object can be created in an invalid state (for example: `new Email("")` or `new Money(-100, "")`).

**Why it hurts:** The "always valid" guarantee is the primary benefit of value objects. Without it, validation spreads throughout the codebase.

**Fix:** Validate all constraints in the constructor and throw on invalid input.

## Domain Event Anti-Patterns

### Dispatching Events Before Persistence

**Problem:** Domain events are published before the aggregate is saved. Subscribers query data that does not yet exist in the database.

**Why it hurts:** Race conditions, subscriber failures, and inconsistent state.

**Fix:** Collect events during the operation, persist the aggregate, then dispatch events.

### Non-Idempotent Event Handlers

**Problem:** An event handler performs a side effect (sending email, charging payment) without checking whether it has already been executed.

**Why it hurts:** Retries after failures cause duplicate side effects.

**Fix:** Handlers check idempotency by event ID or business key before executing.

### Full Entity in Event Payload

**Problem:** A domain event carries the entire aggregate or entity object as its payload.

**Why it hurts:** The event becomes a coupling point. Any change to the entity breaks all consumers. Serialization pulls object graphs.

**Fix:** Events carry only IDs and the specific data consumers need.

## Bounded Context Anti-Patterns

### Single Shared Model for Everything

**Problem:** One database context or model serves the entire application with no context boundaries.

**Why it hurts:** Changes to one area cause migrations for everything, teams step on each other, and initialization is slow.

**Fix:** Separate database contexts per bounded context.

### Leaking Internal Models Across Boundaries

**Problem:** One bounded context directly consumes another context's internal entities or database tables.

**Why it hurts:** Tight coupling between contexts. Changes in one context break the other.

**Fix:** Use anti-corruption layers, published language, or integration events at context boundaries.

## Ubiquitous Language Anti-Patterns

### Generic Names Without Context

**Problem:** Using `Id`, `Name`, `Value`, or `Service` without domain-specific prefixes.

**Why it hurts:** Ambiguity during refactoring. Compiler cannot catch when one type's `Id` is passed where another's is expected.

**Fix:** Use domain-qualified names: `CustomerId`, `ProductName`, `OrderTotalCents`.

### Importing External Terminology

**Problem:** Using field names from an external API directly in the domain model without translating them.

**Why it hurts:** External naming conventions leak into the domain. After three months, nobody remembers what `SolutionPath` means in local context.

**Fix:** Map external terms to local ubiquitous language at the integration boundary.

### Same Name, Different Meanings

**Problem:** The same term is used for different concepts within one bounded context.

**Why it hurts:** IntelliSense confusion, search ambiguity, and import conflicts.

**Fix:** Each concept gets a unique name within its bounded context. Use qualifying prefixes when needed.
