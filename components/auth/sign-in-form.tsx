"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
  isSafeInternalPath,
} from "@/lib/roles";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const { user, role, isPending } = useCurrentUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isPending && user) {
      const target = isSafeInternalPath(nextPath)
        ? nextPath
        : dashboardPathForRole(role);
      router.replace(target);
    }
  }, [isPending, user, nextPath, role, router]);

  async function onSubmit(values: SignInValues) {
    setServerError(null);

    const { data, error } = await authClient.signIn.email({
      email: values.email.trim(),
      password: values.password,
      rememberMe: true,
    });

    if (error) {
      setServerError(getAuthErrorMessage(error));
      return;
    }

    const signedInRole = getRoleFromUser(data?.user as unknown) ?? role;
    const target = isSafeInternalPath(nextPath)
      ? nextPath
      : dashboardPathForRole(signedInRole);

    toast.success("Signed in successfully");
    router.replace(target);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access your student, tutor or admin dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {serverError ? (
          <InlineAlert variant="error" title="Could not sign in">
            {serverError}
          </InlineAlert>
        ) : null}

        <FormField
          label="Email address"
          htmlFor="sign-in-email"
          error={errors.email?.message}
          required
        >
          <Input
            id="sign-in-email"
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
          htmlFor="sign-in-password"
          error={errors.password?.message}
          required
        >
          <div className="relative">
            <Input
              id="sign-in-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
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

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to MentorLagbe?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        Your session is stored according to the Better Auth configuration and is
        restored when you reload the page.
      </p>
    </div>
  );
}
