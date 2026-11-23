"use client";

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { Panel } from "@/components/dashboard/panel";
import { StatsGridSkeleton } from "@/components/dashboard/stats-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, pluralize } from "@/lib/format";
import { adminService } from "@/services/admin.service";

export function AdminOverview() {
  const { data, loading, error, refetch } = useApi(async () => {
    const [stats, pendingTuitions, recentTransactions] = await Promise.all([
      adminService.stats(),
      adminService.tuitions({ status: "pending", limit: 5 }),
      adminService.transactions({ limit: 5 }),
    ]);

    return { stats, pendingTuitions, recentTransactions };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin dashboard"
          title="Platform overview"
          description="Loading moderation and payment activity…"
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
        <PageHeader eyebrow="Admin dashboard" title="Platform overview" />
        <DashboardError error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Admin dashboard" title="Platform overview" />
        <DashboardError
          error={
            new ApiError("No overview data was returned. Please try again.")
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  const { stats, pendingTuitions, recentTransactions } = data;
  const currency = stats.transactions.currency ?? "USD";
  const pendingItems = pendingTuitions.items;
  const transactionItems = recentTransactions.items;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Platform overview"
        description="Moderate tuition posts, review accounts and monitor subscription records."
        actions={
          <Button render={<Link href="/dashboard/admin/tuitions" />}>
            <ShieldCheck aria-hidden="true" />
            Review tuitions
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.users.total}
          hint={`${stats.users.students} students · ${stats.users.admins ?? 0} admins`}
          icon={Users}
          href="/dashboard/admin/users"
        />
        <StatCard
          label="Total Tutors"
          value={stats.users.tutors}
          hint="Registered tutor accounts"
          tone="green"
          icon={CheckCircle2}
          href="/dashboard/admin/users"
        />
        <StatCard
          label="Pending vs Approved"
          value={`${stats.tuitions.pending} / ${stats.tuitions.approved}`}
          hint={`${stats.tuitions.total} tuition posts in total`}
          tone="amber"
          icon={ShieldCheck}
          href="/dashboard/admin/tuitions"
        />
        <StatCard
          label="Total Stripe Revenue"
          value={formatCurrency(stats.transactions.revenue, currency)}
          hint={`${stats.transactions.paid} paid subscription payments`}
          tone="blue"
          icon={Wallet}
          href="/dashboard/admin/transactions"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Accounts" description="Distribution of registered roles.">
          <dl className="space-y-3 text-sm">
            {[
              ["Students", stats.users.students],
              ["Tutors", stats.users.tutors],
              ["Admins", stats.users.admins],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Tuition pipeline" description="Posts by moderation state.">
          <dl className="space-y-3 text-sm">
            {[
              ["Pending", stats.tuitions.pending],
              ["Approved", stats.tuitions.approved],
              ["Rejected", stats.tuitions.rejected],
              ["Active", stats.tuitions.active],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel
          title="Payments"
          description="Current transaction record totals."
        >
          <dl className="space-y-3 text-sm">
            {[
              ["Paid", stats.transactions.paid],
              ["Pending", stats.transactions.pending],
              ["Failed", stats.transactions.failed],
              ["All records", stats.transactions.total],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Pending tuition review"
          description={`${pluralize(stats.tuitions.pending, "post")} waiting for a decision.`}
          action={
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/admin/tuitions" />}
            >
              Moderation queue
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        >
          {pendingItems.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Nothing waiting for review"
              description="New tuition posts will appear here when tutors submit them."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="divide-y divide-border">
              {pendingItems.map((tuition) => (
                <li key={tuition.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href="/dashboard/admin/tuitions"
                        className="line-clamp-1 font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {tuition.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {tuition.tutor?.name ?? "Tutor"} ·{" "}
                        {formatCurrency(tuition.monthlyFee)} ·{" "}
                        {formatDate(tuition.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={tuition.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent transactions"
          description="The latest payment records recorded by the server."
          action={
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/admin/transactions" />}
            >
              View all
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        >
          {transactionItems.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No transactions yet"
              description="Subscription checkouts will appear here once the payment server records them."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="divide-y divide-border">
              {transactionItems.map((transaction) => (
                <li key={transaction.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium text-foreground">
                        {transaction.user?.name ?? "User"} · {transaction.plan}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatCurrency(transaction.amount, transaction.currency)}{" "}
                        · {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={transaction.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
