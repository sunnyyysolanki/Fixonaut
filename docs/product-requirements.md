# Fixonaut — Product Requirements Document

**Status:** Draft v0.1  
**Owner:** Fixonaut team  
**Date:** 2026-07-19  
**Product:** Fixonaut Field-Service Management Platform

## 1. Product vision

Fixonaut helps small repair and maintenance businesses replace scattered phone calls, WhatsApp messages, notebooks, and spreadsheets with one reliable system for managing service work.

## 2. Problem statement

Small service businesses need to coordinate customers, technicians, appointments, parts, and payments. Their current processes often make it difficult to:

- See the current status of every service job
- Assign work to the right technician
- Prevent appointment conflicts
- Track equipment and service history
- Know which spare parts were used
- Keep customers informed
- Understand revenue and operational performance

## 3. Target customers

The initial demo domain is small appliance, RO, AC, solar, and general maintenance businesses with approximately 2–30 technicians.

Fixonaut is not initially designed for large enterprise field-service operations.

## 4. User roles

### Organization owner/admin

- Creates and configures the organization
- Manages users, roles, technicians, parts, and service settings
- Views reports

### Dispatcher

- Reviews service requests
- Schedules appointments
- Assigns technicians
- Monitors open work

### Technician

- Views assigned jobs
- Accepts or rejects assignments
- Updates job status
- Records diagnosis, notes, photos, and parts used
- Completes service work

### Customer

- Creates service requests
- Views appointment and job status
- Approves estimates
- Views service history and invoices
- Provides feedback

## 5. Version 1 goals

1. Provide a complete service-request-to-completion workflow.
2. Enforce secure role-based access.
3. Isolate data between organizations.
4. Prevent invalid job-status transitions.
5. Track parts accurately without allowing negative inventory.
6. Provide a usable dashboard for daily operations.
7. Deploy a working demo with automated tests.

## 6. Version 1 non-goals

- Native Android/iOS applications
- Live GPS tracking
- Full route optimization
- Accounting-system integration
- Online payment settlement
- AI diagnosis or autonomous agents
- Microservices and Kubernetes
- Government or tax compliance claims

## 7. Core workflow

```text
Customer creates request
        ↓
Dispatcher reviews request
        ↓
Technician is assigned
        ↓
Technician accepts assignment
        ↓
Technician starts service
        ↓
Diagnosis, parts, and notes are recorded
        ↓
Customer approves estimate when required
        ↓
Work is completed
        ↓
Invoice is created and payment status is recorded
```

## 8. Functional requirements

### FR-01 Authentication

Users must be able to register, log in, log out, and access only protected functionality permitted by their role.

### FR-02 Organization management

An owner must be able to create an organization and invite or create users within it.

### FR-03 Customer management

Authorized users must be able to create, view, update, search, and paginate customers belonging to their organization.

### FR-04 Asset management

Authorized users must be able to record equipment or assets belonging to customers, including model, serial number, installation date, warranty period, and service history.

### FR-05 Service requests

Authorized users must be able to create service requests with customer, asset, priority, description, and preferred appointment information.

### FR-06 Assignment

Dispatchers must be able to assign a technician. The backend must prevent assignment conflicts.

### FR-07 Status workflow

The backend must enforce valid state transitions and record every transition.

### FR-08 Inventory

Authorized users must be able to manage parts and record parts used on a job. Inventory must not become negative.

### FR-09 Quotes and invoices

Authorized users must be able to create a quote or invoice from labor and parts. Totals must be calculated on the backend.

### FR-10 Auditability

Important actions must record actor, organization, action, entity, timestamp, and relevant before/after information.

### FR-11 Dashboard

Authorized users must be able to view open jobs, completed jobs, pending approvals, low-stock parts, and selected performance metrics.

## 9. Non-functional requirements

### Security

- Passwords must be securely hashed.
- APIs must validate authentication and authorization.
- Organization ownership must be derived from the authenticated user, not trusted from request input.
- Uploaded files must be validated.
- Secrets must never be committed.

### Performance

- List endpoints must support pagination.
- Common search fields must be indexed.
- Dashboard queries must be measured and optimized when needed.

### Reliability

- Critical business operations must be transactional.
- Invalid state changes must return a clear conflict response.
- Errors must use a consistent API format.

### Maintainability

- Backend modules must have clear boundaries.
- API contracts must be documented.
- Database changes must use Flyway migrations.
- Important architecture decisions must have ADRs.

### Accessibility and usability

- Forms must have labels and validation messages.
- Interfaces must support keyboard navigation where practical.
- Every screen must handle loading, empty, error, and success states.

## 10. Success criteria for Version 1

- A new organization can be created.
- Admin can create a customer and technician.
- Dispatcher can create and assign a service request.
- Technician can progress and complete a valid job.
- Parts used are deducted safely.
- An invoice can be generated.
- Customer and organization isolation tests pass.
- Critical workflows have automated tests.
- Application is deployed and documented.
