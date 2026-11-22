import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LockKeyhole,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what MentorLagbe is, how the tuition marketplace works, and how roles, moderation and payments are handled.",
};

const process = [
  {
    icon: Search,
    title: "Students discover",
    description:
      "Students browse approved tuition posts and filter by subject, class level, mode, location and fee.",
  },
  {
    icon: ClipboardCheck,
    title: "Tutors publish",
    description:
      "Tutors create tuition posts with the details students need, then follow the moderation status.",
  },
  {
    icon: Users,
    title: "Applications connect",
    description:
      "Students apply to open tuitions. Tutors review applicants for their own posts and respond.",
  },
];

const roles = [
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Find tuition support, apply to approved posts, track application status and save bookmarks.",
  },
  {
    icon: BookOpen,
    title: "Tutors",
    description:
      "Publish tuition opportunities, manage their own posts and review applications.",
  },
  {
    icon: ShieldCheck,
    title: "Admins",
    description:
      "Moderate tuition posts, review users and inspect payment transactions. Admin accounts are not created publicly.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-50/70">
      <section className="border-b border-border bg-background">
        <div className="container-custom py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="h-7 px-3">
                About MentorLagbe
              </Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                A clearer way to connect students and tutors
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                MentorLagbe is a tuition marketplace. Students discover tuition
                opportunities and apply; tutors publish opportunities and manage
                applicants. The platform is designed around clear roles,
                moderation and server-confirmed actions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/tuitions"
                  className={cn(buttonVariants({ variant: "default" }), "h-10")}
                >
                  Browse tuitions
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link
                  href="/pricing"
                  className={cn(buttonVariants({ variant: "outline" }), "h-10")}
                >
                  View pricing
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-semibold">What we focus on</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {[
                  "A straightforward tuition discovery experience.",
                  "Clear workflows for students, tutors and admins.",
                  "Moderation before public listing.",
                  "Server-enforced permissions and payment status.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Three roles, one coordinated process
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {process.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-background py-14">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Who it is for</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Role-specific experiences
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{role.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-custom py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-semibold text-primary">
              Trust and responsibilities
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              The server stays in charge
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              The client application is the interface. It does not decide who is
              an admin, whether a subscription is active, or whether a payment
              succeeded. Those checks belong to the server application.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-border bg-card p-5">
              <LockKeyhole
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold">Permissions</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Hiding a menu item is not authorization. Every API independently
                  checks the authenticated user and role.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border bg-card p-5">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold">Moderation</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Tuition posts move through pending, approved and rejected
                  states. Public discovery only shows posts the server allows.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border bg-card p-5">
              <ClipboardCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold">Payments</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A return redirect is never treated as proof of payment. Payment
                  status is fetched from the API before any plan is shown as
                  active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-14">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Explore the marketplace
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-blue-100">
            Browse approved tuition posts or create an account to start applying
            or publishing.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tuitions"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-10 bg-white px-5 text-primary hover:bg-blue-50",
              )}
            >
              Find tuitions
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 border-white/40 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
