import type { Metadata } from "next";
import { Suspense } from "react";

import { TuitionListingPageSkeleton } from "@/components/tuitions/tuition-page-skeletons";
import { TuitionListing } from "@/components/tuitions/tuition-listing";

export const metadata: Metadata = {
  title: "Find Tuitions",
  description:
    "Browse approved tuition opportunities. Search by title, subject, class level, mode, location and monthly fee.",
};

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

export default function TuitionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="bg-slate-50/70">
      <section className="border-b border-border bg-background">
        <div className="container-custom py-10 sm:py-12">
          <p className="text-sm font-semibold text-primary">
            Tuition discovery
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find an approved tuition that fits your goals
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Search by subject, class level, mode, location and monthly fee. Only
            approved and active tuition posts should appear in these results.
          </p>
        </div>
      </section>

      <div className="container-custom py-8">
        <Suspense fallback={<TuitionListingPageSkeleton />}>
          <TuitionListingContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function TuitionListingContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <TuitionListing
      initialSearch={readParam(params, "search")}
      initialSubject={readParam(params, "subject")}
      initialClassLevel={readParam(params, "classLevel")}
      initialMode={readParam(params, "mode")}
      initialLocation={readParam(params, "location")}
    />
  );
}
