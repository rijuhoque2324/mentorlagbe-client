import type { TuitionMode } from "@/types";

export const subjectOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "ICT",
  "Accounting",
  "Economics",
  "Business Studies",
  "General Science",
  "Other",
] as const;

export const classLevelOptions = [
  "Class 1-5",
  "Class 6-8",
  "Class 9-10",
  "SSC",
  "HSC",
  "Admission",
  "University",
  "Other",
] as const;

export const modeOptions: Array<{ value: TuitionMode; label: string }> = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];

export const modeLabels: Record<TuitionMode, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
  unknown: "Not specified",
};

export const FREE_BOOKMARK_LIMIT = 5;
export const FREE_TUITION_POST_LIMIT = 2;

export function modeLabel(mode: TuitionMode) {
  return modeLabels[mode] ?? "Not specified";
}
