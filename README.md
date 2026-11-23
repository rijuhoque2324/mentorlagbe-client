# MentorLagbe — Client

**Smart Tuition & Mentorship Platform.** MentorLagbe connects students with
verified tutors who offer subject-wise tuition batches and 1-on-1 mentorship.
Students search and apply, tutors post batches and manage applicants, and admins
moderate listings, users and Stripe subscription payments.

| | |
| --- | --- |
| **Live site** | https://mentorlagbe-client-black.vercel.app |
| **Live API** | https://mentorlagbe-server-gules.vercel.app |
| **Server repo** | https://github.com/rijuhoque2324/mentorlagbe-server |

## Demo credentials

All demo accounts use the password **`MentorLagbe@2026`**.

| Role | Email | Plan |
| --- | --- | --- |
| Admin | `admin@mentorlagbe.test` | — |
| Tutor | `kamal.tutor@mentorlagbe.test` | Pro |
| Tutor | `sadia.tutor@mentorlagbe.test` | Free |
| Student | `rafi.student@mentorlagbe.test` | Free |
| Student | `ayesha.student@mentorlagbe.test` | Pro |

Stripe runs in test mode: pay with card `4242 4242 4242 4242`, any future
expiry date and any CVC.

## Key features

**Public**
- Landing page: hero search, six latest approved tuitions, how-it-works steps,
  top subjects with live platform counters, testimonials and Free vs Pro plans.
- Browse Tuitions (`/tuitions`): **server-side** search by title/subject,
  subject, class level and Online/Offline filters, sorting, and **server-side
  pagination** (MongoDB `skip`/`limit`).
- Tuition details (`/tuitions/[id]`): banner, schedule, fee, mode, description,
  tutor summary and an **Apply** dialog (phone, preferred schedule, note).
  Only students can apply; tutors/admins see a notice. Duplicate applications
  are rejected by the server.
- Pricing (`/pricing`): Student Pro **$10** and Tutor Pro **$15** via Stripe
  Checkout, plus `/payment/success` and `/payment/cancel` result pages.

**Authentication**
- Better Auth email/password with role selection (Student or Tutor) at sign-up;
  every new account starts on the `free` plan. Zod form validation and toasts.
- After sign-in the client exchanges the session for a **JWT** and sends it as
  `Authorization: Bearer <token>` on every protected API request.
- The API and auth endpoints are proxied through this origin (Next.js
  rewrites), so the session cookie is first-party: users stay signed in when
  they reload any private route.

**Dashboards** (collapsible sidebar, top bar, profile summary, role routing)
- Student: overview stats, `/dashboard/student/my-applications` (status
  badges, cancel while pending) and saved tuitions (bookmarks: 5 on Free,
  unlimited on Pro).
- Tutor: overview stats, `/dashboard/tutor/post-tuition` (validated form with
  ImgBB banner upload; 2 posts on Free, unlimited on Pro),
  `/dashboard/tutor/my-tuitions` (edit, delete, active/closed toggle, approval
  status) and `/dashboard/tutor/applicants` (accept/reject).
- Admin: platform stats with Stripe revenue, user role management, tuition
  approve/reject moderation and the Stripe transaction log.
- Shared: `/dashboard/profile` to update name, phone, bio and profile photo.

**Quality**
- Custom `loading.tsx` skeletons, `not-found.tsx` and `error.tsx` boundaries.
- Sonner toasts for every form, CRUD action, login/logout and error.
- Responsive on mobile, tablet and desktop; equal-height card grids.

## Tech stack & npm packages

| Package | Purpose |
| --- | --- |
| `next` 16 (App Router), `react` 19, `typescript` | Framework |
| `tailwindcss` 4, `shadcn`, `@base-ui/react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `tw-animate-css` | Styling and UI primitives |
| `better-auth` | Authentication client |
| `axios` | API client with JWT interceptors |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Forms and validation |
| `@stripe/stripe-js` | Stripe Checkout |
| `framer-motion` | Scroll animations |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

The API must be running at `API_PROXY_TARGET` (default `http://localhost:5000`).

### Environment variables (`.env.local`)

| Variable | Example | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public origin of this app |
| `NEXT_PUBLIC_API_URL` | `/api/v1` | Same-origin API path (proxied) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `http://localhost:3000` | Better Auth is served from this origin |
| `API_PROXY_TARGET` | `http://localhost:5000` | Server-only: Express API the proxy forwards to |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Publishable key only |

Secrets (MongoDB, Better Auth, JWT, Stripe secret, ImgBB) live only in the
server's `.env`.

## Deployment (Vercel)

Set the variables above in the Vercel project, with `API_PROXY_TARGET` pointing
at the deployed API, then deploy with `vercel deploy --prod`.

## Project structure

```
app/            (public) pages, (dashboard) role routes, payment pages,
                loading.tsx, error.tsx, not-found.tsx
components/     home, tuitions, dashboard, layout, shared, ui
lib/            api.ts (axios + JWT), access-token.ts, auth-client.ts
services/       typed API calls per resource
hooks/          useApi, useCurrentUser
constants/      navigation, plans, statuses
```
