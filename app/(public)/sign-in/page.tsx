import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AuthAside,
  AuthCardSkeleton,
} from "@/components/auth/auth-aside";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your MentorLagbe account to manage applications, tuitions, bookmarks or moderation.",
};

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <section className="bg-slate-50/70 py-12 sm:py-16">
      <div className="container-custom grid max-w-5xl gap-10 lg:grid-cols-[1fr_440px]">
        <AuthAside
          eyebrow="Welcome back"
          title="Sign in and pick up where you left off"
          description="Your dashboard keeps applications, tuition posts, bookmarks and moderation tasks in one place."
          points={[
            "Students can track applications and saved tuitions.",
            "Tutors can manage posts and review applicants.",
            "Admins can moderate tuitions and review transactions.",
          ]}
        />

        <Suspense fallback={<AuthCardSkeleton />}>
          <SignInContent searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function SignInContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return <SignInForm nextPath={next} />;
}
