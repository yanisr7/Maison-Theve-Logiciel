import type { AppointmentStatus } from "@/lib/types";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<AppointmentStatus, string> = {
  scheduled:
    "bg-[var(--gold)]/15 text-[var(--gold-dark)] border-[var(--gold)]/40",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-muted text-muted-foreground border-border",
  rescheduled: "bg-blue-50 text-blue-700 border-blue-200",
};

export function AppointmentStatusChip({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border px-2.5 py-0.5 text-[11px] font-medium",
        STYLES[status],
        className
      )}
    >
      {APPOINTMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
