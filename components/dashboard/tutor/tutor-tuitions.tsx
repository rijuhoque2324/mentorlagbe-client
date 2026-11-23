"use client";

import {
  ClipboardList,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  SearchX,
  Trash2,
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
import { Button, buttonVariants } from "@/components/ui/button";
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
import { moderationStatusLabels } from "@/constants/status";
import { useApi } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { tuitionService } from "@/services/tuitions.service";
import type { ModerationStatus, Tuition } from "@/types";

const PAGE_SIZE = 10;
const statusOptions: Array<{ value: ModerationStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "pending", label: moderationStatusLabels.pending },
  { value: "approved", label: moderationStatusLabels.approved },
  { value: "rejected", label: moderationStatusLabels.rejected },
];

export function TutorTuitions() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ModerationStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tuition | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, refetch, setData } = useApi(
    () =>
      tuitionService.mine({
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

  async function toggleActive(tuition: Tuition) {
    setBusyId(tuition.id);

    try {
      const updated = await tuitionService.setActive(
        tuition.id,
        !tuition.isActive,
      );
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === tuition.id ? updated : item,
              ),
            }
          : current,
      );
      toast.success(
        updated.isActive
          ? "Tuition set to active"
          : "Tuition hidden from public search",
      );
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "We could not update this tuition. Please try again.",
      );
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await tuitionService.remove(deleteTarget.id);
      toast.success("Tuition deleted");
      setDeleteTarget(null);
      refetch();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "We could not delete this tuition. Please try again.",
      );
      setDeleteTarget(null);
      refetch();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tutor dashboard"
        title="My tuitions"
        description="Control visibility, edit details and remove posts you no longer need."
        actions={
          <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
            <Plus aria-hidden="true" />
            New tuition
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tutor-tuition-search">Search tuitions</Label>
            <Input
              id="tutor-tuition-search"
              type="search"
              placeholder="Title, subject or location"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor-tuition-status">Moderation status</Label>
            <NativeSelect
              id="tutor-tuition-status"
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
          ? "Loading your tuitions…"
          : `${total} ${total === 1 ? "tuition" : "tuitions"}${
              hasFilters ? " matching your filters" : ""
            }`}
      </p>

      {loading ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <DashboardError error={error} onRetry={refetch} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : ClipboardList}
          title={hasFilters ? "No tuitions match" : "You have not posted a tuition"}
          description={
            hasFilters
              ? "Try another status or search term, or clear the filters to see every tuition."
              : "Create your first tuition post. An admin will review it before it appears in public search."
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
                Clear filters
              </Button>
            ) : (
              <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
                <Plus aria-hidden="true" />
                Create tuition
              </Button>
            )
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
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((tuition) => (
                  <TableRow key={tuition.id}>
                    <TableCell className="max-w-64 py-3 pl-4 whitespace-normal">
                      <Link
                        href={`/dashboard/tutor/my-tuitions/${tuition.id}/edit`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {tuition.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatCurrency(tuition.monthlyFee)} ·{" "}
                        {tuition.subject || "Subject not set"} ·{" "}
                        {tuition.location || "Location not set"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tuition.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={tuition.isActive ? "active" : "inactive"}
                      />
                    </TableCell>
                    <TableCell>{tuition.applicationCount ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tuition.createdAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => toggleActive(tuition)}
                          disabled={busyId === tuition.id}
                        >
                          {tuition.isActive ? (
                            <EyeOff aria-hidden="true" />
                          ) : (
                            <Eye aria-hidden="true" />
                          )}
                          {busyId === tuition.id
                            ? "Working…"
                            : tuition.isActive
                              ? "Hide"
                              : "Show"}
                        </Button>
                        <Link
                          href={`/dashboard/tutor/my-tuitions/${tuition.id}/edit`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "xs",
                          })}
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Link>
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          onClick={() => setDeleteTarget(tuition)}
                        >
                          <Trash2 aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete this tuition?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” and its applications will be removed. This cannot be undone.`
            : "This tuition will be removed. This cannot be undone."
        }
        confirmLabel="Delete tuition"
        cancelLabel="Keep tuition"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
