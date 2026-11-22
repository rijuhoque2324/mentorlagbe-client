import type { ReactNode } from "react";

import { DashboardGuard } from "@/components/auth/dashboard-guard";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardGuard allow={["admin"]}>{children}</DashboardGuard>;
}
