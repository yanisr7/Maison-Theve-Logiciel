import type { ObservationPriority, ObservationStatus } from "@/lib/types";
import {
  OBSERVATION_PRIORITY_LABEL,
  OBSERVATION_STATUS_LABEL,
} from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<ObservationPriority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  normal:
    "bg-[var(--gold)]/15 text-[var(--gold-dark)] border-[var(--gold)]/40",
  high: "bg-red-600 text-white border-red-700",
};

const STATUS_STYLES: Record<ObservationStatus, string> = {
  open: "bg-[var(--gold)]/15 text-[var(--gold-dark)] border-[var(--gold)]/40",
  resolved: "bg-emerald-600 text-white border-emerald-700",
};

export function ObservationPriorityChip({
  priority,
  className,
}: {
  priority: ObservationPriority;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border px-2.5 py-0.5 text-[11px] font-medium",
        PRIORITY_STYLES[priority],
        className
      )}
    >
      Priorité {OBSERVATION_PRIORITY_LABEL[priority].toLowerCase()}
    </Badge>
  );
}

export function ObservationStatusChip({
  status,
  className,
}: {
  status: ObservationStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border px-2.5 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {OBSERVATION_STATUS_LABEL[status]}
    </Badge>
  );
}
