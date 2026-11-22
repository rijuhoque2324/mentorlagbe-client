"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageLoading } from "@/components/shared/loading-states";
import { Button, buttonVariants } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/format";
import { paymentService } from "@/services/payments.service";
import { cn } from "cn";

function StatusShell({
  icon,
  tone,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  tone: "green" | "amber" | "red" | "slate";
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const toneClasses = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  } as const;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-full ring-1",
            toneClasses[tone],
          )}
        >
          {icon}
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
        <div className="mt-8 border-t border-border pt-5">
          <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            This page only reports what the server returns. It does not grant
            subscription entitlements by itself.
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentStatusChecker({ sessionId }: { sessionId: string }) {
  const { data, loading, error, refetch } = useApi(
    () => paymentService.status(sessionId),
    [sessionId],
  );

  if (loading) {
    return <PageLoading label="Checking payment status with the server…" />;
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <ErrorState
          title="Could not confirm this payment"
          message={error.message}
          onRetry={refetch}
        />
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          No plan has been changed by this page. You can also check your profile
          plan later.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <StatusShell
        icon={<Clock className="size-7" aria-hidden="true" />}
        tone="amber"
        title="Payment status unavailable"
        description="The server did not return a status for this checkout session. Try checking again."
      >
        <Button type="button" variant="outline" onClick={refetch}>
          <RefreshCw aria-hidden="true" />
          Check again
        </Button>
      </StatusShell>
    );
  }

  const details =
    data.plan || data.amount !== undefined ? (
      <dl className="grid gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
        {data.plan ? (
          <div>
            <dt className="text-xs text-muted-foreground">Plan</dt>
            <dd className="font-medium">{data.plan}</dd>
          </div>
        ) : null}
        {data.amount !== undefined ? (
          <div>
            <dt className="text-xs text-muted-foreground">Amount</dt>
            <dd className="font-medium">
              {formatCurrency(data.amount, data.currency ?? "USD")}
            </dd>
          </div>
        ) : null}
      </dl>
    ) : null;

  if (data.status === "paid") {
    return (
      <StatusShell
        icon={<CheckCircle2 className="size-7" aria-hidden="true" />}
        tone="green"
        title="Payment confirmed"
        description="The server reports this payment as paid. Your plan will be applied according to the server's records."
      >
        {details}
        {data.message ? (
          <InlineAlert variant="info" className="mt-4">
            {data.message}
          </InlineAlert>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/dashboard/profile" className={buttonVariants()}>
            View profile
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="/pricing"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to pricing
          </Link>
        </div>
      </StatusShell>
    );
  }

  if (data.status === "pending" || data.status === "processing") {
    return (
      <StatusShell
        icon={<Clock className="size-7" aria-hidden="true" />}
        tone="amber"
        title="Payment is still being confirmed"
        description="The server has not finished confirming this payment. Refresh the status before assuming the plan has changed."
      >
        {details}
        {data.message ? (
          <InlineAlert variant="info" className="mt-4">
            {data.message}
          </InlineAlert>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={refetch}>
            <RefreshCw aria-hidden="true" />
            Refresh status
          </Button>
          <Link
            href="/dashboard/profile"
            className={buttonVariants({ variant: "outline" })}
          >
            View profile
          </Link>
        </div>
      </StatusShell>
    );
  }

  if (data.status === "unknown") {
    return (
      <StatusShell
        icon={<Info className="size-7" aria-hidden="true" />}
        tone="slate"
        title="Status not recognised"
        description="The server returned a payment status this page does not recognise. Check your profile or contact support when support details are available."
      >
        <Button type="button" variant="outline" onClick={refetch}>
          <RefreshCw aria-hidden="true" />
          Check again
        </Button>
      </StatusShell>
    );
  }

  return (
    <StatusShell
      icon={<XCircle className="size-7" aria-hidden="true" />}
      tone="red"
      title="Payment was not completed"
      description="The server reports that this payment did not succeed. No plan was granted from this result page."
    >
      {details}
      {data.message ? (
        <InlineAlert variant="warning" className="mt-4">
          {data.message}
        </InlineAlert>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/pricing" className={buttonVariants()}>
          Return to pricing
        </Link>
        <Link
          href="/dashboard/profile"
          className={buttonVariants({ variant: "outline" })}
        >
          View profile
        </Link>
      </div>
    </StatusShell>
  );
}

export function PaymentSuccessResult({ sessionId }: { sessionId?: string }) {
  if (!sessionId) {
    return (
      <StatusShell
        icon={<Info className="size-7" aria-hidden="true" />}
        tone="amber"
        title="No checkout reference found"
        description="This page was opened without a checkout session reference, so no payment can be confirmed from it."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/pricing" className={buttonVariants()}>
            Return to pricing
          </Link>
          <Link
            href="/dashboard/profile"
            className={buttonVariants({ variant: "outline" })}
          >
            View profile
          </Link>
        </div>
      </StatusShell>
    );
  }

  return <PaymentStatusChecker sessionId={sessionId} />;
}

export function PaymentCancelResult() {
  return (
    <StatusShell
      icon={<XCircle className="size-7" aria-hidden="true" />}
      tone="slate"
      title="Checkout cancelled"
      description="No payment was completed and no plan was changed. You can return to pricing whenever you are ready."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/pricing" className={buttonVariants()}>
          Return to pricing
        </Link>
        <Link
          href="/dashboard/profile"
          className={buttonVariants({ variant: "outline" })}
        >
          View profile
        </Link>
      </div>
    </StatusShell>
  );
}
