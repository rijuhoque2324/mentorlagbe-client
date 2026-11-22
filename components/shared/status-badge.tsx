import { Badge } from "@/components/ui/badge";
import { humanizeStatus } from "@/constants/status";
import { cn } from "cn";

type Tone = "green" | "amber" | "red" | "blue" | "slate" | "violet";

const toneClasses: Record<Tone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

function toneFor(status: string): Tone {
  const value = status.toLowerCase();

  if (
    value === "approved" ||
    value === "accepted" ||
    value === "paid" ||
    value === "active" ||
    value === "succeeded"
  ) {
    return "green";
  }

  if (
    value === "pending" ||
    value === "processing" ||
    value === "review"
  ) {
    return "amber";
  }

  if (
    value === "rejected" ||
    value === "failed" ||
    value === "cancelled" ||
    value === "canceled" ||
    value === "inactive"
  ) {
    return "red";
  }

  if (value === "pro" || value === "admin") {
    return "violet";
  }

  if (value === "tutor" || value === "student") {
    return "blue";
  }

  return "slate";
}

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border font-medium", toneClasses[toneFor(status)], className)}
    >
      {label ?? humanizeStatus(status)}
    </Badge>
  );
}
