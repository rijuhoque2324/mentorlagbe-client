import type { Metadata } from "next";
import { Suspense } from "react";

import { TuitionDetails } from "@/components/tuitions/tuition-details";
import { TuitionDetailsPageSkeleton } from "@/components/tuitions/tuition-page-skeletons";

export const metadata: Metadata = {
  title: "Tuition Details",
  description:
    "Review tuition information, tutor summary, fee, availability and application options.",
};

export default function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TuitionDetailsPageSkeleton />}>
      <TuitionDetailsContent params={params} />
    </Suspense>
  );
}

async function TuitionDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TuitionDetails id={id} />;
}
