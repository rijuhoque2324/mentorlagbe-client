"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton } from "@/components/shared/loading-states";
import { TuitionCard } from "@/components/tuitions/tuition-card";
import { buttonVariants } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { ApiError } from "@/lib/api";
import { tuitionService } from "@/services/tuitions.service";
import { cn } from "cn";

export function FeaturedTuitions() {
  const { data, loading, error, refetch } = useApi(async () => {
    try {
      return await tuitionService.featured(6);
    } catch (caught) {
      if (
        caught instanceof ApiError &&
        (caught.status === 404 || caught.status === 405)
      ) {
        const page = await tuitionService.list({ limit: 6 });
        return page.items;
      }

      throw caught;
    }
  }, []);

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="container-custom">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">
              Featured tuitions
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Approved opportunities to explore
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              The six latest admin-approved, active tuition batches. Open any
              card to see the full schedule, fee and tutor profile.
            </p>
          </div>

          <Link
            href="/tuitions"
            className={cn(buttonVariants({ variant: "outline" }), "h-10 shrink-0")}
          >
            View all tuitions
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8">
          {loading ? <CardGridSkeleton count={6} /> : null}

          {!loading && error ? (
            <ErrorState
              title="Featured tuitions are unavailable"
              message={error.message}
              onRetry={refetch}
            />
          ) : null}

          {!loading && !error && (data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No featured tuitions yet"
              description="Approved tuition posts will appear here when the API returns them."
              action={
                <Link href="/tuitions" className={buttonVariants()}>
                  Browse tuitions
                </Link>
              }
            />
          ) : null}

          {!loading && !error && (data?.length ?? 0) > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data?.map((tuition) => (
                <TuitionCard key={tuition.id} tuition={tuition} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
