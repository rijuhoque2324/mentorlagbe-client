"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { Panel } from "@/components/dashboard/panel";
import { FormField } from "@/components/forms/form-field";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageLoading } from "@/components/shared/loading-states";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { classLevelOptions, subjectOptions } from "@/constants/tuitions";
import { useApi } from "@/hooks/use-api";
import { ApiError } from "@/lib/api";
import { tuitionService } from "@/services/tuitions.service";
import type { Tuition, TuitionInput } from "@/types";
import { cn } from "cn";

const tuitionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, "Use at least 6 characters for the title.")
    .max(120, "Keep the title under 120 characters."),
  subject: z
    .string()
    .trim()
    .min(2, "Enter the subject.")
    .max(60, "Keep the subject under 60 characters."),
  classLevel: z
    .string()
    .trim()
    .min(1, "Enter the class level.")
    .max(60, "Keep the class level under 60 characters."),
  mode: z.enum(["online", "offline", "hybrid"]),
  location: z
    .string()
    .trim()
    .min(2, "Enter the tuition location or “Online”.")
    .max(120, "Keep the location under 120 characters."),
  monthlyFee: z
    .string()
    .trim()
    .min(1, "Enter the monthly fee.")
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      "Enter a monthly fee greater than zero.",
    )
    .refine(
      (value) => Number(value) <= 1_000_000,
      "Enter a monthly fee below 1,000,000.",
    ),
  daysPerWeek: z
    .string()
    .trim()
    .min(1, "Enter how many days per week.")
    .refine((value) => {
      const days = Number(value);
      return Number.isInteger(days) && days >= 1 && days <= 7;
    }, "Enter a whole number from 1 to 7."),
  description: z
    .string()
    .trim()
    .min(20, "Describe the tuition in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
  requirements: z
    .string()
    .trim()
    .max(1000, "Keep requirements under 1000 characters."),
  availability: z
    .string()
    .trim()
    .max(200, "Keep availability under 200 characters."),
  isActive: z.boolean(),
});

type TuitionValues = z.infer<typeof tuitionSchema>;

const emptyValues: TuitionValues = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "offline",
  location: "",
  monthlyFee: "",
  daysPerWeek: "3",
  description: "",
  requirements: "",
  availability: "",
  isActive: true,
};

function valuesFromTuition(tuition: Tuition): TuitionValues {
  return {
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode:
      tuition.mode === "online" || tuition.mode === "offline" || tuition.mode === "hybrid"
        ? tuition.mode
        : "offline",
    location: tuition.location,
    monthlyFee: tuition.monthlyFee ? String(tuition.monthlyFee) : "",
    daysPerWeek: tuition.daysPerWeek ? String(tuition.daysPerWeek) : "",
    description: tuition.description,
    requirements: tuition.requirements ?? "",
    availability: tuition.availability ?? "",
    isActive: tuition.isActive,
  };
}

function formErrorTitle(error: ApiError) {
  switch (error.status) {
    case 401:
      return "Session expired";
    case 403:
      return "You cannot change this tuition";
    case 404:
      return "Tuition not found";
    case 409:
      return "The tuition could not be saved";
    default:
      return "The tuition could not be saved";
  }
}

interface TuitionFormProps {
  mode: "create" | "edit";
  tuitionId?: string;
}

