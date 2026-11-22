# MentorLagbe Client

The MentorLagbe frontend is a Next.js App Router application for a tuition
marketplace with three roles: **student**, **tutor** and **admin**. It covers
public discovery, Better Auth sessions, role dashboards, application and
bookmark workflows, tuition publishing and moderation, subscription checkout,
and payment result pages.

> **Implementation status**
>
> This repository is the client only. At build time the companion server
> (`../mentorlagbe-server`) was empty, so the HTTP contract in
> [`docs/api-contract.md`](docs/api-contract.md) is an explicit client-side
> assumption, not a verified backend implementation. Every screen handles
> loading, empty, error and permission states so the UI degrades predictably
> while the API is being built.
>
> The frontend is **not** the authority for permissions, entitlements, payment
> status, moderation or ownership. Client-side guards and badges are UX only.
> Every mutating request must be authorised and validated again by the server.

## Implemented surface

### Public

- Homepage with search entry point, featured tuitions, how it works, student
  and tutor benefits, plan preview and trust content.
- Tuition discovery with server-side search, subject, class level, mode,
  location, fee range, sorting and pagination.
- Tuition details with tutor summary, bookmark toggle and an application dialog.
- Pricing with Student Pro ($10) and Tutor Pro ($15) plan comparisons.
- About page and public navigation.
- Sign in and student/tutor registration. Admin registration is not exposed.
- Payment success and cancel result pages. The success page reads the
  authoritative status from the API; the redirect alone never grants a plan.

### Student dashboard

- Overview with application counts, recent applications, saved tuitions and
  next steps.
- Applications list with status/search filters, pagination and cancellation
  while pending.
- Saved tuitions with details links and bookmark removal.

### Tutor dashboard

- Overview with post counts, moderation state, active posts, applicant counts
  and recent activity.
- Tuition table with search/status filters, active toggle, edit and delete.
- Create and edit tuition forms with React Hook Form + Zod validation.
- Applicant review with accept/reject confirmation and status/search filters.

### Admin dashboard

- Platform overview with user, tuition and transaction statistics, pending
  moderation and recent payments.
- User search and role management. Self-role changes are blocked in the UI and
  remain subject to server authorisation.
- Tuition moderation queue with approve/reject decisions and a rejection reason.
- Transaction history with search, status filters and pagination.

### Shared account

- `/dashboard/profile` with name, phone, location, bio and avatar upload.
- Role, plan, email and join date are read-only. There is no self-service role
  or plan escalation.
- `/dashboard` resolves to the signed-in user's role dashboard.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Homepage |
| `/tuitions` | Public | Search and browse approved tuitions |
| `/tuitions/[id]` | Public | Tuition details and application entry |
| `/pricing` | Public | Free/Pro comparison and checkout entry |
| `/about` | Public | Product information |
| `/sign-in` | Public | Better Auth sign in |
| `/sign-up` | Public | Student or tutor registration |
| `/payment/success` | Public result page | Server-confirmed payment status |
| `/payment/cancel` | Public result page | Cancelled checkout |
| `/dashboard` | Authenticated | Redirects to the role dashboard |
| `/dashboard/student` | Student | Overview |
| `/dashboard/student/applications` | Student | Application tracking |
| `/dashboard/student/bookmarks` | Student | Saved tuitions |
| `/dashboard/tutor` | Tutor | Overview |
| `/dashboard/tutor/tuitions` | Tutor | Manage own tuitions |
| `/dashboard/tutor/tuitions/new` | Tutor | Create a tuition |
| `/dashboard/tutor/tuitions/[id]/edit` | Tutor | Edit a tuition |
| `/dashboard/tutor/applicants` | Tutor | Review applicants |
| `/dashboard/admin` | Admin | Platform overview |
| `/dashboard/admin/users` | Admin | User and role management |
| `/dashboard/admin/tuitions` | Admin | Moderation queue |
| `/dashboard/admin/transactions` | Admin | Payment records |
| `/dashboard/profile` | Any signed-in role | Profile and avatar |

## Tech stack

- Next.js 16 App Router with `cacheComponents` and partial prefetching
- React 19 and TypeScript
- Tailwind CSS v4 with the Shadcn/Base UI primitives in `components/ui`
- React Hook Form, Zod and `@hookform/resolvers`
- Axios with one central client in `lib/api.ts`
- Better Auth React client for cookie sessions
- Stripe.js for the legacy checkout fallback (server-provided Checkout URLs are
  preferred)
- Lucide icons and Sonner toasts

## Getting started

Requirements: Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Run the checks used for this implementation:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Environment variables

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Public origin used for links and metadata |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5000/api/v1` | Versioned API base URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Yes | `http://localhost:5000` | Better Auth server origin; cookies are sent with credentials |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For checkout | `pk_test_...` | Public key only. Secret keys and webhook secrets stay on the server |

Only `NEXT_PUBLIC_*` values are available to browser code. Do not add server
secrets to this project.

## API contract

The client expects the endpoints, payloads, pagination envelope and error
shapes documented in [`docs/api-contract.md`](docs/api-contract.md). In summary:

- Session cookies are sent with `withCredentials: true` from the Axios client.
- Response envelopes such as `{ data }` and `{ result }` are unwrapped.
- List responses may use `items`, `results`, `docs`, `data` or a resource-named
  array, with pagination metadata in `meta`, `pagination` or `pageInfo`.
