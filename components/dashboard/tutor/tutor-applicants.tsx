"use client";

import {
  CheckCircle2,
  Mail,
  SearchX,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { applicationStatusLabels } from "@/constants/status";
import { useApi } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import { applicationService } from "@/services/applications.service";
import type { Application, ApplicationStatus } from "@/types";

const PAGE_SIZE = 10;
const statusOptions: Array<{ value: ApplicationStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "pending", label: applicationStatusLabels.pending },
  { value: "accepted", label: applicationStatusLabels.accepted },
  { value: "rejected", label: applicationStatusLabels.rejected },
];

type PendingAction = {
  application: Application;
  status: "accepted" | "rejected";
};

export function TutorApplicants() {
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [working, setWorking] = useState(false);

  const { data, loading, error, refetch } = useApi(
    () =>
      applicationService.forTutor({
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

  async function handleStatusChange() {
    if (!action) {
      return;
    }

    setWorking(true);

    try {
      await applicationService.updateStatus(
        action.application.id,
        action.status,
      );
      toast.success(
        action.status === "accepted"
          ? "Application accepted"
          : "Application rejected",
        {
          description:
            action.status === "accepted"
              ? "The student can now see that they were accepted."
              : "The student will see that this application was rejected.",
        },
      );
      setAction(null);
      refetch();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "We could not update this application. Please try again.",
      );
      setAction(null);
      refetch();
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tutor dashboard"
        title="Applicants"
        description="Review applications across your tuition posts. Accepting or rejecting only changes the application status."
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="applicant-search">Search applicants</Label>
            <Input
              id="applicant-search"
              type="search"
              placeholder="Student name or tuition title"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicant-status">Status</Label>
            <NativeSelect
              id="applicant-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ApplicationStatus | "");
                setPage(1);
              }}
            >
              {statusOptions.map((option) => (
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
          ? "Loading applications…"
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
              <Skeleton className="h-5 w-1/3" />
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
          icon={hasFilters ? SearchX : Users}
          title={hasFilters ? "No applications match" : "No applications yet"}
          description={
            hasFilters
              ? "Try another status or search term, or clear the filters to see every application."
              : "When a student applies to one of your tuition posts, the application will appear here."
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
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {items.map((application) => (
              <li
                key={application.id}
                className="rounded-xl border border-border bg-card p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar size="lg">
                      {application.student?.image ? (
                        <AvatarImage
                          src={application.student.image}
                          alt=""
                        />
                      ) : null}
                      <AvatarFallback>
                        {initials(application.student?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {application.student?.name ?? "Student"}
                        </p>
                        <StatusBadge status={application.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Applied to{" "}
                        <Link
                          href={`/tuitions/${application.tuitionId}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {application.tuition?.title ?? "your tuition"}
                        </Link>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(application.createdAt)}
                      </p>
                      {application.status === "accepted" &&
                      application.student?.email ? (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="size-3.5" aria-hidden="true" />
                          <a
                            href={`mailto:${application.student.email}`}
                            className="hover:text-primary hover:underline"
                          >
                            {application.student.email}
                          </a>
                        </p>
                      ) : (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserRound className="size-3.5" aria-hidden="true" />
                          Contact details appear after you accept the application.
                        </p>
                      )}
                    </div>
                  </div>

                  {application.status === "pending" ? (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          setAction({ application, status: "accepted" })
                        }
                      >
                        <CheckCircle2 aria-hidden="true" />
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setAction({ application, status: "rejected" })
                        }
                      >
                        <XCircle aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>

                {application.message ? (
                  <blockquote className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-sm leading-6 text-muted-foreground">
                    “{application.message}”
                  </blockquote>
                ) : null}
              </li>
            ))}
          </ul>

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
        open={Boolean(action)}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
          }
        }}
        title={
          action?.status === "accepted"
            ? "Accept this application?"
            : "Reject this application?"
        }
        description={
          action
            ? action.status === "accepted"
              ? `Accepting ${action.application.student?.name ?? "this student"} shares your contact details with them and marks the application accepted.`
              : `Rejecting ${action.application.student?.name ?? "this student"} marks the application rejected. The student can still apply to your other tuitions.`
            : ""
        }
        confirmLabel={
          action?.status === "accepted" ? "Accept application" : "Reject application"
        }
        destructive={action?.status === "rejected"}
        loading={working}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
