"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Save, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { Panel } from "@/components/dashboard/panel";
import { FormField } from "@/components/forms/form-field";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageLoading } from "@/components/shared/loading-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { planLabels, roleLabels } from "@/constants/status";
import { useApi } from "@/hooks/use-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ApiError } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import { userService } from "@/services/users.service";
import type { User } from "@/types";
import { cn } from "cn";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(80, "Keep your name under 80 characters."),
  phone: z
    .string()
    .trim()
    .max(30, "Keep your phone number under 30 characters.")
    .refine(
      (value) =>
        value === "" || /^[0-9+()\-\s]{6,30}$/.test(value),
      "Use digits, spaces and + ( ) - only.",
    ),
  bio: z
    .string()
    .trim()
    .max(500, "Keep your bio under 500 characters."),
  location: z
    .string()
    .trim()
    .max(120, "Keep your location under 120 characters."),
  image: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https:\/\/\S+$/i.test(value),
      "Enter an image URL starting with https://",
    ),
});

type ProfileValues = z.infer<typeof profileSchema>;

const emptyValues: ProfileValues = {
  name: "",
  phone: "",
  bio: "",
  location: "",
  image: "",
};

function valuesFromUser(user: User): ProfileValues {
  return {
    name: user.name,
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
    image: user.image ?? "",
  };
}

