import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AuthAside,
  AuthCardSkeleton,
} from "@/components/auth/auth-aside";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a student or tutor account on MentorLagbe. Public admin registration is not available.",
};

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <section className="bg-slate-50/70 py-12 sm:py-16">
      <div className="container-custom grid max-w-5xl gap-10 lg:grid-cols-[1fr_440px]">
        <AuthAside
          eyebrow="Get started"
          title="Join the tuition marketplace"
          description="Create the account that matches how you want to use MentorLagbe. You can start free and upgrade later."
          points={[
            "Student accounts can browse, apply and save bookmarks.",
            "Tutor accounts can publish tuitions and manage applicants.",
            "Admin accounts are provisioned separately, never through this form.",
          ]}
        />

        <Suspense fallback={<AuthCardSkeleton />}>
          <SignUpContent searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function SignUpContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const role = params.role === "tutor" ? "tutor" : "student";

  return <SignUpForm defaultRole={role} />;
}
