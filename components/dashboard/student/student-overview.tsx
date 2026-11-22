"use client";

import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { Panel } from "@/components/dashboard/panel";
import { StatsGridSkeleton } from "@/components/dashboard/stats-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency, formatDate, pluralize } from "@/lib/format";
import { applicationService } from "@/services/applications.service";
import { bookmarkService } from "@/services/bookmarks.service";

export function StudentOverview() {
  const { user } = useCurrentUser();
  const { data, loading, error, refetch } = useApi(async () => {
    const [recent, pending, accepted, rejected, bookmarks] = await Promise.all([
      applicationService.mine({ limit: 5 }),
      applicationService.mine({ status: "pending", limit: 1 }),
      applicationService.mine({ status: "accepted", limit: 1 }),
      applicationService.mine({ status: "rejected", limit: 1 }),
      bookmarkService.list(),
    ]);

    return {
      recent,
      pending: pending.total,
      accepted: accepted.total,
      rejected: rejected.total,
      bookmarks,
    };
  });

  const firstName = user?.name?.trim().split(/\s+/)[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Student dashboard"
          title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          description="Loading your applications and saved tuitions…"
        />
        <StatsGridSkeleton />
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Student dashboard" title="Overview" />
        <DashboardError error={error} onRetry={refetch} />
      </div>
    );
  }

  const applications = data?.recent;
  const items = applications?.items ?? [];
  const bookmarkItems = data?.bookmarks.items ?? [];
  const bookmarkTotal = data?.bookmarks.total ?? 0;
  const pending = data?.pending ?? 0;
  const accepted = data?.accepted ?? 0;
  const rejected = data?.rejected ?? 0;
  const total = applications?.total ?? 0;
  const cancelled = Math.max(0, total - pending - accepted - rejected);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Track your applications, revisit saved tuitions and find your next opportunity."
        actions={
          <Link
            href="/tuitions"
            className={buttonVariants({ variant: "default" })}
          >
            <Search aria-hidden="true" />
            Find tuitions
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications"
          value={total}
          hint={`${pluralize(total, "application")} submitted`}
          icon={FileText}
          href="/dashboard/student/applications"
        />
        <StatCard
          label="Pending"
          value={pending}
          hint="Awaiting a tutor response"
          tone="amber"
          icon={Send}
          href="/dashboard/student/applications"
        />
        <StatCard
          label="Accepted"
          value={accepted}
          hint={`${cancelled} cancelled · ${rejected} rejected`}
          tone="green"
          icon={CheckCircle2}
          href="/dashboard/student/applications"
        />
        <StatCard
          label="Saved tuitions"
          value={bookmarkTotal}
          hint="Review before applying"
          tone="blue"
          icon={Bookmark}
          href="/dashboard/student/bookmarks"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Recent applications"
          description="Your five most recent applications and their status."
          action={
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/student/applications" />}
            >
              View all
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        >
          {items.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Browse approved tuitions and submit your first application. You can track the response here."
              className="border-0 bg-transparent py-8"
              action={
                <Button render={<Link href="/tuitions" />}>
                  <Search aria-hidden="true" />
                  Browse tuitions
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((application) => (
                <li key={application.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/tuitions/${application.tuitionId}`}
                        className="line-clamp-1 font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {application.tuition?.title ?? "Tuition"}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {application.tuition?.subject
                          ? `${application.tuition.subject} · `
                          : ""}
                        Applied {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Saved tuitions"
          description="Bookmarks you can revisit at any time."
          action={
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/student/bookmarks" />}
            >
              View all
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        >
          {bookmarkItems.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved tuitions"
              description="Save a tuition from its details page to keep it here for later."
              className="border-0 bg-transparent py-8"
              action={
                <Button
                  variant="outline"
                  render={<Link href="/tuitions" />}
                >
                  Explore tuitions
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {bookmarkItems.slice(0, 3).map((bookmark) => (
                <li key={bookmark.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/tuitions/${bookmark.tuitionId}`}
                    className="line-clamp-1 font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {bookmark.tuition?.title ?? "Saved tuition"}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {bookmark.tuition
                      ? `${formatCurrency(bookmark.tuition.monthlyFee)} · ${
                          bookmark.tuition.location || "Location not specified"
                        }`
                      : "Open the tuition to see the details"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Next steps"
        description="A short checklist to get the most out of your account."
        bodyClassName="p-5"
      >
        <ul className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Search className="size-4 text-primary" aria-hidden="true" />
              Find a tuition
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Filter by subject, class level, mode and fee.
            </p>
          </li>
          <li className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Plus className="size-4 text-primary" aria-hidden="true" />
              Apply with context
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Add a short message so the tutor understands your fit.
            </p>
          </li>
          <li className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <XCircle className="size-4 text-primary" aria-hidden="true" />
              Keep it current
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Cancel applications you no longer want while they are pending.
            </p>
          </li>
        </ul>
      </Panel>
    </div>
  );
}
