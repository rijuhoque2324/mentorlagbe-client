"use client";

import Link from "next/link";

import { Brand } from "@/components/layout/brand";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Find Tuitions", href: "/tuitions" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Student sign up", href: "/sign-up?role=student" },
      { label: "Tutor sign up", href: "/sign-up?role=tutor" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Student dashboard", href: "/dashboard/student" },
      { label: "Tutor dashboard", href: "/dashboard/tutor" },
      { label: "Profile", href: "/dashboard/profile" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-slate-50">
      <div className="container-custom py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Brand href="/" />
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              A tuition marketplace connecting students with tutors. Browse
              approved opportunities, apply, and manage your learning journey in
              one place.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-slate-900">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-slate-500">
            © {year} MentorLagbe. All rights reserved.
          </p>
          <p className="text-xs leading-5 text-slate-500">
            Legal and support information will be published when available.
          </p>
        </div>
      </div>
    </footer>
  );
}
