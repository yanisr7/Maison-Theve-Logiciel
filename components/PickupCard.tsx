import Link from "next/link";
import type { Pickup } from "@/lib/types";
import { agencyBySlug } from "@/lib/mock";
import { PickupStatusChip } from "./PickupStatusChip";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Package } from "lucide-react";

export function PickupCard({ pickup }: { pickup: Pickup }) {
  const dest = agencyBySlug(pickup.destinationAgencyId);

  return (
    <Link
      href={`/colis/${pickup.id}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="gap-3 py-5 transition-all hover:border-[var(--gold)] hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="font-serif text-lg text-[var(--gold)]">
              {pickup.parisOrderRef}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="size-3.5" aria-hidden />
              <span className="text-foreground">{pickup.clientName}</span>
              <span className="mx-1">·</span>
              {dest.name}
              <span className="mx-1">·</span>
              {pickup.transporter}
            </p>
          </div>
          <PickupStatusChip status={pickup.status} />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {pickup.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Annoncé le {formatDate(pickup.createdAt)}</span>
            <span className="text-foreground">{pickup.clientEmail}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
