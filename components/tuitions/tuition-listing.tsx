"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/loading-states";
import { Pagination } from "@/components/shared/pagination";
import { TuitionCard } from "@/components/tuitions/tuition-card";
import {
  emptyTuitionFilters,
  TuitionFilters,
  type TuitionFiltersState,
} from "@/components/tuitions/tuition-filters";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { tuitionService } from "@/services/tuitions.service";

const PAGE_SIZE = 9;

interface TuitionListingProps {
  initialSearch?: string;
  initialSubject?: string;
  initialClassLevel?: string;
  initialMode?: string;
  initialLocation?: string;
}

export function TuitionListing({
  initialSearch = "",
  initialSubject = "",
  initialClassLevel = "",
  initialMode = "",
  initialLocation = "",
}: TuitionListingProps) {
  const [filters, setFilters] = useState<TuitionFiltersState>({
    ...emptyTuitionFilters,
    search: initialSearch,
    subject: initialSubject,
    classLevel: initialClassLevel,
    mode: initialMode,
    location: initialLocation,
  });
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(filters.search, 400);
  const debouncedLocation = useDebouncedValue(filters.location, 500);
  const debouncedMinFee = useDebouncedValue(filters.minFee, 500);
  const debouncedMaxFee = useDebouncedValue(filters.maxFee, 500);

  const { data, loading, error, refetch } = useApi(
    () =>
      tuitionService.list({
        search: debouncedSearch.trim(),
        subject: filters.subject,
        classLevel: filters.classLevel,
        mode: filters.mode,
        location: debouncedLocation.trim(),
        minFee: debouncedMinFee ? Number(debouncedMinFee) : undefined,
        maxFee: debouncedMaxFee ? Number(debouncedMaxFee) : undefined,
        page,
        limit: PAGE_SIZE,
      }),
    [
      debouncedSearch,
      filters.subject,
      filters.classLevel,
      filters.mode,
      debouncedLocation,
      debouncedMinFee,
      debouncedMaxFee,
      page,
    ],
  );

  function updateFilters(patch: Partial<TuitionFiltersState>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({ ...emptyTuitionFilters });
    setPage(1);
  }

  const hasFilters = Object.values(filters).some((value) => value.trim() !== "");
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <TuitionFilters
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        disabled={loading}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {loading
            ? "Loading approved tuitions…"
            : `${total} approved ${total === 1 ? "tuition" : "tuitions"} found`}
        </p>
        {hasFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            Clear all filters
          </Button>
        ) : null}
      </div>

      {loading ? <CardGridSkeleton count={PAGE_SIZE} /> : null}

      {!loading && error ? (
        <ErrorState
          title="Could not load tuitions"
          message={error.message}
          onRetry={refetch}
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No tuitions match your filters"
          description={
            hasFilters
              ? "Try a different subject, class level, mode or fee range, or reset the filters to see every approved tuition."
              : "There are no approved tuitions available right now. Please check back soon."
          }
          action={
            hasFilters ? (
              <Button type="button" onClick={resetFilters}>
                Reset filters
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((tuition) => (
              <TuitionCard key={tuition.id} tuition={tuition} />
            ))}
          </div>

          <Pagination
            page={data?.page ?? page}
            totalPages={data?.totalPages ?? 1}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={loading}
          />
        </>
      ) : null}
    </div>
  );
}
