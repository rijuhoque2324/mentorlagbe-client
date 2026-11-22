import type { PlanTier, UserRole } from "@/types";

export interface PlanFeatureRow {
  label: string;
  free: string;
  pro: string;
}

export interface PlanDetails {
  name: string;
  price: number;
  role: UserRole;
  summary: string;
  features: PlanFeatureRow[];
}

export const studentPlan: PlanDetails = {
  name: "Student Pro",
  price: 10,
  role: "student",
  summary: "For students who want more room to save and compare tuitions.",
  features: [
    { label: "Browse approved tuitions", free: "Yes", pro: "Yes" },
    { label: "Apply for tuition", free: "Yes", pro: "Yes" },
    { label: "Bookmarks", free: "Up to 5", pro: "Unlimited" },
    { label: "Priority booking", free: "No", pro: "Yes" },
  ],
};

export const tutorPlan: PlanDetails = {
  name: "Tutor Pro",
  price: 15,
  role: "tutor",
  summary: "For tutors who publish more tuitions and want a verified badge.",
  features: [
    { label: "Tuition posts", free: "Maximum 2", pro: "Unlimited" },
    { label: "Edit own posts", free: "Yes", pro: "Yes" },
    { label: "Manage applicants", free: "Yes", pro: "Yes" },
    { label: "Verified badge", free: "No", pro: "Yes" },
  ],
};

export const planDetails: Record<UserRole, PlanDetails | null> = {
  student: studentPlan,
  tutor: tutorPlan,
  admin: null,
};

export const planPricing: Record<PlanTier, { label: string; price: number }> = {
  free: { label: "Free", price: 0 },
  pro: { label: "Pro", price: 10 },
};

export const BILLING_NOTE =
  "The billing cadence for Pro plans is confirmed at checkout. No recurring charge is assumed by this page.";

export function planLabel(plan: PlanTier) {
  return plan === "pro" ? "Pro" : "Free";
}
