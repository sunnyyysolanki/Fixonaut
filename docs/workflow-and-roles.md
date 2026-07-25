# Fixonaut — Working Flow & User Roles

This document describes the **end-to-end working flow** of Fixonaut and how it differs
per **user role**. All diagrams are Mermaid and render automatically on GitHub.

> Verified against source: `UserRole.java`, all `*Controller.java` (`@PreAuthorize`),
> `ServiceRequestEntity.canTransitionTo()`, `ServiceRequestService`, and
> `docs/auth-refresh-token-flow.md`.

---

## 1. User roles

| Role | Purpose | Status in code |
|------|---------|----------------|
| **OWNER** | Registers the org, super-user, sees reports | ✅ fully wired |
| **ADMIN** | Manages users, technicians, parts, billing | ✅ fully wired |
| **DISPATCHER** | Reviews requests, assigns techs, schedules | ✅ fully wired |
| **TECHNICIAN** | Works **only their own** assigned jobs | ✅ fully wired |
| **CUSTOMER** | Designed for self-service portal | ⚠️ **enum only — no endpoints yet** |

> **Note:** The `CUSTOMER` role exists in `UserRole` but is granted access by **no**
> controller. The customer self-service portal is explicitly deferred
> ("Do not implement yet" in `auth-refresh-token-flow.md`). Today a *customer* is a
> **data record** managed by staff, and dispatchers create requests on their behalf.

---

## 2. High-level architecture

```mermaid
flowchart TD
    U["Users<br/>Owner · Admin · Dispatcher · Technician"]
    FE["Vercel<br/>React + TypeScript SPA<br/>Zustand · TanStack Query"]
    BE["Render<br/>Spring Boot API<br/>Modular Monolith"]
    DB[("Neon<br/>PostgreSQL")]
    WS(["WebSocket<br/>notifications"])

    U -->|HTTPS| FE
    FE -->|"REST /api/v1 (Bearer JWT)"| BE
    FE <-->|WSS| WS
    BE --- WS
    BE -->|"JDBC (org-scoped)"| DB
```

---

## 3. Role → capability matrix

`O`=OWNER · `A`=ADMIN · `D`=DISPATCHER · `T`=TECHNICIAN · ✔ = allowed

| Action | O | A | D | T |
|---|:--:|:--:|:--:|:--:|
| Register org / login / refresh / logout | public | public | public | public |
| Manage technicians (create/update/deactivate) | ✔ | ✔ | | |
| Manage parts / inventory (create/update/delete) | ✔ | ✔ | | |
| Create / update / delete customers | ✔ | ✔ | ✔ | |
| Create service request | ✔ | ✔ | ✔ | |
| Assign technician | ✔ | ✔ | ✔ | |
| Schedule appointment | ✔ | ✔ | ✔ | |
| Accept / Start / Wait-for-part / Complete job | ✔ | ✔ | | ✔ |
| Cancel request | ✔ | ✔ | ✔ | ✔ |
| Consume parts on a job | ✔ | ✔ | | ✔ |
| Quotes / invoices / payments | ✔ | ✔ | ✔ | |
| View dashboard metrics | ✔ | ✔ | ✔ | |
| List / view requests + history | ✔ | ✔ | ✔ | ✔ |
| Notifications | any authenticated user | | | |

**Extra guard on technicians** (`ServiceRequestService.validateTransitionActor`): a
technician may only act on a request where they are the **assigned** technician, else
`403 Forbidden`. Owners/Admins bypass this.

---

## 4. Authentication flow (login)

```mermaid
sequenceDiagram
    autonumber
    participant FE as React SPA
    participant API as Spring Security / AuthController
    participant DB as PostgreSQL

    FE->>API: POST /auth/login (email, password)
    API->>DB: find user by email
    API->>API: BCrypt verify password
    API->>API: generate 15-min JWT (roles + organizationId)
    API->>API: generate 7-day opaque refresh token
    API->>DB: store SHA-256 HASH of refresh token
    API-->>FE: 200 { accessToken, user } + Set-Cookie refresh (HttpOnly, Secure)
    Note over FE: access token kept in memory (Zustand)<br/>never in localStorage
```

## 4b. Silent refresh (access token expires after 15 min)

```mermaid
sequenceDiagram
    autonumber
    participant FE as Axios interceptor
    participant API as AuthController
    participant DB as PostgreSQL

    FE->>API: API call with expired access token
    API-->>FE: 401 Unauthorized
    FE->>API: POST /auth/refresh (HttpOnly cookie, withCredentials)
    API->>DB: hash cookie (SHA-256) & look up token
    alt valid & not revoked/expired
        API->>DB: rotate — issue new refresh, revoke old, link replaced_by
        API-->>FE: 200 { new accessToken }
        FE->>API: retry original request once
    else invalid / revoked / expired / reused
        API-->>FE: 401
        FE->>FE: clear auth → redirect /login ("session expired")
    end
```

