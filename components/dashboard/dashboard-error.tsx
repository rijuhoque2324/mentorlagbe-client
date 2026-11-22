"use client";

import { LogIn, SearchX, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { buttonVariants } from "@/components/ui/button";
import type { ApiError } from "@/lib/api";

interface DashboardErrorProps {
  error: ApiError;
  onRetry?: () => void;
  notFoundHref?: string;
  notFoundLabel?: string;
}

function copyFor(error: ApiError) {
  switch (error.status) {
    case 401:
      return {
        title: "Session expired",
        message:
          "Your session is no longer valid. Sign in again to continue where you left off.",
      };
    case 403:
      return {
        title: "Access denied",
        message:
          "This account does not have permission to view or change this resource. If you believe this is a mistake, contact support.",
      };
    case 404:
      return {
        title: "Not found",
        message:
          "The requested resource does not exist, or it may have been removed.",
      };
    case 409:
      return {
        title: "This action is not possible yet",
        message: error.message,
      };
    default:
      return {
        title: "Could not load this page",
        message: error.message,
      };
  }
}

/**
 * Maps API failure statuses to the distinct states the dashboard must show:
 * session expiry (401), forbidden (403), not found (404) and generic errors.
 */
export function DashboardError({
  error,
  onRetry,
  notFoundHref = "/dashboard",
  notFoundLabel = "Back to dashboard",
}: DashboardErrorProps) {
  const { title, message } = copyFor(error);
  const retryable = error.status !== 401 && error.status !== 403;

  if (error.status === 401) {
    return (
      <ErrorState
        title={title}
        message={message}
        action={
          <Link href="/sign-in" className={buttonVariants()}>
            <LogIn aria-hidden="true" />
            Sign in again
          </Link>
        }
      />
    );
  }

  if (error.status === 403) {
    return (
      <ErrorState
        title={title}
        message={message}
        action={
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            <ShieldAlert aria-hidden="true" />
            Return to your dashboard
          </Link>
        }
      />
    );
  }

  if (error.status === 404) {
    return (
      <ErrorState
        title={title}
        message={message}
        action={
          <Link
            href={notFoundHref}
            className={buttonVariants({ variant: "outline" })}
          >
            <SearchX aria-hidden="true" />
            {notFoundLabel}
          </Link>
        }
      />
    );
  }

  return (
    <ErrorState
      title={title}
      message={message}
      onRetry={retryable ? onRetry : undefined}
    />
  );
}
