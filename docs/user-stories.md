# Fixonaut — User Stories and Acceptance Criteria

## Epic A — Authentication and organization

### US-A01: Register organization

**As a** business owner,  
**I want** to register my organization and create my owner account,  
**so that** I can start using Fixonaut.

Acceptance criteria:

- Organization name is required.
- Owner name, email, and password are required.
- Email must be unique according to the defined identity policy.
- Password is never stored in plain text.
- The owner is associated with the new organization.

### US-A02: Log in

**As a** registered user,  
**I want** to log in securely,  
**so that** I can access features allowed for my role.

Acceptance criteria:

- Invalid credentials return a safe error.
- Successful login returns an authenticated session.
- Protected endpoints reject unauthenticated requests.

### US-A03: Enforce tenant isolation

**As** an organization user,  
**I want** to see only my organization’s data,  
**so that** business information is private.

Acceptance criteria:

- A user cannot retrieve another organization’s customer by ID.
- A user cannot update another organization’s service request.
- Collection endpoints never return another organization’s data.

## Epic B — Customers and assets

### US-B01: Create customer

**As an** admin or dispatcher,  
**I want** to create a customer,  
**so that** I can record who needs service.

Acceptance criteria:

- Name and phone are required.
- Invalid email is rejected.
- The customer is associated with the current organization.
- A success response returns the created customer.

### US-B02: Record customer asset

**As an** admin or dispatcher,  
**I want** to record a customer’s equipment,  
**so that** technicians can see its service history.

Acceptance criteria:

- Asset must belong to an existing customer in the same organization.
- Serial number can be recorded when available.
- Warranty and installation dates are validated.

## Epic C — Service requests

### US-C01: Create request

**As a** dispatcher or customer,  
**I want** to create a service request,  
**so that** the business can plan the work.

Acceptance criteria:

- Customer and problem description are required.
- New requests begin in `NEW` status.
- Priority defaults to `NORMAL` if not supplied.
- Creation is recorded in the audit history.

### US-C02: Assign technician

**As a** dispatcher,  
**I want** to assign a technician to a request,  
**so that** the job has an owner.

Acceptance criteria:

- Only authorized dispatcher/admin roles can assign.
- Technician must belong to the same organization.
- Conflicting appointments are rejected.
- Status changes from `NEW` to `ASSIGNED`.

### US-C03: Enforce state transitions

**As** the system,  
**I want** to reject invalid state transitions,  
**so that** job history remains trustworthy.

Acceptance criteria:

- `NEW` cannot move directly to `COMPLETED`.
- `ASSIGNED` can move to `ACCEPTED` or `CANCELLED`.
- Invalid transitions return HTTP 409.
- Every valid transition creates a history record.

### US-C04: Complete service request

**As a** technician,  
**I want** to complete a job with notes and parts used,  
**so that** the customer and business have a reliable service record.

Acceptance criteria:

- Only the assigned technician or authorized admin can complete the job.
- Completion notes are required.
- Parts used are validated against available stock.
- The job cannot complete if the inventory transaction fails.

## Epic D — Inventory and billing

### US-D01: Manage parts

**As an** admin,  
**I want** to create and update parts,  
**so that** technicians can record materials used.

Acceptance criteria:

- Part name and unit are required.
- Quantity cannot be negative.
- Low-stock threshold can be configured.

### US-D02: Deduct part safely

**As a** technician,  
**I want** to record a part used on a job,  
**so that** inventory remains accurate.

Acceptance criteria:

- Deduction happens inside a transaction.
- Negative stock is impossible.
- Concurrent deductions are handled safely.
- A stock transaction is recorded.

### US-D03: Create invoice

**As** an authorized user,  
**I want** to generate an invoice from labor and parts,  
**so that** the customer can understand the charge.

Acceptance criteria:

- Totals are calculated by the backend.
- Invoice items are stored.
- An issued invoice cannot be silently modified.
- Payment status is tracked.

## Epic E — Quality and operations

### US-E01: View dashboard

**As a** dispatcher or admin,  
**I want** to see operational metrics,  
**so that** I can understand current workload.

Acceptance criteria:

- Dashboard is organization-scoped.
- Metrics have documented definitions.
- Loading, empty, and error states are handled.

### US-E02: Audit important actions

**As an** organization admin,  
**I want** to inspect important changes,  
**so that** I can understand who changed operational data.

Acceptance criteria:

- Actor and organization are recorded.
- Entity and action are recorded.
- Timestamp is recorded.
- Relevant before/after data is available.
