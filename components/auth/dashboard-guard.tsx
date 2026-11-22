"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { FullPageLoading } from "@/components/shared/loading-states";
import { InlineAlert } from "@/components/shared/inline-alert";
import { useCurrentUser } from "@/hooks/use-current-user";
import { dashboardPathForRole } from "@/lib/roles";
import type { UserRole } from "@/types";

interface DashboardGuardProps {
  allow?: UserRole[];
  children: ReactNode;
}

/**
 * Client-side route protection. The API remains the authority for every
 * permission, entitlement and ownership decision.
 */
export function DashboardGuard({ allow, children }: DashboardGuardProps) {
  const { user, role, isPending } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = Boolean(user?.id);
  const roleMismatch = Boolean(allow && role && !allow.includes(role));

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!authenticated) {
      const next = encodeURIComponent(pathname);
      router.replace(`/sign-in?next=${next}`);
      return;
    }

    if (roleMismatch && role) {
      router.replace(dashboardPathForRole(role));
    }
  }, [isPending, authenticated, roleMismatch, role, pathname, router]);

  if (isPending) {
    return <FullPageLoading label="Checking your session…" />;
  }

  if (!authenticated) {
    return <FullPageLoading label="Redirecting to sign in…" />;
  }

  if (allow && !role) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <InlineAlert variant="warning" title="Role not confirmed">
          We could not confirm the role attached to this account. Refresh the
          page or sign in again. If the problem continues, contact support.
        </InlineAlert>
      </div>
    );
  }

  if (roleMismatch) {
    return <FullPageLoading label="Redirecting to your dashboard…" />;
  }

  return <>{children}</>;
}
