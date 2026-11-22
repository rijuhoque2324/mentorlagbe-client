import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { FeaturedTuitions } from "@/components/home/featured-tuitions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { studentPlan, tutorPlan } from "@/constants/plans";
import { cn } from "cn";

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    description:
      "Register as a student or a tutor. Admin accounts are never created through public registration.",
  },
  {
    icon: Search,
    title: "Discover or publish",
    description:
      "Students search approved tuition posts. Tutors publish tuition details for moderation.",
  },
  {
    icon: Send,
    title: "Connect and manage",
    description:
      "Students apply and track applications. Tutors review applicants and update their posts.",
  },
];

const studentBenefits = [
  {
    icon: Search,
    title: "Search with useful filters",
    description:
      "Filter by subject, class level, online or offline mode, location and monthly fee.",
  },
  {
    icon: FileText,
    title: "Track every application",
    description:
      "See pending, accepted and rejected applications in one place, and cancel while pending.",
  },
  {
    icon: Bookmark,
    title: "Save tuitions to revisit",
    description:
      "Bookmark interesting tuition posts. Free accounts can save up to five; Student Pro is unlimited.",
  },
  {
    icon: Sparkles,
    title: "Upgrade when it helps",
    description:
      "Student Pro adds unlimited bookmarks. Checkout shows the final price and terms before any payment.",
  },
];

const tutorBenefits = [
  {
    icon: ClipboardCheck,
    title: "Publish tuition details",
    description:
      "Create clear tuition posts with subject, class level, mode, fee, schedule and requirements.",
  },
  {
    icon: Users,
    title: "Review applicants",
    description:
      "See applications for your own posts and accept or reject pending applicants.",
  },
  {
    icon: ShieldCheck,
    title: "Follow moderation status",
    description:
      "Track pending, approved and rejected posts. The server decides when a post is visible.",
  },
  {
    icon: Wallet,
    title: "Grow with Tutor Pro",
    description:
      "Free tutors can publish up to two posts. Tutor Pro removes the limit; the server confirms every entitlement.",
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Moderation before listing",
    description:
      "Tuition posts are reviewed before they appear in public discovery. The server enforces the visibility rule.",
  },
  {
    icon: LockKeyhole,
    title: "Server-side permissions",
    description:
      "Role checks in the interface are for usability. Every API request is independently protected by the server.",
  },
  {
    icon: CreditCard,
    title: "Payment status from the API",
    description:
      "A redirect never grants a plan. Payment results are read from the server before any entitlement changes.",
  },
  {
    icon: LayoutDashboard,
    title: "Role-specific dashboards",
    description:
      "Students, tutors and admins get focused dashboards without exposing another role's workspace.",
  },
];

function PlanPreviewCard({
  name,
  price,
  summary,
  features,
}: {
  name: string;
  price: number;
  summary: string;
  features: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {summary}
          </p>
        </div>
        <p className="shrink-0 text-2xl font-bold text-primary">${price}</p>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-slate-600">
        {features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>
              <span className="font-medium text-foreground">
                {feature.label}:
              </span>{" "}
              {feature.value}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/pricing"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-auto h-10 w-full pt-0",
        )}
      >
        Compare plans
        <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-blue-50/80 via-background to-background">
        <div className="container-custom grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge
              variant="secondary"
              className="h-7 px-3 text-xs font-semibold text-primary"
            >
              <Sparkles aria-hidden="true" />
              Tuition marketplace
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find the right tutor.
              <span className="mt-2 block text-primary">
                Build your future.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              MentorLagbe connects students with tutors through a clear,
              moderated tuition marketplace. Discover approved opportunities,
              apply with confidence, and manage every step in your dashboard.
            </p>

            <form
              action="/tuitions"
              method="get"
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <label htmlFor="home-search" className="sr-only">
                  Search tuitions
                </label>
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="home-search"
                  name="search"
                  type="search"
                  placeholder="Search by subject, title or class level"
                  className="h-12 w-full rounded-lg border border-input bg-background pr-4 pl-12 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-12 px-6 text-sm",
                )}
              >
                Search tuitions
                <ArrowRight aria-hidden="true" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/tuitions"
                className="font-semibold text-primary hover:underline"
              >
                Browse all tuitions
              </Link>
              <span className="text-muted-foreground" aria-hidden="true">
                •
              </span>
              <Link
                href="/sign-up"
                className="font-semibold text-slate-700 hover:text-primary"
              >
                Create an account
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -top-10 -left-10 size-48 rounded-full bg-blue-100 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative rounded-3xl border border-border bg-slate-50 p-5 shadow-sm sm:p-8">
              <div className="rounded-2xl bg-background p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-primary">
                    <GraduationCap className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">Built for both sides</p>
                    <p className="text-sm text-muted-foreground">
                      One marketplace, focused workflows
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Students discover approved tuitions and apply",
                    "Tutors publish posts and review applicants",
                    "Admins moderate posts and review transactions",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-primary p-4 text-primary-foreground">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Server-enforced rules
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-100">
                    Permissions, subscription entitlements and payment status
                    are confirmed by the server, not the browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedTuitions />

      <section className="bg-background py-16 sm:py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A straightforward path from search to connection
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Every workflow is designed around clear states, visible status and
              server-confirmed actions.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold text-primary">
                Benefits for students
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Find support that matches your goals
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Search approved tuition posts, keep track of your applications,
                and save the opportunities you want to revisit.
              </p>
              <Link
                href="/sign-up?role=student"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-6 h-10",
                )}
              >
                Create a student account
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {studentBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-xl border border-border bg-background p-5"
                  >
                    <Icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="mt-3 font-semibold">{benefit.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1">
              {tutorBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <Icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="mt-3 font-semibold">{benefit.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold text-primary">
                Benefits for tutors
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Publish, review and manage in one place
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Create tuition posts, follow their moderation status, and respond
                to applicants from a dedicated tutor dashboard.
              </p>
              <Link
                href="/sign-up?role=tutor"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-6 h-10",
                )}
              >
                Create a tutor account
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Plan preview</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Start free. Upgrade when it helps.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              The billing cadence for Pro plans is not assumed here. Final terms
              are confirmed at checkout.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
            <PlanPreviewCard
              name={studentPlan.name}
              price={studentPlan.price}
              summary={studentPlan.summary}
              features={[
                { label: "Bookmarks", value: "Up to 5 free, unlimited on Pro" },
                { label: "Applying", value: "Available on both plans" },
                { label: "Browsing", value: "Available on both plans" },
                { label: "Pro price", value: `$${studentPlan.price}` },
              ]}
            />
            <PlanPreviewCard
              name={tutorPlan.name}
              price={tutorPlan.price}
              summary={tutorPlan.summary}
              features={[
                { label: "Tuition posts", value: "2 free, unlimited on Pro" },
                { label: "Applicant management", value: "Available on both plans" },
                { label: "Editing", value: "Available on both plans" },
                { label: "Pro price", value: `$${tutorPlan.price}` },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">
              Trust and safety
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Clear rules, checked in the right place
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              The interface explains what is happening. The server remains the
              authority for access, moderation and payment outcomes.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div
                  key={point.title}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 font-semibold">{point.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">
            Explore approved tuitions as a student, or create a tutor account and
            publish your first tuition post.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tuitions"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-11 bg-white px-6 text-primary hover:bg-blue-50",
              )}
            >
              Find tuitions
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
