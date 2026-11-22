"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullPageLoading } from "@/components/shared/loading-states";
import { useCurrentUser } from "@/hooks/use-current-user";
import { dashboardPathForRole } from "@/lib/roles";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, role, isPending } = useCurrentUser();

  useEffect(() => {
    if (!isPending && user) {
      router.replace(dashboardPathForRole(role));
    }
  }, [isPending, user, role, router]);

  return <FullPageLoading label="Opening your dashboard…" />;
}
