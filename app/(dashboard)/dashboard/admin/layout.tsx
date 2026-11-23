import type { ReactNode } from "react";

import { DashboardGuard } from "@/components/auth/dashboard-guard";

/**
 * Dashboard routes are gated by a client-side session check (DashboardGuard),
 * which renders a loading state instead of the page until the browser has
 * confirmed the session. That cannot be prerendered into an instant static
 * shell, so these segments opt out of instant-navigation validation.
 */
export const instant = false;

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardGuard allow={["admin"]}>{children}</DashboardGuard>;
}
