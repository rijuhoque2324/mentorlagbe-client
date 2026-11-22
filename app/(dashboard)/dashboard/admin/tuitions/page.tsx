import type { Metadata } from "next";

import { AdminTuitions } from "@/components/dashboard/admin/admin-tuitions";

export const metadata: Metadata = {
  title: "Tuition moderation",
  description:
    "Review pending tuition posts and approve or reject them with a reason.",
};

export default function AdminTuitionsPage() {
  return <AdminTuitions />;
}
