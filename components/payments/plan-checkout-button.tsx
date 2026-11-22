"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ApiError } from "@/lib/api";
import { getStripe } from "@/lib/stripe";
import { paymentService } from "@/services/payments.service";
import type { UserRole } from "@/types";
import { cn } from "cn";

interface PlanCheckoutButtonProps {
  planId: "student_pro" | "tutor_pro";
  requiredRole: Extract<UserRole, "student" | "tutor">;
  price: number;
}

export function PlanCheckoutButton({
  planId,
  requiredRole,
  price,
}: PlanCheckoutButtonProps) {
  const { user, role, isPending } = useCurrentUser();
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    if (!user) {
      return;
    }

    setBusy(true);

    try {
      const result = await paymentService.createCheckout({
        plan: planId,
        role: requiredRole,
      });

      if (result.url) {
        window.location.assign(result.url);
        return;
      }

      const sessionId = result.sessionId ?? result.session_id;

      if (!sessionId) {
        throw new ApiError(
          "The server did not return a checkout URL or session. Please try again.",
        );
      }

      const stripe = await getStripe();

      // Stripe.js v10 removed redirectToCheckout. Prefer a server-provided
      // Checkout URL, but support an older Stripe.js runtime when present.
      const legacyRedirect = (
        stripe as unknown as {
          redirectToCheckout?: (options: {
            sessionId: string;
          }) => Promise<{ error?: { message?: string } }>;
        } | null
      )?.redirectToCheckout;

      if (stripe && typeof legacyRedirect === "function") {
        const { error } = await legacyRedirect.call(stripe, { sessionId });

        if (error) {
          throw new ApiError(
            error.message ?? "Stripe could not start checkout.",
          );
        }

        return;
      }

      throw new ApiError(
        "The server returned a checkout session but no checkout URL. Configure the API to return the Stripe Checkout URL.",
      );
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "We could not start checkout. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (isPending && !user) {
    return (
      <Button type="button" className="h-10 w-full" disabled>
        Checking account…
      </Button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/sign-up?role=${requiredRole}`}
        className={cn(buttonVariants({ variant: "default" }), "h-10 w-full")}
      >
        Create a {requiredRole} account to upgrade
      </Link>
    );
  }

  if (role !== requiredRole) {
    return (
      <div className="space-y-2">
        <Button type="button" className="h-10 w-full" disabled>
          Available for {requiredRole} accounts
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          You are signed in as {role ?? "an account without a confirmed role"}.
          This plan can only be purchased from a {requiredRole} account.
        </p>
      </div>
    );
  }

  if (user.plan === "pro") {
    return (
      <Button type="button" className="h-10 w-full" disabled>
        Current plan: Pro
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="h-10 w-full"
        onClick={startCheckout}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <LockKeyhole aria-hidden="true" />
        )}
        {busy ? "Starting checkout…" : `Upgrade for $${price}`}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        You will be redirected to Stripe Checkout. The server confirms the
        payment result before the plan changes.
      </p>
    </div>
  );
}
