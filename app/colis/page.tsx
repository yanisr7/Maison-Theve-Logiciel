"use client";

import { useMemo, useState } from "react";
import {
  AGENCIES,
  getAllPickups,
  PICKUP_STATUS_LABEL,
} from "@/lib/mock";
import { PickupCard } from "@/components/PickupCard";
import type { AgencySlug, PickupStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

const STATUSES: (PickupStatus | "all")[] = [
  "all",
  "incoming",
  "available",
  "picked_up",
];

export default function ColisListPage() {
  const { role } = useRole();
  const [statusFilter, setStatusFilter] = useState<PickupStatus | "all">("all");
  const [agencyFilter, setAgencyFilter] = useState<AgencySlug | "all">("all");

  const pickups = useMemo(() => {
    let all = getAllPickups();
    if (role.kind === "agency") {
      all = all.filter((p) => p.destinationAgencyId === role.agencySlug);
    } else if (agencyFilter !== "all") {
      all = all.filter((p) => p.destinationAgencyId === agencyFilter);
    }
    if (statusFilter !== "all") {
      all = all.filter((p) => p.status === statusFilter);
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
  }, [statusFilter, agencyFilter, role]);

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

      {pickups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          Aucun bien confié correspondant.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pickups.map((p) => (
            <PickupCard key={p.id} pickup={p} />
          ))}
        </div>
      )}
    </div>
  );
}
