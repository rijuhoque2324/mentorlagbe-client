import type { Metadata } from "next";

import { TutorOverview } from "@/components/dashboard/tutor/tutor-overview";

export const metadata: Metadata = {
  title: "Tutor overview",
  description:
    "Review your tuition posts, pending applicants and publishing limits.",
};

export default function TutorDashboardPage() {
  return <TutorOverview />;
}
