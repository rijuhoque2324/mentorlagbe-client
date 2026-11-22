import type { Metadata } from "next";

import { TuitionForm } from "@/components/dashboard/tutor/tuition-form";

export const metadata: Metadata = {
  title: "New tuition",
  description:
    "Publish a new tuition post for review. Only approved posts appear in public search.",
};

export default function NewTuitionPage() {
  return <TuitionForm mode="create" />;
}
