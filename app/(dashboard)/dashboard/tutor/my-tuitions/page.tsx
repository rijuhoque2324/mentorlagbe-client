import type { Metadata } from "next";

import { TutorTuitions } from "@/components/dashboard/tutor/tutor-tuitions";

export const metadata: Metadata = {
  title: "My tuitions",
  description:
    "Manage every tuition you posted, including visibility, edits and removals.",
};

export default function TutorTuitionsPage() {
  return <TutorTuitions />;
}
