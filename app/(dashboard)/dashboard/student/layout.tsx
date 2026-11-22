import type { ReactNode } from "react";

import { DashboardGuard } from "@/components/auth/dashboard-guard";

export default function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardGuard allow={["student"]}>{children}</DashboardGuard>;
}
