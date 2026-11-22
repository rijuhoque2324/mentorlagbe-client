import type { ReactNode } from "react";

import { cn } from "cn";

interface PanelProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Consistent dashboard surface with an optional heading row.
 * Use `bodyClassName="p-0"` for tables that should meet the card edges.
 */
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: PanelProps) {
  const hasHeading = Boolean(title || description || action);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-xs",
        className,
      )}
    >
      {hasHeading ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
