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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { tuitionService } from "@/services/tuitions.service";
import type { Tuition } from "@/types";

const applicationSchema = z.object({
  message: z
    .string()
    .max(1000, "Keep your message under 1000 characters.")
    .optional(),
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { message: "" },
  });

  async function onSubmit(values: ApplicationValues) {
    setServerError(null);
    setDuplicate(false);

    try {
      await tuitionService.apply(tuition.id, values.message);
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

          <FormField
            label="Message to the tutor"
            htmlFor="application-message"
            error={errors.message?.message}
            hint="Optional. Mention your availability or relevant experience."
          >
            <Textarea
              id="application-message"
              placeholder="Tell the tutor why you are a good fit for this tuition."
              disabled={isSubmitting}
              aria-invalid={errors.message ? true : undefined}
              {...register("message")}
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