---

## 5. End-to-end service lifecycle (per role)

```mermaid
sequenceDiagram
    autonumber
    actor Adm as Owner / Admin
    actor Disp as Dispatcher
    actor Tech as Technician
    participant BE as Backend
    participant DB as PostgreSQL

    Adm->>BE: register org (creates OWNER)
    Adm->>BE: create Admin / Dispatcher / Technician users
    Adm->>BE: create parts + add customers
    Disp->>BE: create service request
    BE->>DB: status = NEW (+ audit row)
    Disp->>BE: assign technician
    BE->>BE: check schedule conflict (409 if overlap)
    BE->>DB: NEW → ASSIGNED
    BE-->>Tech: notify "assigned"
    Tech->>BE: accept job
    BE->>DB: ASSIGNED → ACCEPTED
    Tech->>BE: start work
    BE->>DB: ACCEPTED → IN_PROGRESS
    Tech->>BE: consume part
    BE->>DB: txn — lock row, check stock, deduct, log txn
    opt part unavailable
        Tech->>BE: wait for part
        BE->>DB: IN_PROGRESS ↔ WAITING_FOR_PART
    end
    Tech->>BE: complete job (notes required)
    BE->>DB: IN_PROGRESS → COMPLETED
    BE-->>Disp: notify "status changed"
    Adm->>BE: create quote / invoice (totals server-side)
    Adm->>BE: record payment
    BE->>DB: update dashboard metrics
```

---

## 6. Service-request state machine

```mermaid
stateDiagram-v2
    [*] --> NEW
    NEW --> ASSIGNED: assign technician
    NEW --> CANCELLED: cancel
    ASSIGNED --> ACCEPTED: accept
    ASSIGNED --> CANCELLED: cancel
    ACCEPTED --> IN_PROGRESS: start
    ACCEPTED --> CANCELLED: cancel
    IN_PROGRESS --> COMPLETED: complete
    IN_PROGRESS --> WAITING_FOR_PART: wait for part
    IN_PROGRESS --> CANCELLED: cancel
    WAITING_FOR_PART --> IN_PROGRESS: resume
    WAITING_FOR_PART --> CANCELLED: cancel
    COMPLETED --> [*]
    CANCELLED --> [*]
```

Rules enforced in `ServiceRequestEntity`:

- `NEW → ASSIGNED` **only** via `assignTechnician` (fails if not `NEW`).
- `COMPLETED` and `CANCELLED` are **terminal**.
- Cancel is allowed from any non-terminal state.
- Any invalid transition → `IllegalStateException` → **HTTP 409 Conflict**.
- Every valid transition writes a **status-history audit row** (actor, from, to, note, time).

---

## 7. Inventory consistency (technician consumes a part)

```mermaid
flowchart TD
    A["Consume part request"] --> B["BEGIN transaction"]
    B --> C["Lock part row"]
    C --> D{"Enough stock?"}
    D -->|No| E["409 Conflict<br/>ROLLBACK"]
    D -->|Yes| F["Deduct quantity_on_hand"]
    F --> G["Write stock_transaction"]
    G --> H["Link to service request"]
    H --> I["COMMIT"]
```

Guarantees `quantity_on_hand` can never go negative, even under concurrent deductions.

---

## 8. Real-time notifications

```mermaid
flowchart LR
    A["Business action<br/>(assign / status change)"] --> B["Spring application event"]
    B --> C["DB transaction commits"]
    C --> D["Persist notification"]
    D --> E["WebSocket push<br/>/user/queue/notifications"]
    E --> F["React Query cache update"]
    F --> G["Notification bell updates"]
```

Fires when a technician is assigned (`SERVICE_REQUEST_ASSIGNED`) or when someone other
than the assigned technician changes a job's status.

---

## 9. Multi-tenancy (data isolation)

`organization_id` is read from the **signed JWT**, never from the request body. Every
query is scoped:

```sql
WHERE organization_id = :currentOrganizationId
```

No role can see or mutate another organization's data.

---

## 10. Role summary

- **Owner** — bootstraps the org, can do everything, sees reports.
- **Admin** — manages techs, parts, customers, billing; full operational control.
- **Dispatcher** — front desk: creates customers + requests, assigns techs, schedules,
  bills, watches the dashboard — but cannot work a job.
- **Technician** — works **only their own** assigned jobs: accept → start →
  (wait for part) → complete, consuming parts safely.
- **Customer** — currently a managed record (contact + assets + history), not a login;
  the self-service portal is designed but not built yet.
