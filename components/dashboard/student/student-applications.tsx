"use client";

import { FileText, SearchX, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { Panel } from "@/components/dashboard/panel";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { applicationStatusLabels } from "@/constants/status";
import { useApi } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { applicationService } from "@/services/applications.service";
import type { Application, ApplicationStatus } from "@/types";
import { cn } from "cn";

const PAGE_SIZE = 10;
const statusFilterOptions: Array<{ value: ApplicationStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "pending", label: applicationStatusLabels.pending },
  { value: "accepted", label: applicationStatusLabels.accepted },
  { value: "rejected", label: applicationStatusLabels.rejected },
  { value: "cancelled", label: applicationStatusLabels.cancelled },
];

export function StudentApplications() {
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);
  const [target, setTarget] = useState<Application | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const { data, loading, error, refetch } = useApi(
    () =>
      applicationService.mine({
        status,
        search: debouncedSearch.trim(),
        page,
        limit: PAGE_SIZE,
      }),
    [status, debouncedSearch, page],
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilters = Boolean(status || search.trim());

  async function handleCancel() {
    if (!target) {
      return;
    }

    setCancelling(true);

    try {
      await applicationService.cancel(target.id);
      toast.success("Application cancelled", {
        description: "The tutor will no longer see it as pending.",
      });
      setTarget(null);
      refetch();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "We could not cancel this application. Please try again.",
      );
      setTarget(null);
      refetch();
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title="My applications"
        description="Every application you have submitted. Cancel one while it is still pending."
        actions={
          <Link href="/tuitions" className={buttonVariants({ variant: "outline" })}>
            Browse tuitions
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="application-search">Search applications</Label>
            <Input
              id="application-search"
              type="search"
              placeholder="Tuition title or subject"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="application-status">Status</Label>
            <NativeSelect
              id="application-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ApplicationStatus | "");
                setPage(1);
              }}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {loading
          ? "Loading your applications…"
          : `${total} ${total === 1 ? "application" : "applications"}${
              hasFilters ? " matching your filters" : ""
            }`}
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-40" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <DashboardError error={error} onRetry={refetch} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : FileText}
          title={hasFilters ? "No applications match" : "No applications yet"}
          description={
            hasFilters
              ? "Try another status or search term, or clear the filters to see every application."
              : "Browse approved tuitions and apply to start tracking your applications here."
          }
          action={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStatus("");
                  setSearch("");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button render={<Link href="/tuitions" />}>Browse tuitions</Button>
            )
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <Panel bodyClassName="divide-y divide-border">
            <ul>
              {items.map((application) => (
                <li key={application.id} className="p-5 first:pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/tuitions/${application.tuitionId}`}
                          className="text-base font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {application.tuition?.title ?? "Tuition application"}
                        </Link>
                        <StatusBadge status={application.status} />
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {[
                          application.tuition?.subject,
                          application.tuition?.classLevel,
                          application.monthlyFee ||
                          application.tuition?.monthlyFee
                            ? formatCurrency(
                                application.monthlyFee ||
                                  application.tuition?.monthlyFee ||
                                  0,
                              )
                            : null,
                          application.tuition?.location,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Tutor:{" "}
                        <span className="font-medium text-foreground">
                          {application.tutorName ??
                            application.tuition?.tutor?.name ??
                            "Tutor"}
                        </span>
                        {application.tutorEmail ? (
                          <>
                            {" · "}
                            <a
                              href={`mailto:${application.tutorEmail}`}
                              className="hover:text-primary hover:underline"
                            >
                              {application.tutorEmail}
                            </a>
                          </>
                        ) : (
                          <span className="text-xs">
                            {" "}
                            · Email is shared after the tutor accepts
                          </span>
                        )}
                      </p>

                      {application.preferredSchedule ? (
                        <p className="text-xs text-muted-foreground">
                          Preferred schedule: {application.preferredSchedule}
                        </p>
                      ) : null}

                      {application.message ? (
                        <p className="max-w-3xl rounded-lg bg-muted/60 px-3 py-2 text-sm leading-6 text-muted-foreground">
                          “{application.message}”
                        </p>
                      ) : null}

                      <p className="text-xs text-muted-foreground">
                        Applied {formatDate(application.createdAt)}
                        {application.updatedAt
                          ? ` · Updated ${formatDate(application.updatedAt)}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        href={`/tuitions/${application.tuitionId}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        View tuition
                      </Link>
                      {application.status === "pending" ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setTarget(application)}
                        >
                          <XCircle aria-hidden="true" />
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

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

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) {
            setTarget(null);
          }
        }}
        title="Cancel this application?"
        description={
          target?.tuition?.title
            ? `Your application for “${target.tuition.title}” will be withdrawn. This cannot be undone from the student dashboard.`
            : "This application will be withdrawn. This cannot be undone."
        }
        confirmLabel="Cancel application"
        cancelLabel="Keep application"
        destructive
        loading={cancelling}
        onConfirm={handleCancel}
      />
    </div>
  );
}
