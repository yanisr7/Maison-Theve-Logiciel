import type { TransitStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Couleurs sémantiques light theme :
// transit = or, received = blue, paid = green clair, closed = green foncé,
// pending = gris, validated = bleu pâle, refused = rouge
const STYLES: Record<TransitStatus, string> = {
  pending:
    "bg-muted text-muted-foreground border-border",
  validated:
    "bg-sky-50 text-sky-700 border-sky-200",
  in_transit:
    "bg-[var(--gold)]/15 text-[var(--gold-dark)] border-[var(--gold)]/40",
  received:
    "bg-blue-50 text-blue-700 border-blue-200",
  paid_unverified:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed:
    "bg-emerald-600 text-white border-emerald-700",
  refused:
    "bg-red-50 text-red-700 border-red-200",
};

export function StatusChip({
  status,
  className,
}: {
  status: TransitStatus;
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
      {STATUS_LABEL[status]}
    </Badge>
  );
}
