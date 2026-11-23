import {
  Bookmark,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/types";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const dashboardNavigation: Record<UserRole, DashboardNavItem[]> = {
  student: [
    {
      label: "Overview",
      href: "/dashboard/student",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My Applications",
      href: "/dashboard/student/my-applications",
      icon: FileText,
      exact: true,
    },
    {
      label: "Bookmarks",
      href: "/dashboard/student/bookmarks",
      icon: Bookmark,
      exact: true,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
      exact: true,
    },
  ],
  tutor: [
    {
      label: "Overview",
      href: "/dashboard/tutor",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My Tuitions",
      href: "/dashboard/tutor/my-tuitions",
      icon: ClipboardList,
    },
    {
      label: "Post a Tuition",
      href: "/dashboard/tutor/post-tuition",
      icon: PlusCircle,
      exact: true,
    },
    {
      label: "Applicants",
      href: "/dashboard/tutor/applicants",
      icon: Users,
      exact: true,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
      exact: true,
    },
  ],
  admin: [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
      exact: true,
    },
    {
      label: "Tuition Moderation",
      href: "/dashboard/admin/tuitions",
      icon: ShieldCheck,
      exact: true,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
      exact: true,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
      exact: true,
    },
  ],
};

export function isDashboardNavActive(pathname: string, item: DashboardNavItem) {
  if (pathname === item.href) {
    return true;
  }

  if (item.exact) {
    return false;
  }

  return pathname.startsWith(`${item.href}/`);
}