- HTTP `401`, `403`, `404`, `409`, `422` and `5xx` responses map to distinct UI
  states: sign in again, forbidden, not found, conflict, validation and retry.
- Application fields are normalised tolerantly (`_id`, `fee`, `salary`,
  `budget`, `days`, `schedule`, and similar aliases), but the API should still
  return stable, documented names.

## State and validation coverage

| State | Behaviour |
| --- | --- |
| Loading | Skeletons or a labelled page loader; filters stay usable where appropriate |
| Empty | Resource-specific empty state with a useful next action |
| Success | Data rendered with status badges and pagination |
| Validation error | Field-level Zod messages plus a server-error alert for API failures |
| Unauthorized (401) | Dashboard guard redirects to sign-in; API errors offer a sign-in action |
| Forbidden (403) | "Access denied" state with a route back to the user's dashboard |
| Not found (404) | "Not found" state with a relevant back link |
| Conflict (409) | Warning alert with the server message (for example a free-plan limit) |

Client-side role guards live in `components/auth/dashboard-guard.tsx` and the
role layouts under `app/(dashboard)/dashboard/*/layout.tsx`. They prevent
confusing navigation only; the server remains the permission boundary.

## Payments

1. The pricing page calls `POST /payments/checkout` with
   `{ plan: "student_pro" | "tutor_pro", role }`.
2. The server returns a Stripe Checkout URL (preferred) or session ID.
3. The success page calls `GET /payments/status?session_id=...` and renders the
   server-confirmed result.
4. Only a server-side Stripe webhook or verified status update may grant Pro.

Pro pricing is shown as **$10 Student Pro** and **$15 Tutor Pro**. Billing
cadence is intentionally not stated because it was not confirmed in the product
requirements. The checkout page must present the final price and cadence before
payment.

## Open product decisions

These are deliberately not invented in the UI:

- Billing cadence for Pro plans (monthly, annual or one-time).
- Priority-booking semantics, if the product ever adds them.
- Final profile field list beyond name, phone, location, bio and avatar.
- Bookmark storage beyond the current server-backed `/bookmarks` contract.
- Whether pagination remains server-side `page`/`limit` or changes shape.
- Final support, legal, privacy and refund content.

## Known limitations

- No companion backend existed during implementation, so end-to-end API
  integration and seeded data could not be verified.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is empty in the local environment, so
  live Stripe Checkout was not exercised.
- Tuition fees are formatted in USD by default because the API contract does
  not yet expose a per-listing currency. Align `lib/format.ts` with the server
  when the currency field is available.
- Free-plan limits (five bookmarks, two tuition posts) are displayed as product
  copy; the server must enforce them.

## Deployment

### Vercel

1. Import the repository and set the four environment variables above.
2. Set the production `NEXT_PUBLIC_APP_URL` to the deployed origin.
3. Point `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` at the
   production API.
4. Build with `npm run build`; the default output is `.next`.

### Self-hosted Node

```bash
npm ci
npm run build
npm run start
```

Ensure the API allows the client origin with credentials (`Access-Control-
Allow-Origin` plus `Access-Control-Allow-Credentials: true`) and that session
cookies use the correct `SameSite`, `Secure` and domain settings for production.
Better Auth must be reachable at the configured `NEXT_PUBLIC_BETTER_AUTH_URL`.

The Stripe webhook endpoint and secret belong to the server, not this client.

## Project structure

```
app/
  (public)/            Public pages and auth
  (dashboard)/         Authenticated dashboard shell and role routes
  payment/             Payment result pages
components/
  auth/                Session guard and auth forms
  dashboard/           Role dashboard screens and shared dashboard UI
  forms/               Shared field wrapper
  layout/              Navbar, footer, dashboard shell
  payments/            Checkout and payment-result UI
  shared/              Empty, error, state, pagination and loading primitives
  tuitions/            Discovery, details, filters and application dialog
  ui/                  Shadcn/Base UI primitives
constants/             Navigation, plans, statuses and tuition options
hooks/                 API, session, debounce and responsive hooks
lib/                   Axios client, normalisers, formatting, roles and auth
services/              Typed API endpoint wrappers
types/                 Domain types
docs/                  API contract
```

## Accessibility and responsiveness

- Semantic headings, tables, lists, fieldsets and navigation landmarks.
- Visible focus rings, keyboard-operable buttons, labelled form controls and
  `aria-current` for active dashboard navigation.
- Status updates use `aria-live` where lists or counts change.
- Error alerts use `role="alert"`; loading states use `role="status"`.
- Mobile navigation uses a sheet; tables scroll horizontally on small screens.
- Images use empty alt text only when the adjacent text already names the
  person; avatar uploads require a real description or fallback initials.

## Acceptance checklist

- [x] Public routes: home, tuitions, tuition details, pricing, about, auth.
- [x] Student, tutor and admin dashboards plus profile.
- [x] Role-aware navigation and client route guards; no public admin sign-up.
- [x] Tuition discovery, application, bookmark and cancellation flows.
- [x] Tuition create/edit form validation with React Hook Form and Zod.
- [x] Admin moderation, role management and transaction views.
- [x] Payment success/cancel pages that rely on server-confirmed status.
- [x] Loading, empty, success, validation, 401, 403 and 404 states.
- [x] Responsive layout and accessible form/navigation structure.
- [x] `npm run lint`, `npx tsc --noEmit` and `npm run build` pass.
- [x] README, environment example and API contract documentation.
- [x] 20+ meaningful Git commits.
