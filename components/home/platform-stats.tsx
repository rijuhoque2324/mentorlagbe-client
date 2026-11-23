"use client";

import { motion } from "framer-motion";
import {
  Atom,
  BookOpenText,
  Calculator,
  CheckCircle2,
  Code2,
  FlaskConical,
  GraduationCap,
  Languages,
  Quote,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { statsService } from "@/services/stats.service";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  mathematics: Calculator,
  math: Calculator,
  physics: Atom,
  chemistry: FlaskConical,
  english: Languages,
  ielts: Languages,
  ict: Code2,
  programming: Code2,
};

// Shown alongside live data so popular categories are always discoverable.
const FEATURED_SUBJECTS = ["Mathematics", "Physics", "Programming", "IELTS"];

const testimonials = [
  {
    name: "Ayesha Rahman",
    role: "HSC student, Dhaka",
    quote:
      "I compared three physics tutors in one evening and applied to the one whose schedule matched my coaching. He accepted me the next day.",
  },
  {
    name: "Dr. Kamal Hossain",
    role: "Physics tutor",
    quote:
      "My batches used to fill through word of mouth. Now applicants arrive with their schedule and goals, so the first class is already productive.",
  },
  {
    name: "Rafi Hasan",
    role: "SSC candidate, Chattogram",
    quote:
      "Being able to filter for online classes under my budget saved my parents weeks of phone calls. The status updates are clear too.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export function PlatformStats() {
  const { data, loading } = useApi(() => statsService.publicStats(), []);

  const counters = [
    { label: "Registered students", value: data?.students, icon: Users },
    { label: "Verified tutors", value: data?.tutors, icon: GraduationCap },
    { label: "Live tuition batches", value: data?.liveTuitions, icon: BookOpenText },
    { label: "Accepted enrolments", value: data?.acceptedApplications, icon: CheckCircle2 },
  ];

  const liveSubjects = data?.subjects ?? [];
  const subjectCards = [
    ...FEATURED_SUBJECTS.map((subject) => ({
      subject,
      count: liveSubjects.find((entry) => entry.subject.toLowerCase() === subject.toLowerCase())?.count ?? 0,
    })),
    ...liveSubjects.filter(
      (entry) => !FEATURED_SUBJECTS.some((featured) => featured.toLowerCase() === entry.subject.toLowerCase()),
    ),
  ].slice(0, 8);

  return (
    <>
      <section className="bg-background py-16 sm:py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Top subjects</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Popular subjects students are booking
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Jump straight into the subjects with the most active batches on MentorLagbe.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {subjectCards.map((entry, index) => {
              const Icon = SUBJECT_ICONS[entry.subject.toLowerCase()] ?? BookOpenText;

              return (
                <motion.div key={entry.subject} {...fadeUp} transition={{ duration: 0.4, delay: index * 0.05 }}>
                  <Link
                    href={`/tuitions?subject=${encodeURIComponent(entry.subject)}`}
                    className="group flex h-full flex-col items-start rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="mt-4 font-semibold text-foreground">{entry.subject}</span>
                    <span className="mt-1 text-sm text-muted-foreground">
                      {entry.count > 0 ? `${entry.count} active batch${entry.count === 1 ? "" : "es"}` : "Explore tutors"}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8 lg:grid-cols-4">
            {counters.map((counter) => {
              const Icon = counter.icon;
              return (
                <div key={counter.label} className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    {loading ? (
                      <Skeleton className="h-8 w-14 bg-white/20" />
                    ) : (
                      <p className="text-2xl font-bold sm:text-3xl">{counter.value ?? 0}+</p>
                    )}
                    <p className="text-xs text-primary-foreground/80 sm:text-sm">{counter.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Testimonials</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What students and tutors say
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Real workflows from our community of learners and educators.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.figure
                key={item.name}
                {...fadeUp}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-xs"
              >
                <Quote className="size-7 text-primary/30" aria-hidden="true" />
                <div className="mt-3 flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {item.name
                      .replace(/^Dr\.\s*/, "")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">{item.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
