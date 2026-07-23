# Fixonaut — Access Token and Refresh Token Flow

> Give this document to Cursor. Implement the backend first, then the frontend. Do not implement the frontend against fake endpoints.

## 1. Goal

Fixonaut must keep users signed in when a short-lived access token expires.

Target behavior:

```text
User logs in
    ↓
Access token expires after 15 minutes
    ↓
Frontend silently calls /auth/refresh
    ↓
Backend validates HttpOnly refresh cookie
    ↓
New access token is returned
    ↓
Original API request is retried
    ↓
User continues without seeing the login page
```

If the refresh token is expired, revoked, invalid, or reused:

```text
Refresh fails
    ↓
Frontend clears auth state
    ↓
Frontend redirects to /login
    ↓
Frontend shows session-expired message
```

## 2. Security decisions

### Access token

- JWT access token.
- Lifetime: 15 minutes.
- Stored only in frontend memory using Zustand.
- Never store in localStorage.
- Sent using the Authorization header.

```http
Authorization: Bearer <access-token>
```

### Refresh token

- Opaque random token, not a JWT.
- Lifetime: 7 days.
- Stored in a Secure, HttpOnly cookie.
- Never returned in JSON.
- Store only a SHA-256 hash in the database.
- Rotate on every successful refresh.
- Revoke on logout.

### Cookie

Production:

```http
Set-Cookie: refresh_token=<opaque-token>; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth
```

Local development:

```http
Set-Cookie: refresh_token=<opaque-token>; HttpOnly; SameSite=Lax; Path=/api/v1/auth
```

Because the frontend is hosted on Vercel and the backend on Render, production requires:

```text
Secure=true
SameSite=None
Frontend Axios withCredentials=true
Backend CORS allowCredentials=true
Exact Vercel origin, without trailing slash
```

## 3. Current implementation to preserve

Already existing:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
JWT access-token generation
JWT validation through Spring Security
BCrypt password hashing
Zustand auth store
Axios request interceptor
ProtectedRoute
```

Current login response:

```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "user-id",
    "name": "Rajesh Patel",
    "email": "rajesh@example.com",
    "organizationId": "organization-id",
    "roles": ["OWNER"]
  }
}
```

## 4. Database migration

Do not edit an applied migration. Create the next migration, for example:

```text
V13__create_refresh_tokens.sql
```

Schema:

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token_hash VARCHAR(128) NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    replaced_by_token_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_used_at TIMESTAMPTZ,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_tokens_replaced_by
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES refresh_tokens(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_refresh_tokens_user_id
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at);
```

## 5. Backend domain classes

Create a `RefreshTokenEntity` with:

```text
id
user
 tokenHash
expiresAt
revokedAt
replacedByToken
createdAt
lastUsedAt
```

Business methods:

```java
boolean isExpired()
boolean isRevoked()
boolean isUsable()
void revoke()
void markUsed()
void replaceWith(RefreshTokenEntity replacement)
```

Create:

```text
RefreshTokenRepository
```

Required methods:

```java
Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

@Modifying
@Query("""
       UPDATE RefreshTokenEntity token
       SET token.revokedAt = CURRENT_TIMESTAMP
       WHERE token.user.id = :userId
         AND token.revokedAt IS NULL
       """)
int revokeAllForUser(UUID userId);
```

## 6. Refresh-token generation

Generate a cryptographically secure opaque token:

```java
SecureRandom secureRandom = new SecureRandom();
byte[] bytes = new byte[64];
secureRandom.nextBytes(bytes);
String rawToken = Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(bytes);
```

Hash before storing:

```java
MessageDigest digest = MessageDigest.getInstance("SHA-256");
byte[] hash = digest.digest(
        rawToken.getBytes(StandardCharsets.UTF_8)
);
String tokenHash = HexFormat.of().formatHex(hash);
```

Rules:

- Send `rawToken` only in the cookie.
- Store only `tokenHash` in PostgreSQL.
- Never log `rawToken`.
- Never return `rawToken` in JSON.

## 7. Backend DTOs

Create:

```text
RefreshResponse.java
```

```java
public record RefreshResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        AuthenticatedUserResponse user
) {
}
```

No refresh-token value belongs in this response.

## 8. Backend endpoints

