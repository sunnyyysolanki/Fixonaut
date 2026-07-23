# Fixonaut — Development Flow

This file records the project journey in one clear flow.

## One-line development flow

```text
Product Idea → Phase 0: Requirements & System Design → Git Repository → Docker → PostgreSQL Container → Spring Boot Backend → Database Connection → Flyway Migrations → Health API → React Frontend → Authentication → Customers → Service Requests → Scheduling → Inventory → Invoices → Testing → CI/CD → Deployment
```

## Current progress

```text
[✓] Product idea selected
    ↓
[✓] Project name selected: Fixonaut
    ↓
[✓] Product requirements documented
    ↓
[✓] User stories documented
    ↓
[✓] MVP scope documented
    ↓
[✓] Risks and trade-offs documented
    ↓
[✓] Modular monolith architecture selected
    ↓
[✓] Git project structure created
    ↓
[✓] Docker installed and verified
    ↓
[✓] PostgreSQL Docker configuration created
    ↓
[✓] PostgreSQL container started
    ↓
[▶] Create Spring Boot backend
    ↓
[ ] Connect Spring Boot to PostgreSQL
    ↓
[ ] Add Flyway migration
    ↓
[ ] Create health-check API
    ↓
[ ] Create React frontend
```

## Phase flow

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 0: Product Discovery                                                   │
│ Requirements • User Stories • Scope • Risks • Architecture Decisions         │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation                                                           │
│ Git • Docker • PostgreSQL • Spring Boot • React • Health Check                │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Application Foundation                                               │
│ API Errors • Validation • CORS • Flyway • Configuration • Logging             │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Authentication & Authorization                                       │
│ Login • JWT • Roles • Organizations • Tenant Isolation                       │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Customers & Assets                                                   │
│ CRUD • Search • Pagination • Customer Equipment                               │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Service Requests                                                     │
│ State Machine • Assignment • Status History • Technician Workflow             │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 6: Scheduling                                                           │
│ Availability • Conflicts • Technician Recommendation                          │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 7: Inventory                                                            │
│ Parts • Stock Transactions • Locking • Negative-Stock Protection              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 8: Quotes & Invoices                                                    │
│ Labor • Parts • Estimates • Invoice States • Payment Status                   │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 9: Notifications & Real-Time Updates                                   │
│ WebSockets • Job Events • Email/SMS/WhatsApp Later                            │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 10: Dashboard & Analytics                                               │
│ Workload • Completion Time • Revenue • Technician Metrics                     │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 11: Testing & Quality                                                   │
│ Unit Tests • Integration Tests • Testcontainers • Playwright                  │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 12: CI/CD & Deployment                                                  │
│ GitHub Actions • Docker Images • Staging • Production                        │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 13: Observability                                                       │
│ Logs • Metrics • Traces • Health Checks • Alerts                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Phase 14: Advanced Features                                                   │
│ AI Assistant • Maps • Offline Mode • Event-Driven Processing                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Current technical flow

```text
Windows Machine
      ↓
Docker Desktop
      ↓
PostgreSQL 16 Container
      ↓
Database: fixonaut
      ↓
Spring Boot Backend :8080
      ↓
React Frontend :5173 (next)
```

## Feature delivery flow

Every feature must follow this process:

```text
User Story → Acceptance Criteria → Database Design → API Contract → Backend Code → Backend Tests → Frontend Screen → Frontend Tests → Code Review → Documentation
```

## Current next step

```text
Generate Spring Boot project
      ↓
Configure PostgreSQL connection
      ↓
Create Flyway V1 migration
      ↓
Create /api/v1/health endpoint
      ↓
Verify backend health in browser
```
