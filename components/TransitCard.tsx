import Link from "next/link";
import type { Transit } from "@/lib/types";
import { agencyBySlug } from "@/lib/mock";
import { StatusChip } from "./StatusChip";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function TransitCard({ transit }: { transit: Transit }) {
  const from = agencyBySlug(transit.from);
  const to = agencyBySlug(transit.to);

  return (
    <Link
      href={`/transit/${transit.id}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="gap-3 py-5 transition-all hover:border-[var(--gold)] hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="font-serif text-lg text-[var(--gold)]">{transit.reference}</p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <span className="text-foreground">{from.name}</span>
              <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
              <span className="text-foreground">{to.name}</span>
              <span className="mx-1 text-muted-foreground">·</span>
              {transit.transporter}
            </p>
          </div>
          <StatusChip status={transit.status} />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {transit.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Créé le {formatDate(transit.createdAt)}</span>
            {transit.invoiceNumber && (
              <span>Facture {transit.invoiceNumber}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
