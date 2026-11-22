"use client";

import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ApplyDialog } from "@/components/tuitions/apply-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageLoading } from "@/components/shared/loading-states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { modeLabel } from "@/constants/tuitions";
import { useApi } from "@/hooks/use-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import { bookmarkService } from "@/services/bookmarks.service";
import { tuitionService } from "@/services/tuitions.service";
import { cn } from "cn";

export function TuitionDetails({ id }: { id: string }) {
  const router = useRouter();
  const { user, role, isPending } = useCurrentUser();
  const { data: tuition, loading, error, refetch } = useApi(
    () => tuitionService.getById(id),
    [id],
  );
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (tuition) {
      setBookmarked(Boolean(tuition.isBookmarked));
    }
  }, [tuition]);

  if (loading) {
    return <PageLoading label="Loading tuition details…" />;
  }

  if (error) {
    if (error.status === 404) {
      return (
        <div className="container-custom py-16">
          <EmptyState
            title="Tuition not found"
            description="This tuition may have been removed or is no longer available."
            action={
              <Link href="/tuitions" className={buttonVariants()}>
                Browse tuitions
              </Link>
            }
          />
        </div>
      );
    }

    return (
      <div className="container-custom py-16">
        <ErrorState
          title="Could not load this tuition"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!tuition) {
    return (
      <div className="container-custom py-16">
        <EmptyState
          title="Tuition not found"
          description="This tuition is not available."
          action={
            <Link href="/tuitions" className={buttonVariants()}>
              Browse tuitions
            </Link>
          }
        />
      </div>
    );
  }

  const isOpen =
    tuition.status === "approved" && tuition.isActive;
  const isStudent = role === "student";
  const canBookmark = !role || isStudent;

  async function toggleBookmark() {
    if (!user) {
      router.push(`/sign-in?next=${encodeURIComponent(`/tuitions/${id}`)}`);
      return;
    }

    if (!isStudent) {
      toast.error("Only student accounts can save bookmarks.");
      return;
    }

    setBookmarkBusy(true);

    try {
      if (bookmarked) {
        await bookmarkService.removeByTuition(id);
        setBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await bookmarkService.add(id);
        setBookmarked(true);
        toast.success("Tuition saved to your bookmarks");
      }
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setBookmarked(true);
        toast.info("This tuition is already in your bookmarks.");
      } else {
        toast.error(
          caught instanceof ApiError
            ? caught.message
            : "We could not update your bookmark. Please try again.",
        );
      }
    } finally {
      setBookmarkBusy(false);
    }
  }

  function handleApplyClick() {
    if (!user) {
      router.push(`/sign-in?next=${encodeURIComponent(`/tuitions/${id}`)}`);
      return;
    }

    setApplyOpen(true);
  }

  return (
    <div className="bg-slate-50/70">
      <div className="container-custom py-8 lg:py-12">
        <Link
          href="/tuitions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to tuitions
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <article className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                {tuition.subject ? (
                  <Badge variant="secondary">{tuition.subject}</Badge>
                ) : null}
                <Badge variant="outline">{modeLabel(tuition.mode)}</Badge>
                {tuition.status !== "approved" ? (
                  <StatusBadge status={tuition.status} />
                ) : null}
                {!tuition.isActive ? (
                  <StatusBadge status="inactive" label="Inactive" />
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {tuition.title}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {tuition.classLevel || "Class level not specified"}
                {tuition.createdAt
                  ? ` • Posted ${formatDate(tuition.createdAt)}`
                  : ""}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Wallet
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Monthly fee
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(tuition.monthlyFee)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <CalendarDays
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Days per week
                    </p>
                    <p className="font-semibold">
                      {tuition.daysPerWeek
                        ? `${tuition.daysPerWeek} days`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <MapPin className="size-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold">
                      {tuition.location || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Clock className="size-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Availability
                    </p>
                    <p className="font-semibold">
                      {tuition.availability || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <section className="mt-8 space-y-3">
                <h2 className="text-lg font-semibold">About this tuition</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {tuition.description ||
                    "The tutor has not added a description for this tuition yet."}
                </p>
              </section>

              {tuition.requirements ? (
                <section className="mt-6 space-y-3">
                  <h2 className="text-lg font-semibold">Requirements</h2>
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                    {tuition.requirements}
                  </p>
                </section>
              ) : null}
            </article>

            <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold">Tutor</h2>
              {tuition.tutor ? (
                <div className="mt-4 flex items-start gap-4">
                  <Avatar size="lg">
                    {tuition.tutor.image ? (
                      <AvatarImage src={tuition.tutor.image} alt="" />
                    ) : null}
                    <AvatarFallback>
                      {initials(tuition.tutor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{tuition.tutor.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Tutor</Badge>
                      {tuition.tutor.verified ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          <CheckCircle2 aria-hidden="true" />
                          Verified
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Contact details are shared through the application workflow
                      after the tutor responds.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="size-4" aria-hidden="true" />
                  Tutor information is not available for this tuition.
                </p>
              )}
            </section>
          </div>

          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <p className="text-sm text-muted-foreground">Monthly fee</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {formatCurrency(tuition.monthlyFee)}
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                  {tuition.location || "Location not specified"}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {tuition.daysPerWeek
                    ? `${tuition.daysPerWeek} days per week`
                    : "Schedule not specified"}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  {modeLabel(tuition.mode)}
                </p>
              </div>

              {!isOpen ? (
                <InlineAlert variant="warning" className="mt-5">
                  This tuition is not currently accepting applications.
                </InlineAlert>
              ) : null}

              {role === "tutor" || role === "admin" ? (
                <InlineAlert variant="info" className="mt-5">
                  Only student accounts can apply for tuition posts.
                </InlineAlert>
              ) : null}

              {applied ? (
                <InlineAlert
                  variant="success"
                  title="Application submitted"
                  className="mt-5"
                >
                  Track the status from your{" "}
                  <Link href="/dashboard/student/applications">
                    student dashboard
                  </Link>
                  .
                </InlineAlert>
              ) : null}

              <div className="mt-5 space-y-2">
                {!user ? (
                  <Link
                    href={`/sign-in?next=${encodeURIComponent(`/tuitions/${id}`)}`}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "h-10 w-full",
                    )}
                  >
                    Sign in to apply
                  </Link>
                ) : (
                  <Button
                    type="button"
                    className="h-10 w-full"
                    onClick={handleApplyClick}
                    disabled={
                      isPending ||
                      !isOpen ||
                      role !== "student" ||
                      applied
                    }
                  >
                    {applied ? "Application submitted" : "Apply for this tuition"}
                  </Button>
                )}

                {canBookmark ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full"
                    onClick={toggleBookmark}
                    disabled={bookmarkBusy}
                  >
                    {bookmarked ? (
                      <BookmarkCheck aria-hidden="true" />
                    ) : (
                      <Bookmark aria-hidden="true" />
                    )}
                    {bookmarked ? "Saved to bookmarks" : "Save this tuition"}
                  </Button>
                ) : null}
              </div>

              {canBookmark ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Free student accounts can save up to five tuitions. The server
                  enforces the limit.
                </p>
              ) : null}

              {!user ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  You will be asked to sign in before applying or saving.
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-xs">
              <p className="font-medium text-foreground">How applications work</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 leading-6">
                <li>Submit your application with an optional message.</li>
                <li>The tutor accepts or rejects it from their dashboard.</li>
                <li>You can cancel while the application is still pending.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>

      <ApplyDialog
        tuition={tuition}
        open={applyOpen}
        onOpenChange={setApplyOpen}
        onApplied={() => setApplied(true)}
      />
    </div>
  );
}
