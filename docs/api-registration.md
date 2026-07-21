# Fixonaut Registration API Contract

**Endpoint:** `POST /api/v1/auth/register`  
**Status:** Draft v1  
**Purpose:** Create a new Fixonaut organization and its owner account atomically.

---

## 1. Business purpose

A new business owner can register an organization and create the first user account in one operation.

The first user automatically receives the `OWNER` role.

The organization and owner user must either both be created successfully or both be rolled back.

---

## 2. Endpoint

```http
POST /api/v1/auth/register
Content-Type: application/json
```

This endpoint is public and does not require authentication.

---

## 3. Request body

```json
{
  "organizationName": "Umreth Home Services",
  "organizationSlug": "umreth-home-services",
  "name": "Rajesh Patel",
  "email": "rajesh@example.com",
  "password": "SecurePass123!"
}
```

### Request fields

| Field | Type | Required | Rules |
|---|---|---:|---|
| `organizationName` | string | Yes | 2–150 characters |
| `organizationSlug` | string | Yes | Lowercase letters, numbers, and hyphens; max 100 characters |
| `name` | string | Yes | 2–120 characters |
| `email` | string | Yes | Valid email; normalized to lowercase |
| `password` | string | Yes | 8–72 characters |

### Valid organization slugs

```text
umreth-home-services
fixonaut-demo
abc-repair-123
```

### Invalid organization slugs

```text
Umreth Home Services
umreth_home_services
umreth home services
```

---

## 4. Successful response

### HTTP status

```text
201 Created
```

### Response body

```json
{
  "userId": "0f8fad5b-d9cb-469f-a165-70867728950e",
  "organizationId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "organizationName": "Umreth Home Services",
  "userName": "Rajesh Patel",
  "email": "rajesh@example.com",
  "role": "OWNER"
}
```

### Response headers

```http
Location: /api/v1/organizations/{organizationId}
```

The response must never include:

```text
password
passwordHash
internal security details
```

---

## 5. Validation error

### HTTP status

```text
400 Bad Request
```

### Example request

```json
{
  "organizationName": "",
  "organizationSlug": "invalid slug",
  "name": "R",
  "email": "not-an-email",
  "password": "123"
}
```

### Response

```json
{
  "timestamp": "2026-07-20T12:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "path": "/api/v1/auth/register",
  "fieldErrors": {
    "organizationName": "Organization name is required",
    "organizationSlug": "Slug may contain only lowercase letters, numbers, and hyphens",
    "name": "Name must contain at least 2 characters",
    "email": "Email must be valid",
    "password": "Password must contain at least 8 characters"
  },
  "traceId": "abc-123"
}
```

---

## 6. Duplicate email error

### HTTP status

```text
409 Conflict
```

### Response

```json
{
  "timestamp": "2026-07-20T12:00:00Z",
  "status": 409,
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "An account with this email already exists",
  "path": "/api/v1/auth/register",
  "fieldErrors": {},
  "traceId": "abc-123"
}
```

The API must not reveal whether an email exists in systems where account enumeration protection is required. For our learning project, this explicit response is acceptable and will be documented as a trade-off.

---

## 7. Duplicate organization slug error

### HTTP status

```text
409 Conflict
```

### Response

```json
{
  "timestamp": "2026-07-20T12:00:00Z",
  "status": 409,
  "code": "ORGANIZATION_SLUG_ALREADY_EXISTS",
  "message": "This organization slug is already in use",
  "path": "/api/v1/auth/register",
  "fieldErrors": {},
  "traceId": "abc-123"
}
```

---

## 8. Registration sequence

```text
Client
  │
  │ POST /api/v1/auth/register
  ▼
AuthController
  │
  │ Request validation
  ▼
RegistrationService
  │
  ├── Normalize email to lowercase
  ├── Normalize slug to lowercase
  ├── Check duplicate email
  ├── Check duplicate organization slug
  ├── Hash password with BCrypt
  ├── Create organization
  ├── Create owner user
  ├── Assign OWNER role
  └── Commit transaction
  │
  ▼
RegisterResponse
  │
  ▼
HTTP 201 Created
```

---

## 9. Transaction boundary

The complete operation is transactional:

```text
Transaction starts
      ↓
Create organization
      ↓
Create owner user
      ↓
Create OWNER role
      ↓
Commit all changes
```

If any step fails:

```text
Rollback organization
Rollback user
Rollback role
```

We must never leave an organization without an owner account.

---

## 10. Security requirements

- Passwords must be hashed using BCrypt before persistence.
- Plain-text passwords must never be logged.
- Passwords must never be returned in API responses.
- Email must be normalized before duplicate checks.
- Organization slug must be normalized before duplicate checks.
- The endpoint must be rate-limited in a future production version.
- Validation messages must not expose database details.

---

## 11. Planned implementation classes

```text
backend/src/main/java/com/fixonaut/backend/auth/
├── AuthController.java
├── RegistrationService.java
├── RegisterRequest.java
└── RegisterResponse.java
```

Supporting classes:

```text
organization/OrganizationRepository.java
user/UserRepository.java
organization/OrganizationEntity.java
user/UserEntity.java
user/UserRole.java
security/SecurityConfig.java
```

---

## 12. Acceptance criteria

- Valid registration returns HTTP 201.
- Organization is created.
- User is created within the organization.
- User receives the `OWNER` role.
- Password is stored as a BCrypt hash.
- Email is normalized to lowercase.
- Slug is normalized to lowercase.
- Duplicate email returns HTTP 409.
- Duplicate slug returns HTTP 409.
- Invalid request returns HTTP 400 using the standard error format.
- If user creation fails, organization creation is rolled back.
- No password appears in logs or responses.
- Unit and integration tests cover the important cases.

---

## 13. Design trade-offs

### One organization per user

Version 1 associates each user with one organization. This keeps authentication and tenant isolation simple.

A future version may introduce:

```text
organization_memberships
```

to support one user belonging to multiple organizations.

### Globally unique email

Version 1 uses globally unique email addresses. This makes login unambiguous.

### No automatic login yet

Registration initially returns account information only. JWT login will be implemented as a separate endpoint so registration and authentication remain independently testable.
