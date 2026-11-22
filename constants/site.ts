export const siteConfig = {
  name: "MentorLagbe",
  tagline: "Find the right tutor. Build your future.",
  description:
    "MentorLagbe is a tuition marketplace connecting students with tutors. Discover approved tuition opportunities, apply, and manage your learning journey.",
  url: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
} as const;

export const publicNavigation = [
  { label: "Home", href: "/" },
  { label: "Find Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
] as const;
