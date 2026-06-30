import type { CasDeFigure, CasSeverity } from "@/lib/types";
import { CAS_TYPE_LABEL } from "@/lib/mock";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, relativeDate } from "@/lib/utils";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

const SEVERITY_META: Record<
  CasSeverity,
  { label: string; card: string; badge: string; icon: typeof Info }
> = {
  info: {
    label: "Information",
    card: "border-border",
    badge: "bg-muted text-muted-foreground border-border",
    icon: Info,
  },
  warning: {
    label: "Vigilance",
    card: "border-[var(--gold)]/50 bg-[var(--gold)]/5",
    badge: "bg-[var(--gold)]/20 text-[var(--gold-dark)] border-[var(--gold)]/50",
    icon: AlertTriangle,
  },
  danger: {
    label: "Alerte",
    card: "border-red-300 bg-red-50",
    badge: "bg-red-600 text-white border-red-700",
    icon: ShieldAlert,
  },
};

export function CasCard({ cas }: { cas: CasDeFigure }) {
  const meta = SEVERITY_META[cas.severity];
  const Icon = meta.icon;
  return (
    <Card className={cn("gap-3 py-5", meta.card)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 border px-2.5 py-0.5 text-[11px] font-medium",
              meta.badge
            )}
          >
            <Icon className="size-3" aria-hidden />
            {meta.label}
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            {CAS_TYPE_LABEL[cas.type]}
          </Badge>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {relativeDate(cas.createdAt)}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-serif text-lg text-foreground">{cas.title}</p>
        <p className="text-muted-foreground">{cas.description}</p>
        <p className="pt-1 text-xs text-muted-foreground">
          Signalé par{" "}
          <span className="font-medium text-foreground">{cas.authorName}</span>
        </p>
      </CardContent>
    </Card>
  );
}
