import { CheckCircle2, GraduationCap } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface AuthAsideProps {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
}

export function AuthAside({
  eyebrow,
  title,
  description,
  points,
}: AuthAsideProps) {
  return (
    <aside className="hidden flex-col justify-center lg:flex">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCap className="size-6" aria-hidden="true" />
      </div>
      <p className="mt-6 text-sm font-semibold text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      <ul className="mt-6 space-y-3 text-sm text-slate-600">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function AuthCardSkeleton() {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
