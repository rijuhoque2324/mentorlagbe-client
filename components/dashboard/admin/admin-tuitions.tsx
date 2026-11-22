"use client";

import {
  CheckCircle2,
  Loader2,
  SearchX,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { EmptyState } from "@/components/shared/empty-state";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { moderationStatusLabels } from "@/constants/status";
import { modeLabel } from "@/constants/tuitions";
import { useApi } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, truncate } from "@/lib/format";
import { adminService } from "@/services/admin.service";
import type { ModerationStatus, Tuition } from "@/types";
import { cn } from "cn";

const PAGE_SIZE = 10;
const statusOptions: Array<{ value: ModerationStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "pending", label: moderationStatusLabels.pending },
  { value: "approved", label: moderationStatusLabels.approved },
  { value: "rejected", label: moderationStatusLabels.rejected },
];

type Decision = "approved" | "rejected";

export function AdminTuitions() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ModerationStatus | "">("pending");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);
  const [target, setTarget] = useState<Tuition | null>(null);
  const [decision, setDecision] = useState<Decision>("approved");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const { data, loading, error, refetch } = useApi(
    () =>
      adminService.tuitions({
        search: debouncedSearch.trim(),
        status,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, status, page],
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilters = Boolean(search.trim() || status);

  function openReview(tuition: Tuition) {
    setTarget(tuition);
    setDecision("approved");
    setReason("");
    setReasonError(null);
    setDialogError(null);
  }

  function closeReview() {
    if (working) {
      return;
    }

    setTarget(null);
    setReason("");
    setReasonError(null);
    setDialogError(null);
  }

  async function handleModerate() {
    if (!target) {
      return;
    }

    if (decision === "rejected" && reason.trim().length < 5) {
      setReasonError("Add a short reason so the tutor understands the decision.");
      return;
    }

    setWorking(true);
    setReasonError(null);
    setDialogError(null);

    try {
      await adminService.moderate(target.id, decision, reason);
      toast.success(
        decision === "approved" ? "Tuition approved" : "Tuition rejected",
        {
          description:
            decision === "approved"
              ? "The post can now appear in public search when it is active."
              : "The tutor can edit the post and submit it for review again.",
        },
      );
      setTarget(null);
      refetch();
    } catch (caught) {
      setDialogError(
        caught instanceof ApiError
          ? caught.message
          : "We could not update this tuition. Please try again.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Tuition moderation"
        description="Review posts before they appear publicly. Rejection needs a short reason for the tutor."
        actions={
          <Link
            href="/dashboard/admin/tuitions"
            className={cn(buttonVariants({ variant: "outline" }))}
            onClick={() => {
              setStatus("pending");
              setPage(1);
            }}
          >
            <ShieldCheck aria-hidden="true" />
            Pending queue
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin-tuition-search">Search tuitions</Label>
            <Input
              id="admin-tuition-search"
              type="search"
              placeholder="Title, subject or tutor"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-tuition-status">Moderation status</Label>
            <NativeSelect
              id="admin-tuition-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ModerationStatus | "");
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
          ? "Loading tuition posts…"
          : `${total} ${total === 1 ? "tuition" : "tuitions"}${
              hasFilters ? " matching your filters" : ""
            }`}
      </p>

      {loading ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <DashboardError error={error} onRetry={refetch} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : ShieldCheck}
          title={
            hasFilters
              ? status === "pending"
                ? "Nothing waiting for review"
                : "No tuitions match"
              : "No tuitions found"
          }
          description={
            hasFilters
              ? status === "pending"
                ? "Every post in this queue has been reviewed. Change the status filter to see other posts."
                : "Try another status or search term, or clear the filters to see every post."
              : "Tuition posts will appear here as tutors publish them."
          }
          action={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
              >
                Show all tuitions
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Tuition</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((tuition) => (
                  <TableRow key={tuition.id}>
                    <TableCell className="max-w-72 py-3 pl-4 whitespace-normal">
                      <p className="font-medium text-foreground">
                        {tuition.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {tuition.subject || "Subject not set"} ·{" "}
                        {tuition.classLevel || "Class not set"} ·{" "}
                        {modeLabel(tuition.mode)}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tuition.tutor?.name ?? "Unknown tutor"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(tuition.monthlyFee)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tuition.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tuition.createdAt)}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => openReview(tuition)}
                      >
                        <ShieldCheck aria-hidden="true" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) {
            closeReview();
          }
        }}
      >
        <DialogContent showCloseButton={!working} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review tuition post</DialogTitle>
            <DialogDescription>
              Decide whether this post can appear in public search. The server
              records the decision.
            </DialogDescription>
          </DialogHeader>

          {target ? (
            <div className="space-y-4">
              {dialogError ? (
                <InlineAlert variant="error" title="Decision not saved">
                  {dialogError}
                </InlineAlert>
              ) : null}

              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={target.status} />
                  <span className="text-xs text-muted-foreground">
                    {target.tutor?.name ?? "Tutor"} ·{" "}
                    {formatDate(target.createdAt)}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground">
                  {target.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[
                    target.subject,
                    target.classLevel,
                    modeLabel(target.mode),
                    target.location,
                    formatCurrency(target.monthlyFee),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {truncate(
                    target.description || "No description was provided.",
                    240,
                  )}
                </p>
                <Link
                  href={`/tuitions/${target.id}`}
                  className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  Open public page
                </Link>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Decision</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm",
                      decision === "approved"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-border",
                    )}
                  >
                    <input
                      type="radio"
                      name="moderation-decision"
                      value="approved"
                      checked={decision === "approved"}
                      onChange={() => setDecision("approved")}
                      disabled={working}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 font-medium text-emerald-900">
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Approve
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-emerald-800">
                        The post can appear publicly if it is active.
                      </span>
                    </span>
                  </label>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm",
                      decision === "rejected"
                        ? "border-red-300 bg-red-50"
                        : "border-border",
                    )}
                  >
                    <input
                      type="radio"
                      name="moderation-decision"
                      value="rejected"
                      checked={decision === "rejected"}
                      onChange={() => setDecision("rejected")}
                      disabled={working}
                      className="mt-0.5 accent-red-600"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 font-medium text-red-900">
                        <XCircle className="size-4" aria-hidden="true" />
                        Reject
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-red-800">
                        The tutor can fix the post and resubmit it.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="moderation-reason">
                  Reason{" "}
                  <span className="font-normal text-muted-foreground">
                    {decision === "rejected"
                      ? "(required for rejection)"
                      : "(optional)"}
                  </span>
                </Label>
                <Textarea
                  id="moderation-reason"
                  rows={3}
                  placeholder={
                    decision === "rejected"
                      ? "Explain what needs to change before this post can be approved."
                      : "Optional internal note about this decision."
                  }
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    if (reasonError) {
                      setReasonError(null);
                    }
                  }}
                  disabled={working}
                  aria-invalid={reasonError ? true : undefined}
                />
                {reasonError ? (
                  <p className="text-xs font-medium text-destructive" role="alert">
                    {reasonError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeReview}
              disabled={working}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={decision === "rejected" ? "destructive" : "default"}
              onClick={handleModerate}
              disabled={working}
            >
              {working ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : decision === "rejected" ? (
                <XCircle aria-hidden="true" />
              ) : (
                <CheckCircle2 aria-hidden="true" />
              )}
              {working
                ? "Saving…"
                : decision === "rejected"
                  ? "Reject tuition"
                  : "Approve tuition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
