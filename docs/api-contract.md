# API contract assumptions

The client was built before a server repository was available
(`../mentorlagbe-server` was empty). This document is therefore the contract the
frontend implements and the contract the server should satisfy. It is not a
description of an existing backend.

## Conventions

- Base URL: `NEXT_PUBLIC_API_URL`, for example `http://localhost:5000/api/v1`.
- Content type: JSON except avatar upload (`multipart/form-data`).
- Sessions: Better Auth cookie session. Every Axios request uses
  `withCredentials: true`; the API must allow the client origin with
  credentials.
- Dates: ISO 8601 strings where possible.
- IDs: strings. The client accepts `id`, `_id` or `value` when normalising.
- Authorization: the server enforces role, ownership, entitlement and
  moderation rules for every endpoint. Client guards are not a security layer.

## Response envelopes

The client accepts these single-resource shapes:

```json
{ "id": "abc", "name": "..." }
{ "data": { "id": "abc", "name": "..." } }
{ "result": { "id": "abc", "name": "..." } }
```

For lists it accepts an array directly or a resource array inside `items`,
`results`, `docs`, `data`, or a resource-named key (`tuitions`, `users`,
`applications`, `bookmarks`, `transactions`). Pagination metadata may be in
`meta`, `pagination` or `pageInfo`:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

`page`, `currentPage`, `limit`, `perPage`, `pageSize`, `total`, `totalItems`,
`count`, `totalPages`, `pages` and `pageCount` are accepted aliases.

## Errors

The client maps errors as follows:

| Status | Client behaviour |
| --- | --- |
| `400` | Generic invalid request message |
| `401` | Session expired; offer sign-in / redirect |
| `403` | Access denied; return to the user's dashboard |
| `404` | Not found; relevant back link |
| `409` | Conflict warning with the server message (limits, duplicates) |
| `422` | Validation message; form errors can be shown |
| `429` | Rate-limit message |
| `5xx` | Retryable server error |

Recommended error body:

```json
{
  "message": "A human-readable explanation.",
  "code": "OPTIONAL_MACHINE_CODE",
  "errors": [{ "field": "email", "message": "Enter a valid email." }]
}
```

`error` is accepted as an alias for `message`, and nested `data.message` is also
read.

## Authentication

Better Auth is mounted at `NEXT_PUBLIC_BETTER_AUTH_URL` (not under the versioned
API prefix). The client uses:

- `authClient.signUp.email({ name, email, password, role })`
- `authClient.signIn.email({ email, password, rememberMe })`
- `authClient.signOut()`
- `authClient.useSession()`

Registration accepts only `role: "student" | "tutor"`. Admin accounts must be
created or promoted by an authorised server/admin process.

The `role` additional field must be returned on the session user or from
`GET /users/me`. The UI treats the `/users/me` response as authoritative for
role and plan.

## Profiles

### `GET /users/me`

Roles: any authenticated user.

```json
{
  "id": "user_1",
  "name": "Ayesha Rahman",
  "email": "ayesha@example.com",
  "role": "student",
  "plan": "free",
  "image": "https://...",
  "phone": "+880...",
  "bio": "...",
  "location": "Dhaka",
  "createdAt": "2026-01-10T09:00:00.000Z"
}
```

### `PATCH /users/me`

Roles: any authenticated user. Accepts a partial body with `name`, `phone`,
`bio` and `location`. Role and plan are intentionally not accepted from this
endpoint.

### `POST /users/me/avatar`

Roles: any authenticated user. `multipart/form-data` with an `image` file.
Returns the updated user.

## Tuitions

### `GET /tuitions`

Public. Returns only approved and active posts.

Query: `search`, `subject`, `classLevel`, `mode`, `location`, `minFee`,
`maxFee`, `page`, `limit`, `sort`.

### `GET /tuitions/featured?limit=3`

Public. Returns featured approved tuitions.

### `GET /tuitions/:id`

Public. Returns an approved tuition. The client shows a not-found state for
`404`. If a non-approved post is returned to its owner, the UI marks it as
not publicly open.

### `GET /tuitions/mine`

Roles: tutor (admin may be allowed by the server if needed).

Query: `search`, `status`, `isActive`, `page`, `limit`. Returns the caller's own
posts, including pending and rejected ones.

### `POST /tuitions`

Roles: tutor. Server enforces the free-plan post limit and any required fields.

```json
{
  "title": "HSC Physics weekly tuition",
  "subject": "Physics",
  "classLevel": "HSC",
  "mode": "offline",
  "location": "Dhanmondi, Dhaka",
  "monthlyFee": 5000,
  "daysPerWeek": 3,
  "description": "Full syllabus coverage...",
  "requirements": "Previous tutoring experience preferred.",
  "availability": "Evenings after 6pm",
  "isActive": true
}
```

New posts may be returned with `status: "pending"`.

### `PATCH /tuitions/:id`

Roles: owning tutor. Accepts a partial tuition body. Ownership must be checked
server-side.

### `DELETE /tuitions/:id`

