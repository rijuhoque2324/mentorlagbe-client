import type { Metadata } from "next";

import { TutorApplicants } from "@/components/dashboard/tutor/tutor-applicants";

export const metadata: Metadata = {
  title: "Applicants",
  description:
    "Review student applications across your tuition posts and accept or reject them.",
};

export default function TutorApplicantsPage() {
  return <TutorApplicants />;
}