### Login

```http
POST /api/v1/auth/login
```

Behavior:

1. Validate credentials.
2. Generate access JWT.
3. Generate refresh token.
4. Store refresh-token hash.
5. Set refresh cookie.
6. Return access token and user.

### Refresh

```http
POST /api/v1/auth/refresh
```

Behavior:

1. Read `refresh_token` cookie.
2. Reject if missing.
3. Hash raw cookie value.
4. Find matching database record.
5. Reject if missing, expired, or revoked.
6. Check user is active.
7. Create a new refresh token.
8. Revoke the old refresh token.
9. Link old token to the replacement.
10. Set replacement cookie.
11. Generate a new access JWT.
12. Return access token and user.

Response:

```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "user-id",
    "name": "Rajesh Patel",
    "email": "rajesh@example.com",
    "organizationId": "organization-id",
    "roles": ["OWNER"]
  }
}
```

### Logout

```http
POST /api/v1/auth/logout
```

Behavior:

1. Read refresh cookie.
2. Hash it.
3. Revoke matching token if found.
4. Clear the cookie.
5. Return HTTP 204.

Logout should succeed even if the cookie is already missing or expired.

### Logout all sessions

Optional future endpoint:

```http
POST /api/v1/auth/logout-all
```

Revokes all active refresh tokens for the current user.

## 9. Cookie helper

Create a backend cookie helper so cookie configuration is not duplicated.

Required configuration:

```properties
fixonaut.auth.refresh-token-cookie-name=refresh_token
fixonaut.auth.refresh-token-expiration-seconds=604800
fixonaut.auth.cookie-secure=${FIXONAUT_COOKIE_SECURE:false}
fixonaut.auth.cookie-same-site=${FIXONAUT_COOKIE_SAME_SITE:Lax}
```

Production Render variables:

```text
FIXONAUT_COOKIE_SECURE=true
FIXONAUT_COOKIE_SAME_SITE=None
```

Local development:

```text
FIXONAUT_COOKIE_SECURE=false
FIXONAUT_COOKIE_SAME_SITE=Lax
```

The cookie must include:

```text
HttpOnly
Path=/api/v1/auth
Secure according to environment
SameSite according to environment
MaxAge = 7 days
```

## 10. CORS requirements

Backend CORS must include:

```java
.allowedOrigins(exactFrontendOrigin)
.allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
.allowedHeaders("*")
.allowCredentials(true)
```

Production:

```text
FIXONAUT_CORS_ALLOWED_ORIGINS=https://fixonaut-ochre.vercel.app
```

No trailing slash.

Correct:

```text
https://fixonaut-ochre.vercel.app
```

Incorrect:

```text
https://fixonaut-ochre.vercel.app/
```

Security configuration must permit CORS preflight:

```java
.cors(Customizer.withDefaults())
```

and:

```java
.requestMatchers(HttpMethod.OPTIONS, "/**")
.permitAll()
```

## 11. Frontend auth-store changes

Update `auth-store.ts` with:

```text
sessionExpired: boolean
setSessionExpired(): void
```

Behavior:

```text
setAuth()
→ sessionExpired = false

clearAuth()
→ user = null
→ accessToken = null
→ isAuthenticated = false
```

The store must not persist access tokens to localStorage.

## 12. Frontend Axios refresh behavior

Create a single refresh promise to prevent multiple simultaneous refresh requests.

Flow:

```text
Normal API request
        ↓
401 response
        ↓
If request is /auth/refresh → logout immediately
        ↓
If request has already been retried → logout
        ↓
Call POST /auth/refresh with credentials
        ↓
Set new access token in Zustand
        ↓
Retry original request once
```

Axios instance must use:

```ts
withCredentials: true
```

Pseudo-code:

```ts
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<RefreshResponse>(
        "/auth/refresh",
        {},
        { withCredentials: true },
      )
      .then((response) => {
        useAuthStore.getState().setAuth(
          response.data.user,
          response.data.accessToken,
        );

        return response.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
```

Do not create an infinite 401 retry loop.

## 13. Frontend application bootstrap

Create:

```text
src/features/auth/use-session-bootstrap.ts
```

On app startup:

