"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAllTransits, STATUS_LABEL, agencyBySlug } from "@/lib/mock";
import type { TransitStatus } from "@/lib/types";
import { cn, formatDate, formatAmount } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/StatusChip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Eye, Plus, Truck } from "lucide-react";

const STATUSES: (TransitStatus | "all")[] = [
  "all",
  "pending",
  "validated",
  "in_transit",
  "received",
  "paid_unverified",
  "closed",
  "refused",
];

export default function TransitListPage() {
  const { role, isPietro } = useRole();
  const [filter, setFilter] = useState<TransitStatus | "all">("all");

  const transits = useMemo(() => {
    let all = getAllTransits();
    if (filter !== "all") {
      all = all.filter((t) => t.status === filter);
    }
    if (role.kind === "agency") {
      // On met d'abord en avant les transits qui concernent l'agence connectée
      // (from OU to), puis le reste du réseau. En admin (Pietro) : tout, sans tri.
      const slug = role.agencySlug;
      const concerns = (t: (typeof all)[number]) =>
        t.from === slug || t.to === slug;
      all = [...all].sort((a, b) => Number(concerns(b)) - Number(concerns(a)));
    }
    return all;
  }, [filter, role]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
            Module
          </p>
          <h1 className="font-serif text-4xl text-foreground">Transit</h1>
          <p className="mt-1 text-muted-foreground">
            {isPietro
              ? "Tous les bons de transit du réseau."
              : "Bons impliquant votre agence."}
          </p>
        </div>
        <Button asChild>
          <Link href="/transit/nouveau">
            <Plus className="size-4" />
            Nouveau bon
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              filter === s
                ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
            )}
          >
            {s === "all" ? "Tous" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {transits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          Aucun bon correspondant.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-foreground hover:bg-foreground">
                <TableHead className="text-background text-[11px] uppercase tracking-[0.12em]">
                  Référence
                </TableHead>
                <TableHead className="text-background text-[11px] uppercase tracking-[0.12em]">
                  Date
                </TableHead>
                <TableHead className="text-background text-[11px] uppercase tracking-[0.12em]">
                  Trajet
                </TableHead>
                <TableHead className="text-background text-[11px] uppercase tracking-[0.12em] text-right">
                  Montant
                </TableHead>
                <TableHead className="text-background text-[11px] uppercase tracking-[0.12em]">
                  Statut
                </TableHead>
                <TableHead className="text-background text-[11px] uppercase tracking-[0.12em] text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transits.map((t) => {
                const lastEvent = t.events[t.events.length - 1];
                const showShippingInfo =
                  t.status === "in_transit" || t.status === "received";
                const concernsMe =
                  role.kind === "agency" &&
                  (t.from === role.agencySlug || t.to === role.agencySlug);
                return (
                  <TableRow
                    key={t.id}
                    className={cn(
                      "hover:bg-muted/40",
                      concernsMe && "bg-[var(--gold)]/[0.04]"
                    )}
                  >
                    <TableCell className="py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{t.reference}</span>
                        <Link
                          href={`/transit/${t.id}`}
                          aria-label="Aperçu"
                          title="Aperçu"
                          className="inline-flex size-6 items-center justify-center rounded border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/20"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span>{formatDate(t.createdAt)}</span>
                        {t.createdBy && (
                          <span className="text-[11px] text-muted-foreground/80">
                            Émis par {t.createdBy}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-foreground">
                        {agencyBySlug(t.from).name}
                        <ArrowRight
                          className="size-3.5 text-[var(--gold)]"
                          aria-hidden
                        />
                        {agencyBySlug(t.to).name}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-right font-serif text-base text-[var(--gold)]">
                      {formatAmount(t.amount)}
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <StatusChip status={t.status} />
                        {showShippingInfo && lastEvent && (
                          <span className="text-[11px] text-muted-foreground">
                            {t.transporter} · {formatDate(lastEvent.date)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {t.status === "in_transit" && (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                            <Truck className="size-3" />
                            Infos suivi
                          </span>
                        )}
                        <Button
                          asChild
                          size="sm"
                          className="h-8 text-[11px] uppercase tracking-wider"
                        >
                          <Link href={`/transit/${t.id}`}>Voir en détail</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
