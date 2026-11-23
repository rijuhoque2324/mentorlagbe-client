"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Brand } from "@/components/layout/brand";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Browse Tuitions", href: "/tuitions" },
      { label: "Pricing / Pro Plans", href: "/pricing" },
      { label: "How It Works", href: "/about" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Student sign up", href: "/sign-up?role=student" },
      { label: "Tutor sign up", href: "/sign-up?role=tutor" },
      { label: "Sign in", href: "/sign-in" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
];

const contacts = [
  { icon: Mail, label: "support@mentorlagbe.com", href: "mailto:support@mentorlagbe.com" },
  { icon: Phone, label: "+880 1700-000000", href: "tel:+8801700000000" },
  { icon: MapPin, label: "Dhanmondi, Dhaka, Bangladesh", href: null },
];

function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

const socials = [
  {
    label: "MentorLagbe on X",
    href: "https://x.com",
    // Current X (formerly Twitter) logo.
    icon: (
      <SocialIcon>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </SocialIcon>
    ),
  },
  {
    label: "MentorLagbe on Facebook",
    href: "https://facebook.com",
    icon: (
      <SocialIcon>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.931-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
      </SocialIcon>
    ),
  },
  {
    label: "MentorLagbe on LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <SocialIcon>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </SocialIcon>
    ),
  },
  {
    label: "MentorLagbe on YouTube",
    href: "https://youtube.com",
    icon: (
      <SocialIcon>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
      </SocialIcon>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-custom py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Brand href="/" />
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              Verified tutors, subject-wise batches and 1-on-1 mentorship for
              students across Bangladesh — find, apply and learn in one place.
            </p>
            <ul className="mt-5 flex gap-2" aria-label="Social media">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-foreground">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-semibold text-foreground">Contact</h2>
            <ul className="mt-4 space-y-3">
              {contacts.map((contact) => {
                const Icon = contact.icon;
                const content = (
                  <>
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{contact.label}</span>
                  </>
                );

                return (
                  <li key={contact.label}>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        className="flex items-start gap-2 text-sm text-muted-foreground transition hover:text-primary"
                      >
                        {content}
                      </a>
                    ) : (
                      <p className="flex items-start gap-2 text-sm text-muted-foreground">{content}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-muted-foreground">
            © {year} MentorLagbe. All rights reserved.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Smart tuition &amp; mentorship platform · Made in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
