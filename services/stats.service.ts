import { apiGet } from "@/lib/api";
import { asRecord } from "@/lib/normalize";

export interface PlatformStats {
  students: number;
  tutors: number;
  liveTuitions: number;
  acceptedApplications: number;
  subjects: Array<{ subject: string; count: number }>;
}

function count(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export const statsService = {
  async publicStats(): Promise<PlatformStats> {
    const record = asRecord(await apiGet<unknown>("/stats/public"));
    const subjects = Array.isArray(record.subjects) ? record.subjects : [];

    return {
      students: count(record.students),
      tutors: count(record.tutors),
      liveTuitions: count(record.liveTuitions),
      acceptedApplications: count(record.acceptedApplications),
      subjects: subjects
        .map((entry) => asRecord(entry))
        .filter((entry) => typeof entry.subject === "string" && entry.subject)
        .map((entry) => ({ subject: String(entry.subject), count: count(entry.count) })),
    };
  },
};
