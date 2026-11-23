"use client";

import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Eye,
  Plus,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { Panel } from "@/components/dashboard/panel";
import { StatsGridSkeleton } from "@/components/dashboard/stats-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FREE_TUITION_POST_LIMIT } from "@/constants/tuitions";
import { useApi } from "@/hooks/use-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency, formatDate, pluralize } from "@/lib/format";
import { applicationService } from "@/services/applications.service";
import { tuitionService } from "@/services/tuitions.service";
import { cn } from "cn";

export function TutorOverview() {
  const { user } = useCurrentUser();
  const { data, loading, error, refetch } = useApi(async () => {
    const [tuitions, pendingTuitions, activeTuitions, pendingApplications, recentApplications] =
      await Promise.all([
        tuitionService.mine({ limit: 5 }),
        tuitionService.mine({ status: "pending", limit: 1 }),
        tuitionService.mine({ isActive: true, limit: 1 }),
        applicationService.forTutor({ status: "pending", limit: 1 }),
        applicationService.forTutor({ limit: 5 }),
      ]);

    return {
      tuitions,
      pendingTuitions: pendingTuitions.total,
      activeTuitions: activeTuitions.total,
      pendingApplications: pendingApplications.total,
      recentApplications,
    };
  });

  const firstName = user?.name?.trim().split(/\s+/)[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Tutor dashboard"
          title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          description="Loading your tuition posts and applicants…"
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
        <PageHeader eyebrow="Tutor dashboard" title="Overview" />
        <DashboardError error={error} onRetry={refetch} />
      </div>
    );
  }

  const tuitionPage = data?.tuitions;
  const tuitionItems = tuitionPage?.items ?? [];
  const applications = data?.recentApplications;
  const applicationItems = applications?.items ?? [];
  const totalTuitions = tuitionPage?.total ?? 0;
  const totalApplications = applications?.total ?? 0;
  const pendingApplications = data?.pendingApplications ?? 0;
  const freePlanAtLimit =
    user?.plan !== "pro" && totalTuitions >= FREE_TUITION_POST_LIMIT;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tutor dashboard"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Manage your tuition posts and respond to the students who applied."
        actions={
          <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
            <Plus aria-hidden="true" />
            New tuition
          </Button>
        }
      />

      {freePlanAtLimit ? (
        <InlineAlert variant="warning" title="Free post limit reached">
          Your free account can keep up to {FREE_TUITION_POST_LIMIT} tuition
          posts. The server enforces this limit. Review the{" "}
          <Link href="/pricing">Pro plan</Link> if you need more capacity.
        </InlineAlert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My tuitions"
          value={totalTuitions}
          hint={`${pluralize(totalTuitions, "post")} published`}
          icon={ClipboardList}
          href="/dashboard/tutor/my-tuitions"
        />
        <StatCard
          label="Pending review"
          value={data?.pendingTuitions ?? 0}
          hint="Waiting for admin moderation"
          tone="amber"
          icon={Eye}
          href="/dashboard/tutor/my-tuitions"
        />
        <StatCard
          label="Active posts"
          value={data?.activeTuitions ?? 0}
          hint="Visible to students when approved"
          tone="green"
          icon={CheckCircle2}
          href="/dashboard/tutor/my-tuitions"
        />
        <StatCard
          label="Applications"
          value={totalApplications}
          hint={`${pendingApplications} waiting for your response`}
          tone="blue"
          icon={Users}
          href="/dashboard/tutor/applicants"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Recent applicants"
          description="The latest students who applied to your tuitions."
          action={
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/tutor/applicants" />}
            >
              View all
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        >
          {applicationItems.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No applicants yet"
              description="Once a student applies, their application will appear here for you to review."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="divide-y divide-border">
              {applicationItems.map((application) => (
                <li key={application.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {application.student?.name ?? "Student"}
                      </p>
                      <Link
                        href={`/tuitions/${application.tuitionId}`}
                        className="mt-0.5 line-clamp-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                      >
                        {application.tuition?.title ?? "Tuition"}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(application.createdAt)}
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
          title="Recent tuition posts"
          description="Status and visibility for your latest posts."
          action={
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/tutor/my-tuitions" />}
            >
              Manage
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        >
          {tuitionItems.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No tuition posts yet"
              description="Create your first tuition post. An admin reviews it before it appears in public search."
              className="border-0 bg-transparent py-8"
              action={
                <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
                  <Plus aria-hidden="true" />
                  Create tuition
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {tuitionItems.map((tuition) => (
                <li key={tuition.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/tutor/my-tuitions/${tuition.id}/edit`}
                        className="line-clamp-1 font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {tuition.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatCurrency(tuition.monthlyFee)} ·{" "}
                        {tuition.applicationCount ?? 0} applicant
                        {(tuition.applicationCount ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={tuition.status} />
                      <StatusBadge
                        status={tuition.isActive ? "active" : "inactive"}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {applicationItems.some((application) => application.status === "pending") ? (
        <Panel
          title="Waiting for your response"
          description="Students are waiting to hear back about these applications."
        >
          <ul className="space-y-3">
            {applicationItems
              .filter((application) => application.status === "pending")
              .map((application) => (
                <li
                  key={application.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                >
                  <span>
                    <span className="font-semibold">
                      {application.student?.name ?? "A student"}
                    </span>{" "}
                    applied to{" "}
                    <span className="font-semibold">
                      {application.tuition?.title ?? "your tuition"}
                    </span>
                    .
                  </span>
                  <Link
                    href="/dashboard/tutor/applicants"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-amber-300 bg-white/70 text-amber-900 hover:bg-white",
                    )}
                  >
                    <Send aria-hidden="true" />
                    Review application
                  </Link>
                </li>
              ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
