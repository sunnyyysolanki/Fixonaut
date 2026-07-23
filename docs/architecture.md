# Fixonaut Architecture

## Product

Fixonaut is a field-service management platform for small repair and maintenance businesses.

It manages:

- Customers
- Technicians
- Service requests
- Scheduling
- Inventory
- Quotes
- Invoices
- Notifications
- Dashboard analytics

## High-level architecture

```text
                         ┌─────────────────────┐
                         │       Vercel        │
                         │ React + TypeScript  │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │ HTTPS / WSS
                                    ▼
                         ┌─────────────────────┐
                         │       Render       │
                         │   Spring Boot API   │
                         │   Modular Monolith  │
                         └──────┬──────┬───────┘
                                │      │
                         JDBC   │      │ WebSocket
                                ▼      ▼
                    ┌──────────────┐ ┌──────────────┐
                    │     Neon     │ │ Notification │
                    │  PostgreSQL  │ │ Event Flow   │
                    └──────────────┘ └──────────────┘
```

## Backend architecture

```text
HTTP Request
     ↓
Spring Security
     ↓
JWT validation
     ↓
Controller
     ↓
DTO validation
     ↓
Application Service
     ↓
Domain Entity
     ↓
Repository
     ↓
PostgreSQL
```

## Backend modules

```text
com.fixonaut.backend
├── auth
├── organization
├── user
├── customer
├── technician
├── service
├── scheduling
├── inventory
├── billing
├── notification
├── dashboard
├── security
├── common
└── config
```

## Core request flow

```text
Customer creates service request
          ↓
Dispatcher reviews request
          ↓
Technician is assigned
          ↓
Appointment is scheduled
          ↓
Technician accepts job
          ↓
Technician starts work
          ↓
Parts are consumed transactionally
          ↓
Quote is created
          ↓
Quote is approved
          ↓
Invoice is issued
          ↓
Payment is recorded
          ↓
Dashboard metrics are updated
```

## Authentication flow

```text
User submits email and password
          ↓
Spring Security finds user
          ↓
BCrypt verifies password
          ↓
JWT is generated
          ↓
Frontend stores access token in Zustand
          ↓
Axios adds Bearer token to requests
          ↓
Spring Security validates JWT
          ↓
Organization and roles are available
```

## Multi-tenancy

Every organization-owned table contains:

```text
organization_id
```

The organization ID is taken from the signed JWT. The frontend cannot select another organization by sending an arbitrary organization ID.

All queries are scoped by the authenticated organization:

```sql
WHERE organization_id = :currentOrganizationId
```

## Service-request state machine

```text
NEW
  ↓
ASSIGNED
  ↓
ACCEPTED
  ↓
IN_PROGRESS
  ↓
COMPLETED
```

Alternative paths:

```text
NEW / ASSIGNED / ACCEPTED / IN_PROGRESS
        ↓
    CANCELLED

IN_PROGRESS
        ↓
WAITING_FOR_PART
        ↓
IN_PROGRESS
```

Invalid transitions return `409 Conflict`.

## Inventory consistency

```text
Consume part request
        ↓
Database transaction starts
        ↓
Part row is locked
        ↓
Stock quantity is checked
        ↓
Enough stock?
   ┌────┴────┐
   │         │
  No        Yes
   │         │
409 error   Deduct stock
             ↓
      Create stock transaction
             ↓
      Create service-request part
             ↓
          Commit
```

This prevents `quantity_on_hand < 0`.

## Scheduling conflict detection

Two appointments conflict when:

```text
newStart < existingEnd
AND
newEnd > existingStart
```

The backend rejects overlapping technician appointments with `409 Conflict`.

## Notifications

```text
Business operation
       ↓
Spring application event
       ↓
Database transaction commits
       ↓
Notification is persisted
       ↓
WebSocket message sent to user
       ↓
React Query cache updates
       ↓
Notification bell updates
```

## Deployment

### Local

```text
React Vite server
        ↓
Spring Boot localhost:8080
        ↓
PostgreSQL Docker container
```

### Production

```text
Vercel React frontend
        ↓ HTTPS
Render Spring Boot backend
        ↓ SSL JDBC
Neon PostgreSQL
```

## Technology decisions

### Modular monolith

We selected a modular monolith instead of microservices because:

- The project is developed by one person.
- Transactions are easier to manage.
- Local development is simpler.
- Deployment is simpler.
- Module boundaries remain clear.
- Services can be extracted later if a real need appears.

### PostgreSQL

PostgreSQL was selected because the domain requires:

- Transactions
- Foreign keys
- Relational queries
- Pagination
- Aggregations
- Strong consistency
- Flexible reporting

### TanStack Query

TanStack Query manages server state, including API caching, loading states, refetching, mutations, and cache invalidation.

### Zustand

Zustand manages small global client state, including the current user, access token, authentication state, and UI state.

### JWT

JWT enables stateless API authentication and supports the React SPA, Spring Security, role-based access, and organization claims.
