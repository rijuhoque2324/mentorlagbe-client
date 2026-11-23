import type { Metadata } from "next";

import { StudentApplications } from "@/components/dashboard/student/student-applications";

export const metadata: Metadata = {
  title: "My applications",
  description:
    "Track every tuition application and cancel applications that are still pending.",
};

export default function StudentApplicationsPage() {
  return <StudentApplications />;
}
