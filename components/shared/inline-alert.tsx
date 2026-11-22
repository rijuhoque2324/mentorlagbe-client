import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: LucideIcon }
> = {
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-900",
    icon: Info,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: TriangleAlert,
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-900",
    icon: AlertCircle,
  },
};

interface InlineAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function InlineAlert({
  variant = "info",
  title,
  children,
  className = "",
}: InlineAlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;
  const role = variant === "error" || variant === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      className={`flex gap-3 rounded-lg border p-3 text-sm ${styles.container} ${className}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="leading-6 [&_a]:font-semibold [&_a]:underline">
          {children}
        </div>
      </div>
    </div>
  );
}
