import type { Metadata } from "next";

import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Update your MentorLagbe profile details and profile photo.",
};

export default function ProfilePage() {
  return <ProfileForm />;
}
