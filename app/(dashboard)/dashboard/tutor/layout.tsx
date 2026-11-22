import type { ReactNode } from "react";

import { DashboardGuard } from "@/components/auth/dashboard-guard";

export default function TutorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardGuard allow={["tutor"]}>{children}</DashboardGuard>;
}