```text
If user/token already exists in memory:
    mark bootstrap complete

Otherwise:
    call POST /auth/refresh

If successful:
    setAuth(user, accessToken)

If failed:
    remain unauthenticated

Always:
    mark bootstrap complete
```

Protected routes must wait for bootstrap before redirecting:

```text
bootstrap loading → show Restoring session...
bootstrap complete + authenticated → render app
bootstrap complete + unauthenticated → redirect login
```

## 14. Frontend login changes

On login:

```text
POST /auth/login with credentials
        ↓
Backend sets refresh cookie
        ↓
Frontend stores access token in Zustand
        ↓
Redirect to requested route
```

Add a link:

```text
No account? Create an organization
```

Route:

```text
/register
```

If redirected after a 401, show:

```text
Your session expired. Please sign in again.
```

## 15. Frontend logout changes

Logout flow:

```text
POST /api/v1/auth/logout
        ↓
Backend revokes refresh token
        ↓
Backend clears cookie
        ↓
Frontend clears Zustand
        ↓
Frontend disconnects WebSocket
        ↓
Navigate to /login
```

If the logout request fails, still clear local auth state and redirect to login.

## 16. WebSocket refresh behavior

When the access token changes after refresh:

```text
Disconnect old WebSocket
        ↓
Connect using new access token
        ↓
Subscribe to /user/queue/notifications
```

Do not open multiple WebSocket connections for one user session.

## 17. Environment values

### Local frontend

```env
VITE_API_BASE_URL=/api/v1
VITE_WS_URL=ws://localhost:8080/ws
```

### Production frontend

```env
VITE_API_BASE_URL=https://fixonaut-backend.onrender.com/api/v1
VITE_WS_URL=wss://fixonaut-backend.onrender.com/ws
```

### Local backend

```properties
fixonaut.auth.cookie-secure=false
fixonaut.auth.cookie-same-site=Lax
```

### Render backend

```text
FIXONAUT_COOKIE_SECURE=true
FIXONAUT_COOKIE_SAME_SITE=None
FIXONAUT_CORS_ALLOWED_ORIGINS=https://fixonaut-ochre.vercel.app
```

## 18. Security requirements

- Never return refresh tokens in JSON.
- Never store refresh tokens in localStorage.
- Store only refresh-token hashes in PostgreSQL.
- Rotate refresh tokens on every refresh.
- Revoke refresh tokens on logout.
- Reject expired refresh tokens.
- Reject inactive users.
- Do not log cookie values or JWT values.
- Use exact CORS origins.
- Set `Secure=true` in production.
- Do not use wildcard CORS with credentials.
- Prevent refresh retry loops.

## 19. Acceptance criteria

### Registration

- `/register` is public.
- Valid registration creates an owner account.
- Invalid fields show errors.
- Duplicate email/slug errors are shown.
- Successful registration redirects to `/login`.

### Login

- Login sets the refresh cookie.
- Login stores access token in Zustand.
- Login redirects to the requested route.

### Page refresh

- Refreshing the page calls `/auth/refresh`.
- A valid refresh cookie restores the session.
- User remains on the current protected route.
- Invalid refresh cookie redirects to login.

### Expired access token

- A 401 triggers one refresh attempt.
- Original request is retried once after refresh.
- Concurrent 401s share one refresh request.
- Failed refresh clears auth state.

### Logout

- Backend revokes refresh token.
- Cookie is cleared.
- Zustand is cleared.
- WebSocket disconnects.
- User is redirected to login.

## 20. Implementation order

```text
1. V13 refresh_tokens migration
2. RefreshTokenEntity
3. RefreshTokenRepository
4. RefreshTokenService
5. Cookie helper
6. Login cookie creation
7. /auth/refresh endpoint
8. /auth/logout endpoint
9. Backend CORS and cookie configuration
10. Frontend auth-store sessionExpired state
11. Axios refresh interceptor
12. Session bootstrap
13. PublicOnlyRoute
14. RegisterPage
15. Login redirect and session-expired message
16. WebSocket reconnect after token refresh
17. Local verification
18. Render/Vercel environment update
```

## 21. Do not implement yet

Do not implement these in this task:

```text
Customer portal
Customer invitation system
Technician email invitation
Multi-organization customer identity
OAuth/social login
Password reset email
```

Those require separate backend designs.
