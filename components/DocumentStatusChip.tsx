import type { DocumentStatus } from "@/lib/types";
import { DOCUMENT_STATUS_LABEL } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<DocumentStatus, string> = {
  up_to_date: "bg-emerald-600 text-white border-emerald-700",
  expiring_soon:
    "bg-[var(--gold)]/20 text-[var(--gold-dark)] border-[var(--gold)]/50",
  expired: "bg-red-600 text-white border-red-700",
  missing: "bg-muted text-muted-foreground border-border",
};

export function DocumentStatusChip({
  status,
  className,
}: {
  status: DocumentStatus;
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
      {DOCUMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
