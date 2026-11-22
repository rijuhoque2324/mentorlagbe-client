import type { Metadata } from "next";

import { AdminOverview } from "@/components/dashboard/admin/admin-overview";

export const metadata: Metadata = {
  title: "Admin overview",
  description:
    "Monitor users, tuition moderation and subscription transactions.",
};

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
