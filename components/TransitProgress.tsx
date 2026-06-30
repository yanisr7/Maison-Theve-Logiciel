import type { TransitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  Truck,
  PackageCheck,
  CheckCheck,
  XCircle,
} from "lucide-react";

const STEPS = [
  { key: "pending", label: "Créé", icon: FileText },
  { key: "validated", label: "Validé", icon: CheckCircle2 },
  { key: "in_transit", label: "En transit", icon: Truck },
  { key: "received", label: "Réceptionné", icon: PackageCheck },
  { key: "closed", label: "Clôturé", icon: CheckCheck },
] as const;

// paid_unverified = entre "réceptionné" et "clôturé" → reste à l'étape 3.
const STEP_INDEX: Record<TransitStatus, number> = {
  pending: 0,
  validated: 1,
  in_transit: 2,
  received: 3,
  paid_unverified: 3,
  closed: 4,
  refused: -1,
};

export function TransitProgress({ status }: { status: TransitStatus }) {
  if (status === "refused") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <XCircle className="size-4" />
        Bon refusé — le suivi est interrompu.
      </div>
    );
  }

  const current = STEP_INDEX[status];

  return (
    <div className="flex">
      {STEPS.map((s, i) => {
        const done = i <= current;
        const isCurrent = i === current;
        const Icon = s.icon;
        return (
          <div
            key={s.key}
            className="relative flex flex-1 flex-col items-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute -left-1/2 top-4 h-0.5 w-full",
                  done ? "bg-[var(--gold)]" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-colors",
                done
                  ? "border-[var(--gold)] bg-[var(--gold)] text-white"
                  : "border-border bg-card text-muted-foreground",
                isCurrent && "ring-4 ring-[var(--gold)]/15"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span
              className={cn(
                "mt-2 text-center text-[11px] font-medium",
                done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