export function TuitionForm({ mode, tuitionId }: TuitionFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const {
    data: tuition,
    loading,
    error,
    refetch,
  } = useApi<Tuition | null>(
    () => (tuitionId ? tuitionService.getById(tuitionId) : Promise.resolve(null)),
    [tuitionId],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TuitionValues>({
    resolver: zodResolver(tuitionSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (mode === "edit" && tuition) {
      reset(valuesFromTuition(tuition));
    }
  }, [mode, tuition, reset]);

  async function onSubmit(values: TuitionValues) {
    setServerError(null);

    const input: TuitionInput = {
      title: values.title.trim(),
      subject: values.subject.trim(),
      classLevel: values.classLevel.trim(),
      mode: values.mode,
      location: values.location.trim(),
      monthlyFee: Number(values.monthlyFee),
      daysPerWeek: Number(values.daysPerWeek),
      description: values.description.trim(),
      requirements: values.requirements.trim() || undefined,
      availability: values.availability.trim() || undefined,
      isActive: values.isActive,
    };

    try {
      if (mode === "edit" && tuitionId) {
        const updated = await tuitionService.update(tuitionId, input);
        toast.success("Tuition updated", {
          description:
            updated.status === "pending"
              ? "Changes may need another admin review before they appear publicly."
              : "Your changes have been saved.",
        });
      } else {
        const created = await tuitionService.create(input);
        toast.success(
          created.status === "pending"
            ? "Tuition submitted for review"
            : "Tuition created",
          {
            description:
              created.status === "pending"
                ? "An admin reviews new posts before they appear in public search."
                : "Your tuition post is now in your dashboard.",
          },
        );
      }

      router.push("/dashboard/tutor/tuitions");
      router.refresh();
    } catch (caught) {
      setServerError(
        caught instanceof ApiError
          ? caught
          : new ApiError(
              "We could not save this tuition. Please try again.",
              { cause: caught },
            ),
      );
    }
  }

  if (mode === "edit" && loading) {
    return <PageLoading label="Loading tuition details…" />;
  }

  if (mode === "edit" && error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Tutor dashboard"
          title="Edit tuition"
          actions={
            <Link
              href="/dashboard/tutor/tuitions"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft aria-hidden="true" />
              Back to my tuitions
            </Link>
          }
        />
        <DashboardError
          error={error}
          onRetry={refetch}
          notFoundHref="/dashboard/tutor/tuitions"
          notFoundLabel="Back to my tuitions"
        />
      </div>
    );
  }

  if (mode === "edit" && !tuition) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Tutor dashboard" title="Edit tuition" />
        <DashboardError
          error={new ApiError("This tuition is not available.", { status: 404 })}
          notFoundHref="/dashboard/tutor/tuitions"
          notFoundLabel="Back to my tuitions"
        />
      </div>
    );
  }

  const isEdit = mode === "edit";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tutor dashboard"
        title={isEdit ? "Edit tuition" : "New tuition"}
        description={
          isEdit
            ? "Update the details. Changes are saved by the server and may need a new review."
            : "Share clear details so the right students can find your tuition. New posts are reviewed before they appear publicly."
        }
        actions={
          <Link
            href="/dashboard/tutor/tuitions"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft aria-hidden="true" />
            Back to my tuitions
          </Link>
        }
      />

      {isEdit && tuition && tuition.status === "rejected" ? (
        <InlineAlert variant="warning" title="This tuition was rejected">
          Edit the post to address the moderation feedback, then save it for
          another review.
        </InlineAlert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {serverError ? (
          <InlineAlert
            variant={serverError.status === 409 ? "warning" : "error"}
            title={formErrorTitle(serverError)}
          >
            {serverError.message}
            {serverError.status === 401 ? (
              <>
                {" "}
                <Link href="/sign-in">Sign in again</Link>.
              </>
            ) : null}
          </InlineAlert>
        ) : null}

        <Panel title="Tuition basics" description="What are you teaching and to whom?">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Tuition title"
              htmlFor="tuition-title"
              error={errors.title?.message}
              hint="For example: “HSC Physics weekly tuition in Dhanmondi”."
              required
              className="sm:col-span-2"
            >
              <Input
                id="tuition-title"
                placeholder="HSC Physics weekly tuition in Dhanmondi"
                disabled={isSubmitting}
                aria-invalid={errors.title ? true : undefined}
                {...register("title")}
              />
            </FormField>

            <FormField
              label="Subject"
              htmlFor="tuition-subject"
              error={errors.subject?.message}
              hint="Pick a suggestion or type your own."
              required
            >
              <Input
                id="tuition-subject"
                list="tuition-subject-options"
                placeholder="Physics"
                disabled={isSubmitting}
                aria-invalid={errors.subject ? true : undefined}
                {...register("subject")}
              />
              <datalist id="tuition-subject-options">
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </FormField>

            <FormField
              label="Class level"
              htmlFor="tuition-class-level"
              error={errors.classLevel?.message}
              hint="Pick a suggestion or type your own."
              required
            >
              <Input
                id="tuition-class-level"
                list="tuition-class-level-options"
                placeholder="HSC"
                disabled={isSubmitting}
                aria-invalid={errors.classLevel ? true : undefined}
                {...register("classLevel")}
              />
              <datalist id="tuition-class-level-options">
                {classLevelOptions.map((level) => (
                  <option key={level} value={level} />
                ))}
              </datalist>
            </FormField>

            <FormField
              label="Teaching mode"
              htmlFor="tuition-mode"
              error={errors.mode?.message}
              required
            >
              <NativeSelect
                id="tuition-mode"
                disabled={isSubmitting}
                aria-invalid={errors.mode ? true : undefined}
                {...register("mode")}
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </NativeSelect>
            </FormField>
          </div>
        </Panel>

        <Panel
          title="Location and schedule"
          description="Help students understand the commitment and fee."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Location"
              htmlFor="tuition-location"
              error={errors.location?.message}
              hint="Use “Online” when the mode is online."
              required
            >
              <Input
                id="tuition-location"
                placeholder="Dhanmondi, Dhaka"
                disabled={isSubmitting}
                aria-invalid={errors.location ? true : undefined}
                {...register("location")}
              />
            </FormField>

            <FormField
              label="Monthly fee"
              htmlFor="tuition-fee"
              error={errors.monthlyFee?.message}
              hint="The agreed amount in the currency your server uses."
              required
            >
              <Input
                id="tuition-fee"
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                placeholder="5000"
                disabled={isSubmitting}
                aria-invalid={errors.monthlyFee ? true : undefined}
                {...register("monthlyFee")}
              />
            </FormField>

            <FormField
              label="Days per week"
              htmlFor="tuition-days"
              error={errors.daysPerWeek?.message}
              required
            >
              <Input
                id="tuition-days"
                type="number"
                inputMode="numeric"
                min="1"
                max="7"
                step="1"
                placeholder="3"
                disabled={isSubmitting}
                aria-invalid={errors.daysPerWeek ? true : undefined}
                {...register("daysPerWeek")}
              />
            </FormField>

            <FormField
              label="Availability"
              htmlFor="tuition-availability"
              error={errors.availability?.message}
              hint="Optional. For example: “Evenings after 6pm, Friday closed”."
            >
              <Input
                id="tuition-availability"
                placeholder="Evenings after 6pm"
                disabled={isSubmitting}
                aria-invalid={errors.availability ? true : undefined}
                {...register("availability")}
              />
            </FormField>
          </div>
        </Panel>

        <Panel
          title="Details for students"
          description="Explain the syllabus, approach and expectations."
        >
          <div className="space-y-5">
            <FormField
              label="Description"
              htmlFor="tuition-description"
              error={errors.description?.message}
              hint="At least 20 characters. Mention topics, teaching style and schedule."
              required
            >
              <Textarea
                id="tuition-description"
                rows={6}
                placeholder="I am looking for a tutor for HSC Physics. We will cover the full syllabus, weekly problem sets and exam preparation."
                disabled={isSubmitting}
                aria-invalid={errors.description ? true : undefined}
                {...register("description")}
              />
            </FormField>

            <FormField
              label="Requirements"
              htmlFor="tuition-requirements"
              error={errors.requirements?.message}
              hint="Optional. For example: “Previous tutoring experience preferred”."
            >
              <Textarea
                id="tuition-requirements"
                rows={4}
                placeholder="Relevant tutoring experience and strong communication skills."
                disabled={isSubmitting}
                aria-invalid={errors.requirements ? true : undefined}
                {...register("requirements")}
              />
            </FormField>
          </div>
        </Panel>

        <Panel title="Visibility">
          <label className="flex items-start gap-3 rounded-lg border border-border p-4">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              disabled={isSubmitting}
              {...register("isActive")}
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                Keep this tuition active
              </span>
              <span className="mt-0.5 block text-sm leading-6 text-muted-foreground">
                Inactive posts stay in your dashboard but are hidden from public
                search. Approval is still controlled by an admin.
              </span>
            </span>
          </label>
        </Panel>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/dashboard/tutor/tuitions"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => tuition && reset(valuesFromTuition(tuition))}
              disabled={isSubmitting || !isDirty}
            >
              Discard changes
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => reset(emptyValues)}
              disabled={isSubmitting || !isDirty}
            >
              Clear form
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            {isSubmitting
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Submit tuition"}
          </Button>
        </div>
      </form>
    </div>
  );
}
