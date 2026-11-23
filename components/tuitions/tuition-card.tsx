import {
  ArrowRight,
  CalendarDays,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { modeLabel } from "@/constants/tuitions";
import { formatCurrency, truncate } from "@/lib/format";
import type { Tuition } from "@/types";
import { cn } from "cn";

interface TuitionCardProps {
  tuition: Tuition;
  showStatus?: boolean;
  actions?: React.ReactNode;
}

export function TuitionCard({
  tuition,
  showStatus = false,
  actions,
}: TuitionCardProps) {
  const detailsHref = `/tuitions/${tuition.id}`;

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {tuition.subject ? (
              <Badge variant="secondary">{tuition.subject}</Badge>
            ) : null}
            <Badge variant="outline">{modeLabel(tuition.mode)}</Badge>
            {showStatus ? (
              <Badge
                variant={tuition.isActive ? "outline" : "destructive"}
                className={tuition.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
              >
                {tuition.isActive ? "Active" : "Inactive"}
              </Badge>
            ) : null}
          </div>

          <h3 className="text-lg leading-snug font-semibold text-foreground">
            <Link
              href={detailsHref}
              className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {tuition.title}
            </Link>
          </h3>

          <p className="text-sm text-muted-foreground">
            {tuition.classLevel || "Class level not specified"}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-primary">
            {formatCurrency(tuition.monthlyFee)}
          </p>
          <p className="text-xs text-muted-foreground">per month</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {tuition.description
          ? truncate(tuition.description, 160)
          : "No description has been provided for this tuition."}
      </p>

      <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <dt className="sr-only">Location</dt>
          <dd className="truncate">
            {tuition.location || "Location not specified"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dt className="sr-only">Days per week</dt>
          <dd>
            {tuition.daysPerWeek
              ? `${tuition.daysPerWeek} days/week`
              : "Schedule not specified"}
          </dd>
        </div>
      </dl>

      {tuition.tutor?.name ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <UserRound className="size-3.5" aria-hidden="true" />
          Tutor: {tuition.tutor.name}
        </p>
      ) : null}

      {actions ? <div className="mt-4">{actions}</div> : null}

      <div className="mt-auto pt-5">
        <Link
          href={detailsHref}
          className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full")}
        >
          View Details
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
