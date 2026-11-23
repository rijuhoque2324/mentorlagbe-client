import { DashboardGuard } from "@/components/auth/dashboard-guard";
import DashboardShell from "@/components/layout/dashboard-shell";

/**
 * Dashboard routes are gated by a client-side session check (DashboardGuard),
 * which renders a loading state instead of the page until the browser has
 * confirmed the session. That cannot be prerendered into an instant static
 * shell, so these segments opt out of instant-navigation validation.
 */
export const instant = false;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardGuard>
      <DashboardShell>{children}</DashboardShell>
    </DashboardGuard>
  );
}
