import type { TransitStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/mock";
import { cn } from "@/lib/utils";

const STYLES: Record<TransitStatus, string> = {
  pending: "bg-[#2a2620] text-[#b8a98c] border-[#3a342a]",
  validated: "bg-[#1e2a36] text-[#8fb7d6] border-[#2a3a4a]",
  in_transit: "bg-gold-dim text-gold border-gold",
  received: "bg-[#162636] text-[#7aa9d6] border-[#1e3550]",
  paid_unverified: "bg-[#1e2f1c] text-[#a9c98e] border-[#2c4428]",
  closed: "bg-[#173016] text-[#86c281] border-[#244522]",
  refused: "bg-[#341a1a] text-[#d68a8a] border-[#4a2424]",
};

export function StatusChip({ status, className }: { status: TransitStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        STYLES[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
