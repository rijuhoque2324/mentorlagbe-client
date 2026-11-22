import type { Metadata } from "next";

import { StudentBookmarks } from "@/components/dashboard/student/student-bookmarks";

export const metadata: Metadata = {
  title: "Saved tuitions",
  description:
    "Review the tuition posts you saved and remove bookmarks you no longer need.",
};

export default function StudentBookmarksPage() {
  return <StudentBookmarks />;
}
