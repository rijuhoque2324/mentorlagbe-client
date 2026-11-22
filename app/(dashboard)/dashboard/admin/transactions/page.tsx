import type { Metadata } from "next";

import { AdminTransactions } from "@/components/dashboard/admin/admin-transactions";

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Review subscription payment records. Payment status is confirmed by the server.",
};

export default function AdminTransactionsPage() {
  return <AdminTransactions />;
}
