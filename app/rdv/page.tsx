"use client";

import { useEffect, useState } from "react";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/mock";
import { getAppointmentsPage } from "@/lib/appointments-db";
import { AppointmentCard } from "@/components/AppointmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

const STATUSES: (AppointmentStatus | "all")[] = [
  "all",
  "scheduled",
  "done",
  "cancelled",
  "rescheduled",
];

const PAGE_SIZE = 30;

export default function RdvListPage() {
  const { role } = useRole();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  const [rows, setRows] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset à la page 1 quand le filtre de statut change.
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    let active = true;
    const isFirstPage = page === 1;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    const status = statusFilter === "all" ? undefined : statusFilter;
    getAppointmentsPage(page, PAGE_SIZE, status)
      .then((res) => {
        if (!active) return;
        setTotal(res.total);
        setRows((prev) => (isFirstPage ? res.rows : [...prev, ...res.rows]));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setLoadingMore(false);
      });

    return () => {
      active = false;
    };
  }, [page, statusFilter]);

  const hasMore = rows.length < total;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Module
        </p>
        <h1 className="font-serif text-4xl text-foreground">RDV clients</h1>
        <p className="mt-1 text-muted-foreground">
          {role.kind === "admin"
            ? "Tous les RDV du réseau."
            : "RDV de votre agence."}
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
              {s === "all" ? "Tous" : APPOINTMENT_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          Aucun RDV correspondant.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((a) => {
              const concernsMe =
                role.kind === "agency" && a.agencyId === role.agencySlug;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-xl transition-colors",
                    concernsMe && "ring-1 ring-[var(--gold)]/40"
                  )}
                >
                  <AppointmentCard appointment={a} />
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {rows.length} / {total}
            </p>
            {hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loadingMore}
                className={cn(
                  "rounded-full border border-[var(--gold)] px-5 py-2 text-xs uppercase tracking-[0.12em] transition-colors",
                  loadingMore
                    ? "cursor-not-allowed text-muted-foreground"
                    : "text-foreground hover:bg-[var(--gold)]/10"
                )}
              >
                {loadingMore ? "Chargement…" : "Voir plus"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
