"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { InlineAlert } from "@/components/shared/inline-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ApiError } from "@/lib/api";
import { tuitionService } from "@/services/tuitions.service";
import type { Tuition } from "@/types";

const applicationSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(20, "Keep your phone number under 20 characters.")
    .refine(
      (value) => value === "" || /^\+?[0-9\s-]{6,20}$/.test(value),
      "Use digits, spaces, + or - only.",
    ),
  preferredSchedule: z
    .string()
    .trim()
    .max(200, "Keep your preferred schedule under 200 characters."),
  studentNote: z
    .string()
    .trim()
    .max(1000, "Keep your note under 1000 characters."),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

interface ApplyDialogProps {
  tuition: Tuition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

export function ApplyDialog({
  tuition,
  open,
  onOpenChange,
  onApplied,
}: ApplyDialogProps) {
  const { user } = useCurrentUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      phone: user?.phone ?? "",
      preferredSchedule: "",
      studentNote: "",
    },
  });

  async function onSubmit(values: ApplicationValues) {
    setServerError(null);
    setDuplicate(false);

    try {
      await tuitionService.apply(tuition.id, {
        phone: values.phone,
        preferredSchedule: values.preferredSchedule,
        studentNote: values.studentNote,
      });
      toast.success("Application submitted", {
        description: "The tutor can now review your application.",
      });
      reset();
      onOpenChange(false);
      onApplied?.();
    } catch (caught) {
      if (caught instanceof ApiError) {
        setDuplicate(caught.status === 409);
        setServerError(caught.message);
      } else {
        setServerError("We could not submit your application. Please try again.");
      }
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && !isSubmitting) {
      setServerError(null);
      setDuplicate(false);
      reset();
    }

    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Apply for this tuition</DialogTitle>
          <DialogDescription>
            Send your application for “{tuition.title}”. The tutor will review it
            on their dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError ? (
            <InlineAlert
              variant={duplicate ? "warning" : "error"}
              title={
                duplicate
                  ? "You have already applied"
                  : "Application not submitted"
              }
            >
              {serverError}
            </InlineAlert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Phone number"
              htmlFor="application-phone"
              error={errors.phone?.message}
              hint="So the tutor can reach you after accepting."
            >
              <Input
                id="application-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+880 1XXX XXXXXX"
                disabled={isSubmitting}
                aria-invalid={errors.phone ? true : undefined}
                {...register("phone")}
              />
            </FormField>

            <FormField
              label="Preferred schedule"
              htmlFor="application-schedule"
              error={errors.preferredSchedule?.message}
              hint="For example: “Weekdays after 6pm”."
            >
              <Input
                id="application-schedule"
                placeholder="Weekdays after 6pm"
                disabled={isSubmitting}
                aria-invalid={errors.preferredSchedule ? true : undefined}
                {...register("preferredSchedule")}
              />
            </FormField>
          </div>

          <FormField
            label="Learning note"
            htmlFor="application-note"
            error={errors.studentNote?.message}
            hint="Optional. Mention your goals, level or relevant experience."
          >
            <Textarea
              id="application-note"
              rows={4}
              placeholder="Tell the tutor why you are a good fit for this tuition."
              disabled={isSubmitting}
              aria-invalid={errors.studentNote ? true : undefined}
              {...register("studentNote")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              {isSubmitting ? "Submitting…" : "Submit application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
