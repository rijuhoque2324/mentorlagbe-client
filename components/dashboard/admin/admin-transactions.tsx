"use client";

import { CreditCard, SearchX } from "lucide-react";
import { useState } from "react";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
import { transactionStatusLabels } from "@/constants/status";
import { useApi } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { adminService } from "@/services/admin.service";
import type { TransactionStatus } from "@/types";

const PAGE_SIZE = 15;
const statusOptions: Array<{ value: TransactionStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "paid", label: transactionStatusLabels.paid },
  { value: "pending", label: transactionStatusLabels.pending },
  { value: "failed", label: transactionStatusLabels.failed },
  { value: "refunded", label: transactionStatusLabels.refunded },
  { value: "cancelled", label: transactionStatusLabels.cancelled },
];

export function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, loading, error, refetch } = useApi(
    () =>
      adminService.transactions({
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Transactions"
        description="Payment records for Pro subscriptions. Stripe redirects never change these records; the server does."
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin-transaction-search">Search transactions</Label>
            <Input
              id="admin-transaction-search"
              type="search"
              placeholder="User, reference or plan"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-transaction-status">Status</Label>
            <NativeSelect
              id="admin-transaction-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as TransactionStatus | "");
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
          ? "Loading transactions…"
          : `${total} ${total === 1 ? "transaction" : "transactions"}${
              hasFilters ? " matching your filters" : ""
            }`}
      </p>

      {loading ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <DashboardError error={error} onRetry={refetch} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : CreditCard}
          title={hasFilters ? "No transactions match" : "No transactions yet"}
          description={
            hasFilters
              ? "Try another status or search term, or clear the filters to see every record."
              : "Once a subscription checkout is recorded by the server, it will appear here."
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
                  <TableHead className="pl-4">Reference</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="max-w-48 truncate py-3 pl-4 font-mono text-xs text-muted-foreground">
                      {transaction.reference || transaction.id || "—"}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {transaction.user?.name ?? "Unknown user"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.user?.email ?? transaction.userId}
                      </p>
                    </TableCell>
                    <TableCell>{transaction.plan}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(
                        transaction.amount,
                        transaction.currency,
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="pr-4 text-muted-foreground">
                      {formatDateTime(transaction.createdAt)}
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
    </div>
  );
}
