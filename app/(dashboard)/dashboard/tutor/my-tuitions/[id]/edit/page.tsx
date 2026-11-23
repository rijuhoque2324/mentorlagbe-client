import type { Metadata } from "next";

import { TuitionForm } from "@/components/dashboard/tutor/tuition-form";

export const metadata: Metadata = {
  title: "Edit tuition",
  description: "Update the details of a tuition you posted.",
};

export default async function EditTuitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TuitionForm mode="edit" tuitionId={id} />;
}
