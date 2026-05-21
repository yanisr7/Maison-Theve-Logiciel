import type { PickupStatus } from "@/lib/types";
import { PICKUP_STATUS_LABEL } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<PickupStatus, string> = {
  incoming: "bg-muted text-muted-foreground border-border",
  available:
    "bg-[var(--gold)]/15 text-[var(--gold-dark)] border-[var(--gold)]/40",
  picked_up: "bg-emerald-600 text-white border-emerald-700",
};

export function PickupStatusChip({
  status,
  className,
}: {
  status: PickupStatus;
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
      {PICKUP_STATUS_LABEL[status]}
    </Badge>
  );
}
