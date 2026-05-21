import Link from "next/link";
import type { Transit } from "@/lib/types";
import { agencyBySlug } from "@/lib/mock";
import { StatusChip } from "./StatusChip";
import { formatDate } from "@/lib/utils";

export function TransitCard({ transit }: { transit: Transit }) {
  const from = agencyBySlug(transit.from);
  const to = agencyBySlug(transit.to);

  return (
    <Link
      href={`/transit/${transit.id}`}
      className="group block rounded-xl border border-cream-faint bg-dark2 p-5 transition-colors hover:border-gold hover:bg-dark3"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-lg text-gold">{transit.reference}</p>
          <p className="mt-1 text-sm text-cream-dim">
            <span className="text-cream">{from.name}</span>
            <span className="mx-2 text-cream-dim">→</span>
            <span className="text-cream">{to.name}</span>
            <span className="mx-2 text-cream-dim">·</span>
            {transit.transporter}
          </p>
        </div>
        <StatusChip status={transit.status} />
      </div>
      <p className="mt-4 line-clamp-2 text-sm text-cream-dim">{transit.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-cream-dim">
        <span>Créé le {formatDate(transit.createdAt)}</span>
        {transit.invoiceNumber && <span>Facture {transit.invoiceNumber}</span>}
      </div>
    </Link>
  );
}