export function ProfileForm() {
  const { user: sessionUser, refetch: refetchSessionUser } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const { data: profile, loading, error, refetch, setData } = useApi(
    () => userService.me(),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (profile) {
      reset(valuesFromUser(profile));
    }
  }, [profile, reset]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  async function onSubmit(values: ProfileValues) {
    setServerError(null);

    try {
      const updated = await userService.updateMe({
        name: values.name.trim(),
        phone: values.phone.trim() || undefined,
        bio: values.bio.trim() || undefined,
        location: values.location.trim() || undefined,
        image: values.image.trim(),
      });
      reset(valuesFromUser(updated));
      setData(updated);
      refetchSessionUser();
      toast.success("Profile saved");
    } catch (caught) {
      const apiError =
        caught instanceof ApiError
          ? caught
          : new ApiError("We could not save your profile. Please try again.", {
              cause: caught,
            });
      setServerError(apiError);
      toast.error(apiError.message);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setAvatarError(null);

    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file such as a PNG or JPEG.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Choose an image smaller than 2 MB.");
      return;
    }

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const preview = URL.createObjectURL(file);
    previewRef.current = preview;
    setAvatarPreview(preview);
    setAvatarBusy(true);

    try {
      const updated = await userService.uploadAvatar(file);
      setData(updated);
      refetchSessionUser();
      toast.success("Profile photo updated");
    } catch (caught) {
      setAvatarError(
        caught instanceof ApiError
          ? caught.message
          : "We could not upload the photo. Please try again.",
      );
      URL.revokeObjectURL(preview);
      previewRef.current = null;
      setAvatarPreview(null);
    } finally {
      setAvatarBusy(false);
    }
  }

  if (loading) {
    return <PageLoading label="Loading your profile…" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Account" title="Profile" />
        <DashboardError error={error} onRetry={refetch} />
      </div>
    );
  }

  const account = profile ?? sessionUser;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Update the details students or tutors can see. Your role and plan are managed by the server."
      />

      {serverError ? (
        <InlineAlert
          variant={serverError.status === 401 ? "warning" : "error"}
          title={
            serverError.status === 403
              ? "Profile update forbidden"
              : serverError.status === 401
                ? "Session expired"
                : "Profile not saved"
          }
        >
          {serverError.message}
        </InlineAlert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Panel
            title="Profile details"
            description="These details are shared with the people you interact with."
          >
            <div className="space-y-5">
              <FormField
                label="Full name"
                htmlFor="profile-name"
                error={errors.name?.message}
                required
              >
                <Input
                  id="profile-name"
                  autoComplete="name"
                  placeholder="Your full name"
                  disabled={isSubmitting}
                  aria-invalid={errors.name ? true : undefined}
                  {...register("name")}
                />
              </FormField>

              <FormField
                label="Phone number"
                htmlFor="profile-phone"
                error={errors.phone?.message}
                hint="Optional. Shared only through the application workflow."
              >
                <Input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+880 1XXX XXXXXX"
                  disabled={isSubmitting}
                  aria-invalid={errors.phone ? true : undefined}
                  {...register("phone")}
                />
              </FormField>

              <FormField
                label="Location"
                htmlFor="profile-location"
                error={errors.location?.message}
                hint="Optional. For example: “Dhanmondi, Dhaka”."
              >
                <Input
                  id="profile-location"
                  autoComplete="address-level2"
                  placeholder="Dhanmondi, Dhaka"
                  disabled={isSubmitting}
                  aria-invalid={errors.location ? true : undefined}
                  {...register("location")}
                />
              </FormField>

              <FormField
                label="Profile photo URL"
                htmlFor="profile-image"
                error={errors.image?.message}
                hint="Optional. Paste an https:// image link, or upload a photo with ImgBB on the right."
              >
                <Input
                  id="profile-image"
                  type="url"
                  inputMode="url"
                  placeholder="https://i.ibb.co/your-photo.jpg"
                  disabled={isSubmitting}
                  aria-invalid={errors.image ? true : undefined}
                  {...register("image")}
                />
              </FormField>

              <FormField
                label="About you"
                htmlFor="profile-bio"
                error={errors.bio?.message}
                hint="Optional. Up to 500 characters."
              >
                <Textarea
                  id="profile-bio"
                  rows={5}
                  placeholder="Share your background, subjects or what you are looking for."
                  disabled={isSubmitting}
                  aria-invalid={errors.bio ? true : undefined}
                  {...register("bio")}
                />
              </FormField>
            </div>
          </Panel>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {profile ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset(valuesFromUser(profile))}
                disabled={isSubmitting || !isDirty}
              >
                Discard changes
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {isSubmitting ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>

        <div className="space-y-5">
          <Panel title="Profile photo">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar size="lg" className="size-24">
                {avatarPreview || account?.image ? (
                  <AvatarImage
                    src={avatarPreview ?? account?.image}
                    alt={`${account?.name ?? "Your"} profile photo`}
                  />
                ) : null}
                <AvatarFallback className="text-xl">
                  {initials(account?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {account?.name ?? "Your account"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {account?.email}
                </p>
              </div>

              <input
                ref={fileInputRef}
                id="profile-avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={avatarBusy}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarBusy}
              >
                {avatarBusy ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Camera aria-hidden="true" />
                )}
                {avatarBusy ? "Uploading…" : "Change photo"}
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                PNG, JPEG, WebP or GIF, up to 2 MB. The server stores the final
                file.
              </p>
              {avatarError ? (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {avatarError}
                </p>
              ) : null}
            </div>
          </Panel>

          <Panel title="Account details">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="max-w-40 truncate text-right font-medium">
                  {account?.email || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <dt className="text-muted-foreground">Role</dt>
                <dd>
                  {account?.role ? (
                    <StatusBadge
                      status={account.role}
                      label={roleLabels[account.role]}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Not set</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <dt className="text-muted-foreground">Plan</dt>
                <dd>
                  <StatusBadge
                    status={account?.plan ?? "free"}
                    label={planLabels[account?.plan ?? "free"]}
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium">
                  {formatDate(account?.createdAt)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 flex gap-2 rounded-lg bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                You cannot change your role or plan here. Those changes are made
                by the server after an admin action or a verified payment.
              </span>
            </p>
          </Panel>
        </div>
      </div>

      <p className={cn("text-xs text-muted-foreground", "sr-only")}>
        Profile fields are validated in the browser and again on the server.
      </p>
    </div>
  );
}
