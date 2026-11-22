"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { InlineAlert } from "@/components/shared/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  dashboardPathForRole,
  getRoleFromUser,
} from "@/lib/roles";
import { cn } from "cn";

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name must be 80 characters or fewer."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    role: z.enum(["student", "tutor"], {
      message: "Choose whether you are joining as a student or a tutor.",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type SignUpValues = z.infer<typeof signUpSchema>;

const roleChoices = [
  {
    value: "student" as const,
    title: "Student",
    description: "Find tuition opportunities and apply.",
    icon: GraduationCap,
  },
  {
    value: "tutor" as const,
    title: "Tutor",
    description: "Publish tuitions and manage applicants.",
    icon: BookOpen,
  },
];

export function SignUpForm({
  defaultRole = "student",
}: {
  defaultRole?: "student" | "tutor";
}) {
  const router = useRouter();
  const { user, role, isPending } = useCurrentUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      role: defaultRole,
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (!isPending && user) {
      router.replace(dashboardPathForRole(role));
    }
  }, [isPending, user, role, router]);

  async function onSubmit(values: SignUpValues) {
    setServerError(null);

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
    } as unknown as Parameters<typeof authClient.signUp.email>[0];

    const { data, error } = await authClient.signUp.email(payload);

    if (error) {
      setServerError(getAuthErrorMessage(error));
      return;
    }

    const createdRole = getRoleFromUser(data?.user as unknown) ?? values.role;

    toast.success("Account created", {
      description: "Welcome to MentorLagbe.",
    });
    router.replace(dashboardPathForRole(createdRole));
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join as a student or a tutor. Admin accounts are created separately.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {serverError ? (
          <InlineAlert variant="error" title="Could not create account">
            {serverError}
          </InlineAlert>
        ) : null}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">I am joining as</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {roleChoices.map((choice) => {
              const Icon = choice.icon;
              const active = selectedRole === choice.value;

              return (
                <label
                  key={choice.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    active
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <input
                    type="radio"
                    value={choice.value}
                    className="mt-1 size-4 accent-[var(--primary)]"
                    {...register("role")}
                  />
                  <span className="space-y-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {choice.title}
                    </span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      {choice.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.role?.message ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.role.message}
            </p>
          ) : null}
        </fieldset>

        <FormField
          label="Full name"
          htmlFor="sign-up-name"
          error={errors.name?.message}
          required
        >
          <Input
            id="sign-up-name"
            autoComplete="name"
            placeholder="Your full name"
            className="h-10"
            disabled={isSubmitting}
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
        </FormField>

        <FormField
          label="Email address"
          htmlFor="sign-up-email"
          error={errors.email?.message}
          required
        >
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-10"
            disabled={isSubmitting}
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="sign-up-password"
          error={errors.password?.message}
          hint="Use at least 8 characters."
          required
        >
          <div className="relative">
            <Input
              id="sign-up-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              className="h-10 pr-10"
              disabled={isSubmitting}
              aria-invalid={errors.password ? true : undefined}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="sign-up-confirm-password"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="sign-up-confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="h-10"
            disabled={isSubmitting}
            aria-invalid={errors.confirmPassword ? true : undefined}
            {...register("confirmPassword")}
          />
        </FormField>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        By creating an account you agree to use the marketplace responsibly.
        Policy pages will be published when available.
      </p>
    </div>
  );
}
