import { CheckCircle2, CreditCard, Info, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PlanCheckoutButton } from "@/components/payments/plan-checkout-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  BILLING_NOTE,
  studentPlan,
  tutorPlan,
  type PlanDetails,
} from "@/constants/plans";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare free and Pro plans for students and tutors. Pro pricing is $10 for Student Pro and $15 for Tutor Pro.",
};

function PlanCard({ plan }: { plan: PlanDetails }) {
  const planId = plan.role === "student" ? "student_pro" : "tutor_pro";

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-xs sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="secondary" className="mb-2">
            {plan.role === "student" ? "For students" : "For tutors"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">{plan.name}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {plan.summary}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold text-primary">${plan.price}</p>
          <p className="text-xs text-muted-foreground">Pro plan</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {plan.name} feature comparison between the free and Pro plans
          </caption>
          <thead className="bg-slate-50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Feature
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Free
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold text-primary">
                Pro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plan.features.map((feature) => (
              <tr key={feature.label}>
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-medium text-foreground"
                >
                  {feature.label}
                </th>
                <td className="px-3 py-3 text-muted-foreground">
                  {feature.free}
                </td>
                <td className="px-3 py-3 font-semibold text-primary">
                  {feature.pro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <PlanCheckoutButton
          planId={planId}
          requiredRole={plan.role === "student" ? "student" : "tutor"}
          price={plan.price}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        The free plan is $0. Pro pricing is ${plan.price}. Billing cadence is
        confirmed at checkout.
      </p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="bg-slate-50/70">
      <section className="border-b border-border bg-background">
        <div className="container-custom py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="h-7 px-3">
              Plans and pricing
            </Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Start free. Upgrade when it helps.
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Students and tutors can use MentorLagbe for free. Pro plans add
              extra capacity and benefits. The server remains the authority for
              every entitlement.
            </p>
          </div>
        </div>
      </section>

      <section className="container-custom py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <PlanCard plan={studentPlan} />
          <PlanCard plan={tutorPlan} />
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {BILLING_NOTE}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <CreditCard className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Checkout starts on the server</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The client requests a checkout session from the API. Stripe secret
              keys are never included in browser code.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Redirects do not grant plans</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Returning from Stripe only opens a result page. The plan changes
              after the server confirms the payment.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Keep your current access</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Free accounts can still browse, apply, publish within the free
              limits, and manage applicants.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Not sure which plan fits? You can start with a free account and
            upgrade later.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up?role=student"
              className={cn(buttonVariants({ variant: "outline" }), "h-10")}
            >
              Student sign up
            </Link>
            <Link
              href="/sign-up?role=tutor"
              className={cn(buttonVariants({ variant: "outline" }), "h-10")}
            >
              Tutor sign up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
