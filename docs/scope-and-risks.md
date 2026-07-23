# Fixonaut — Scope, Risks, and Trade-offs

## 1. Scope policy

Every feature must be classified as one of:

- **MVP:** required for the first usable release
- **Post-MVP:** valuable but not required for the first release
- **Rejected for now:** intentionally excluded to protect delivery focus

## 2. MVP scope

```text
Authentication
Organization and roles
Customers
Assets
Service requests
Technician assignment
Status history
Inventory
Invoices
Audit logs
Dashboard
Tests
Docker
CI pipeline
Deployment
```

## 3. Post-MVP scope

```text
WebSocket updates
Email/SMS/WhatsApp notifications
Maps and distance-based recommendations
QR asset passport
AI repair assistant
Offline technician mode
Advanced reporting
External accounting integration
```

## 4. Rejected for now

```text
Microservices
Kubernetes
Complex route optimization
Autonomous AI decisions
Native mobile apps
Real-money payment settlement
```

## 5. Risk register

| Risk | Impact | Probability | Mitigation |
|---|---:|---:|---|
| Scope becomes too large | High | High | Freeze MVP scope and deliver vertical slices |
| Project becomes CRUD-only | High | Medium | Implement state machine, assignment rules, transactions, audit logs |
| Tenant data leak | Critical | Medium | Centralize tenant context and add cross-tenant integration tests |
| Inventory race condition | High | Medium | Transactional deduction, locking strategy, concurrency tests |
| Authentication security mistake | Critical | Medium | Use Spring Security, secure hashing, tests, documented token flow |
| UI becomes inconsistent | Medium | Medium | Shared components, design tokens, loading/error states |
| AI distracts from core product | Medium | High | Add AI only after core workflow is deployed |
| External API cost or outage | Medium | Medium | Keep maps/AI optional and provide graceful fallback |
| Poor database performance | High | Low | Pagination, indexes, query inspection, realistic seed data |
| No useful demo data | High | Medium | Create a realistic demo organization and scripted seed data |
| Deployment failure | Medium | Medium | Docker locally, CI early, staging before production |

## 6. Important trade-offs

### Modular monolith versus microservices

Decision: modular monolith.

Reason: the project is being built by one intermediate developer. We need clear boundaries without distributed-system complexity. A future extraction can be demonstrated with an ADR if a real scaling reason appears.

### Zustand versus Redux

Decision: Zustand for small global client state.

Reason: Fixonaut does not initially need a large client-side event architecture. Server state belongs in TanStack Query.

### REST versus GraphQL

Decision: REST for Version 1.

Reason: REST is sufficient for the workflow, easy to document with OpenAPI, and aligns with common Spring Boot enterprise work.

### Synchronous versus asynchronous processing

Decision: synchronous for core request/response workflows.

Reason: service-request updates, assignment, and inventory deductions require immediate consistency. Notifications and future document processing can become asynchronous later.

### AI versus deterministic rules

Decision: deterministic rules first.

Reason: transparent scheduling and inventory behavior are easier to test and explain. AI will be advisory and human-reviewed if added later.
