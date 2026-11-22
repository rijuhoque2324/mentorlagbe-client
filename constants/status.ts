import type {
  ApplicationStatus,
  ModerationStatus,
  PlanTier,
  TransactionStatus,
  UserRole,
} from "@/types";

export const moderationStatusLabels: Record<ModerationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const roleLabels: Record<UserRole, string> = {
  student: "Student",
  tutor: "Tutor",
  admin: "Admin",
};

export const planLabels: Record<PlanTier, string> = {
  free: "Free",
  pro: "Pro",
};

const knownStatusLabels: Record<string, string> = {
  ...moderationStatusLabels,
  ...applicationStatusLabels,
  ...transactionStatusLabels,
  active: "Active",
  inactive: "Inactive",
  free: "Free",
  pro: "Pro",
  student: "Student",
  tutor: "Tutor",
  admin: "Admin",
  processing: "Processing",
  unknown: "Unknown",
};

export function humanizeStatus(status: string) {
  if (knownStatusLabels[status]) {
    return knownStatusLabels[status];
  }

  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
