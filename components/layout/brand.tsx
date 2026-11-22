import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { cn } from "cn";

interface BrandProps {
  href?: string;
  className?: string;
  compact?: boolean;
}

export function Brand({ href = "/", className, compact = false }: BrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCap className="size-6" aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="text-xl font-bold tracking-tight text-foreground">
          Mentor<span className="text-primary">Lagbe</span>
        </span>
      ) : null}
    </Link>
  );
}
