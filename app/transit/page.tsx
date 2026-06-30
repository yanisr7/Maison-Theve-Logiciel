"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_LABEL, agencyBySlug } from "@/lib/mock";
import { getTransitsPage } from "@/lib/transits-db";
import type { Transit, TransitStatus } from "@/lib/types";
import { cn, formatDate, formatAmount } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

const PAGE_SIZE = 30;

export default function TransitListPage() {
  const { role, isPietro } = useRole();
  const [filter, setFilter] = useState<TransitStatus | "all">("all");

  const [rows, setRows] = useState<Transit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Stats globales (indépendantes du filtre courant) — count seul via pageSize=1.
  const [stats, setStats] = useState({ total: 0, inTransit: 0, toVerify: 0 });

  // Charge la première page chaque fois que le filtre change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    const status = filter === "all" ? undefined : filter;
    getTransitsPage(1, PAGE_SIZE, status)
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  // Stats globales chargées une fois au montage.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getTransitsPage(1, 1),
      getTransitsPage(1, 1, "in_transit"),
      getTransitsPage(1, 1, "paid_unverified"),
    ])
      .then(([all, inTransit, toVerify]) => {
        if (cancelled) return;
        setStats({
          total: all.total,
          inTransit: inTransit.total,
          toVerify: toVerify.total,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    const next = page + 1;
    setLoadingMore(true);
    const status = filter === "all" ? undefined : filter;
    getTransitsPage(next, PAGE_SIZE, status)
      .then((res) => {
        setRows((prev) => [...prev, ...res.rows]);
        setTotal(res.total);
        setPage(next);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [page, filter, loadingMore]);

  const hasMore = rows.length < total;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--gold)]">
            Module
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground">
            Transit
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isPietro
              ? "Tous les bons de transit du réseau."
              : "Bons impliquant votre agence."}
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-[var(--gold)] px-5 text-white shadow-sm transition-colors hover:bg-[var(--gold)]/90"
        >
          <Link href="/transit/nouveau">
            <Plus className="size-4" />
            Nouveau bon
          </Link>
        </Button>
      </header>

      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total des bons
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              En transit
            </p>
            <p className="mt-2 text-3xl font-bold text-[var(--gold)]">
              {stats.inTransit}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              À vérifier
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {stats.toVerify}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === s
                ? "border-[var(--gold)] bg-[var(--gold)] text-white shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
            )}
          >
            {s === "all" ? "Tous" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-4 border-b border-border bg-muted/50 px-4 py-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="ml-auto h-3 w-16" />
          </div>
          <div className="divide-y divide-border/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="ml-auto h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          Aucun bon correspondant.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Référence
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Trajet
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground text-right">
                    Montant
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Statut
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => {
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
                        "border-b border-border/60 transition-colors hover:bg-muted/40",
                        concernsMe && "bg-[var(--gold)]/[0.04]"
                      )}
                    >
                      <TableCell className="py-4 font-medium">
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

                      <TableCell className="py-4 text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          <span>{formatDate(t.createdAt)}</span>
                          {t.createdBy && (
                            <span className="text-[11px] text-muted-foreground/80">
                              Émis par {t.createdBy}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          {agencyBySlug(t.from).name}
                          <ArrowRight
                            className="size-3.5 text-[var(--gold)]"
                            aria-hidden
                          />
                          {agencyBySlug(t.to).name}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 text-right text-base font-semibold text-[var(--gold)]">
                        {formatAmount(t.amount)}
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <StatusChip status={t.status} />
                          {showShippingInfo && lastEvent && (
                            <span className="text-[11px] text-muted-foreground">
                              {t.transporter} · {formatDate(lastEvent.date)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-right">
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
                            className="h-8 rounded-full bg-[var(--gold)] px-4 text-[11px] uppercase tracking-wider text-white hover:bg-[var(--gold)]/90"
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

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {rows.length} / {total}
            </p>
            {hasMore && (
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border-[var(--gold)]/40 px-6 text-[var(--gold)] hover:bg-[var(--gold)]/10"
              >
                {loadingMore ? "Chargement…" : "Voir plus"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
