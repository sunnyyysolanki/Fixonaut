# ADR-001: Choose a modular monolith for Version 1

- **Status:** Accepted
- **Date:** 2026-07-19

## Context

Fixonaut needs several business areas: authentication, customers, service requests, scheduling, inventory, and billing. The project is being built by one intermediate developer for learning and portfolio purposes.

A microservices architecture would introduce service discovery, network failures, distributed tracing, separate deployments, eventual consistency, and more complex local development before the product workflow is proven.

## Options considered

1. One unstructured monolith
2. Modular monolith
3. Multiple microservices from the beginning

## Decision

Use a **modular monolith** with explicit module boundaries.

Modules own their domain code and communicate through application services or events. Modules must not directly access another module’s repositories.

## Consequences

### Positive

- Easier local development
- Simple transactions for workflows such as inventory deduction
- Faster feature delivery
- Clear domain boundaries
- Easy to test and deploy
- Future service extraction remains possible

### Negative

- A deployment contains all modules.
- Module boundaries can degrade without code review.
- Independent scaling is not available initially.

## Review trigger

Reconsider this decision only if a module demonstrates a real need for:

- Independent scaling
- Independent deployment
- Different reliability requirements
- Separate data ownership
- A distinct asynchronous workload
