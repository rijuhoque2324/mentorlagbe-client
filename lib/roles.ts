import { asRecord, normalizeRole } from "@/lib/normalize";
import type { UserRole } from "@/types";

export const USER_ROLES: readonly UserRole[] = ["student", "tutor", "admin"];

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  );
}

export function getRoleFromUser(user: unknown): UserRole | null {
  const record = asRecord(user);
  return normalizeRole(record.role);
}

export function dashboardPathForRole(
  role: UserRole | null | undefined,
): string {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "tutor":
      return "/dashboard/tutor";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/profile";
  }
}

export function isSafeInternalPath(
  path: string | null | undefined,
): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}
