import type { Metadata } from "next";

import { StudentOverview } from "@/components/dashboard/student/student-overview";

export const metadata: Metadata = {
  title: "Student overview",
  description:
    "Review your tuition applications, bookmarks and next steps from one place.",
};

export default function StudentDashboardPage() {
  return <StudentOverview />;
}