Roles: owning tutor. Removes the post and its related applications.

### `POST /tuitions/:id/apply`

Roles: student. Body: `{ "message": "Optional message" }`.

Returns `201` on success. A duplicate application should return `409`; the UI
shows a warning instead of a generic error.

## Applications

### `GET /applications/me`

Roles: student. Query: `status`, `search`, `page`, `limit`, `tuitionId`.
Returns the caller's applications with the related tuition when available.

### `GET /applications/tutor`

Roles: tutor. Query: `status`, `search`, `page`, `limit`, `tuitionId`.
Returns applications across the caller's tuition posts. The server must not
return applications for posts owned by another tutor.

### `PATCH /applications/:id/status`

Roles: owning tutor. Body: `{ "status": "accepted" | "rejected" }`.

Only pending applications should be changeable. The server decides whether
contact details are released after acceptance.

### `DELETE /applications/:id`

Roles: student who owns the application. Cancels a pending application. The
server must reject cancellation after a final status.

## Bookmarks

### `GET /bookmarks`

Roles: student. Returns the caller's bookmarks with related tuition data.

### `POST /bookmarks`

Roles: student. Body: `{ "tuitionId": "..." }`.

The server enforces the free-plan limit (five) and duplicate rules (`409`).

### `DELETE /bookmarks/:id`

Roles: student who owns the bookmark.

### `DELETE /bookmarks/tuition/:tuitionId`

Roles: student. Removes a bookmark by tuition ID. The client uses this fallback
when the list response does not expose a bookmark ID.

## Admin

All admin endpoints require `role: "admin"` and must return `403` otherwise.

### `GET /admin/stats`

```json
{
  "users": { "total": 120, "students": 90, "tutors": 28, "admins": 2 },
  "tuitions": {
    "total": 45,
    "pending": 6,
    "approved": 35,
    "rejected": 4,
    "active": 30
  },
  "transactions": {
    "total": 20,
    "paid": 15,
    "pending": 3,
    "failed": 2,
    "revenue": 210,
    "currency": "USD"
  }
}
```

Flat aliases such as `totalUsers`, `totalTuitions` and `totalTransactions` are
also accepted.

### `GET /admin/users`

Query: `search`, `role`, `page`, `limit`. Returns user records.

### `PATCH /admin/users/:id`

Body: `{ "role": "student" | "tutor" | "admin" }`.

The UI disables self-role changes, but the server must enforce that rule and any
additional admin policy.

### `GET /admin/tuitions`

Query: `search`, `status` (`pending`/`approved`/`rejected`), `page`, `limit`.

### `PATCH /admin/tuitions/:id/moderate`

Body:

```json
{
  "status": "approved",
  "reason": "Optional for approval; required by the UI for rejection."
}
```

The server records the decision and moderator. Only approved and active posts
may appear in public search.

### `GET /admin/transactions`

Query: `search`, `status`, `page`, `limit`. Returns payment records.

## Payments and subscriptions

### `POST /payments/checkout`

Roles: signed-in student or tutor.

```json
{
  "plan": "student_pro",
  "role": "student"
}
```

Allowed plan IDs: `student_pro`, `tutor_pro`. The server validates that the plan
matches the caller's role and returns either:

```json
{ "url": "https://checkout.stripe.com/..." }
```

or, for the legacy client fallback:

```json
{ "sessionId": "cs_test_..." }
```

A server-provided `url` is strongly preferred. Stripe secret keys, webhook
secrets and price IDs must never be sent to the client.

### `GET /payments/status?session_id=...`

Roles: the authenticated purchaser. Returns the authoritative result:

```json
{
  "status": "paid",
  "plan": "student_pro",
  "amount": 10,
  "currency": "USD",
  "message": "Payment confirmed."
}
```

Statuses: `paid`, `pending`, `processing`, `failed`, `refunded`, `cancelled`,
`unknown`.

The success page may poll or refresh this endpoint, but it must never grant a
plan based on the presence of `session_id` in the URL.

### Server-side entitlement rules

- A Stripe webhook or equivalent verified server process updates the transaction
  and the user's plan.
- The client re-reads `/users/me` for plan state; it does not infer entitlement
  from local storage.
- Pro pricing is $10 for Student Pro and $15 for Tutor Pro. Billing cadence is
  an open product decision and must be shown by checkout before payment.

## Field normalisation the client tolerates

The normalisers in `lib/normalize.ts` accept common aliases so the UI is
resilient while the API stabilises:

- User: `fullName`, `username`, `avatar`, `photoURL`, `phoneNumber`, `mobile`,
  `subscription.plan`, `isPro`.
- Tuition: `name`, `class`, `grade`, `level`, `fee`, `salary`, `budget`, `days`,
  `schedule`, `details`, `post` (for nested data).
- Application: `applicant`, `user`, `note`, `post`.
- Transaction: `total`, `price`, `planName`, `product`, `transactionId`,
  `stripeSessionId`.

These aliases are compatibility aids, not a reason to avoid documenting a stable
API shape.
