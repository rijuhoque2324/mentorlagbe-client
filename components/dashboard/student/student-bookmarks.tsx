"use client";

import { Bookmark, MapPin, Search, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { modeLabel } from "@/constants/tuitions";
import { useApi } from "@/hooks/use-api";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { bookmarkService } from "@/services/bookmarks.service";
import type { Bookmark as SavedTuition } from "@/types";

export function StudentBookmarks() {
  const { data, loading, error, refetch } = useApi(() => bookmarkService.list());
  const [target, setTarget] = useState<SavedTuition | null>(null);
  const [removing, setRemoving] = useState(false);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  async function handleRemove() {
    if (!target) {
      return;
    }

    setRemoving(true);

    try {
      if (target.id) {
        await bookmarkService.remove(target.id);
      } else {
        await bookmarkService.removeByTuition(target.tuitionId);
      }
      toast.success("Bookmark removed");
      setTarget(null);
      refetch();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "We could not remove this bookmark. Please try again.",
      );
      setTarget(null);
      refetch();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title="Saved tuitions"
        description="Tuitions you bookmarked for later. Remove ones you are no longer considering."
        actions={
          <Link href="/tuitions" className={buttonVariants({ variant: "outline" })}>
            <Search aria-hidden="true" />
            Find tuitions
          </Link>
        }
      />

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {loading
          ? "Loading your bookmarks…"
          : `${total} saved ${total === 1 ? "tuition" : "tuitions"}`}
      </p>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <DashboardError error={error} onRetry={refetch} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved tuitions yet"
          description="Open any approved tuition and choose “Save this tuition” to keep it here."
          action={<Button render={<Link href="/tuitions" />}>Browse tuitions</Button>}
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((bookmark) => {
            const tuition = bookmark.tuition;

            return (
              <article
                key={bookmark.id}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {tuition?.subject ? (
                    <Badge variant="secondary">{tuition.subject}</Badge>
                  ) : null}
                  <Badge variant="outline">
                    {modeLabel(tuition?.mode ?? "unknown")}
                  </Badge>
                  {tuition && tuition.status !== "approved" ? (
                    <StatusBadge status={tuition.status} />
                  ) : null}
                </div>

                <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-foreground">
                  <Link
                    href={`/tuitions/${bookmark.tuitionId}`}
                    className="hover:text-primary hover:underline"
                  >
                    {tuition?.title ?? "Saved tuition"}
                  </Link>
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {tuition?.classLevel || "Class level not specified"}
                </p>

                <dl className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Wallet
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">Monthly fee</dt>
                    <dd>{formatCurrency(tuition?.monthlyFee)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">Location</dt>
                    <dd className="line-clamp-1">
                      {tuition?.location || "Location not specified"}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-xs text-muted-foreground">
                  Saved {formatDate(bookmark.createdAt)}
                </p>

                {tuition && !tuition.isActive ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    This tuition is currently inactive. It may no longer be
                    accepting applications.
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={`/tuitions/${bookmark.tuitionId}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    View details
                  </Link>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setTarget(bookmark)}
                  >
                    <Trash2 aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) {
            setTarget(null);
          }
        }}
        title="Remove this bookmark?"
        description={
          target?.tuition?.title
            ? `“${target.tuition.title}” will be removed from your saved tuitions. You can save it again later.`
            : "This tuition will be removed from your saved tuitions."
        }
        confirmLabel="Remove bookmark"
        cancelLabel="Keep bookmark"
        destructive
        loading={removing}
        onConfirm={handleRemove}
      />
    </div>
  );
}
