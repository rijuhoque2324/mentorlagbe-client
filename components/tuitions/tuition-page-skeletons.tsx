import { CardGridSkeleton } from "@/components/shared/loading-states";
import { Skeleton } from "@/components/ui/skeleton";

export function TuitionListingPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-6 w-48" />
      <CardGridSkeleton count={9} />
    </div>
  );
}

export function TuitionDetailsPageSkeleton() {
  return (
    <div className="container-custom py-10">
      <Skeleton className="h-4 w-32" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="h-fit space-y-4 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
