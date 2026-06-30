"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AGENCIES, PICKUP_STATUS_LABEL } from "@/lib/mock";
import { getPickupsPage } from "@/lib/pickups-db";
import { PickupCard } from "@/components/PickupCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgencySlug, Pickup, PickupStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

const STATUSES: (PickupStatus | "all")[] = [
  "all",
  "incoming",
  "available",
  "picked_up",
];

const PAGE_SIZE = 30;

export default function ColisListPage() {
  const { role } = useRole();
  const [statusFilter, setStatusFilter] = useState<PickupStatus | "all">("all");
  const [agencyFilter, setAgencyFilter] = useState<AgencySlug | "all">("all");

  const [rows, setRows] = useState<Pickup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Charge une page côté base (statut passé à la requête), append si page > 1.
  const loadPage = useCallback(
    async (targetPage: number) => {
      const isFirst = targetPage === 1;
      if (isFirst) setLoading(true);
      else setLoadingMore(true);
      try {
        const { rows: newRows, total: newTotal } = await getPickupsPage(
          targetPage,
          PAGE_SIZE,
          statusFilter === "all" ? undefined : statusFilter
        );
        setTotal(newTotal);
        setRows((prev) => (isFirst ? newRows : [...prev, ...newRows]));
        setPage(targetPage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter]
  );

  // Reset page=1 au changement de filtre de statut.
  useEffect(() => {
    loadPage(1).catch(() => {
      setLoading(false);
      setLoadingMore(false);
    });
  }, [loadPage]);

  // Le filtre agence (rôle / pastilles admin) reste côté client : la fonction
  // de pagination en base ne gère que le statut.
  const pickups = useMemo(() => {
    let all = rows;
    if (role.kind === "agency") {
      all = all.filter((p) => p.destinationAgencyId === role.agencySlug);
    } else if (agencyFilter !== "all") {
      all = all.filter((p) => p.destinationAgencyId === agencyFilter);
    }
    // tri : incoming / available d'abord (à traiter), picked_up ensuite
    const order: Record<PickupStatus, number> = {
      incoming: 0,
      available: 1,
      picked_up: 2,
    };
    return [...all].sort(
      (a, b) =>
        order[a.status] - order[b.status] ||
        (a.createdAt < b.createdAt ? 1 : -1)
    );
  }, [agencyFilter, role, rows]);

  const hasMore = rows.length < total;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Module
        </p>
        <h1 className="font-serif text-4xl text-foreground">
          Bien confié
        </h1>
        <p className="mt-1 text-muted-foreground">
          {role.kind === "admin"
            ? "Tous les biens confiés transférés entre agences pour essai client."
            : "Biens confiés destinés à votre agence."}
        </p>
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                statusFilter === s
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
              )}
            >
              {s === "all" ? "Tous" : PICKUP_STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {role.kind === "admin" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Agence
            </span>
            <button
              onClick={() => setAgencyFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                agencyFilter === "all"
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
              )}
            >
              Toutes
            </button>
            {AGENCIES.map((a) => (
              <button
                key={a.slug}
                onClick={() => setAgencyFilter(a.slug)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  agencyFilter === a.slug
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
                )}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="ml-auto h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : pickups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          Aucun bien confié correspondant.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {pickups.map((p) => (
              <PickupCard key={p.id} pickup={p} />
            ))}
          </div>

          {hasMore && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => loadPage(page + 1)}
                disabled={loadingMore}
                className={cn(
                  "rounded-full border border-[var(--gold)] px-5 py-2 text-sm text-foreground transition-colors",
                  "hover:bg-[var(--gold)]/10 disabled:opacity-50"
                )}
              >
                {loadingMore ? "Chargement…" : "Voir plus"}
              </button>
              <span className="text-xs text-muted-foreground">
                {rows.length} / {total}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
