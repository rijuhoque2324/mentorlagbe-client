import type { Metadata } from "next";

import { AdminUsers } from "@/components/dashboard/admin/admin-users";

export const metadata: Metadata = {
  title: "Users",
  description:
    "Search accounts and update roles. The server remains the authority for every role change.",
};

export default function AdminUsersPage() {
  return <AdminUsers />;
}
