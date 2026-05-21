"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAllTransits, STATUS_LABEL } from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import type { TransitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

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
  const { role } = useRole();
  const [filter, setFilter] = useState<TransitStatus | "all">("all");

  const transits = useMemo(() => {
    let all = getAllTransits();
    if (role.kind === "agency") {
      all = all.filter((t) => t.from === role.agencySlug || t.to === role.agencySlug);
    }
    if (filter !== "all") {
      all = all.filter((t) => t.status === filter);
    }
    return all;
  }, [filter, role]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Module</p>
          <h1 className="font-serif text-4xl text-cream">Transit</h1>
          <p className="mt-1 text-cream-dim">
            {role.kind === "admin"
              ? "Tous les bons de transit du réseau."
              : "Bons impliquant votre agence."}
          </p>
        </div>
        <Link
          href="/transit/nouveau"
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[var(--dark)] transition-colors hover:bg-[var(--gold-light)]"
        >
          + Nouveau bon
        </Link>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              filter === s
                ? "border-gold bg-gold-dim text-cream"
                : "border-cream-faint text-cream-dim hover:border-gold hover:text-cream"
            )}
          >
            {s === "all" ? "Tous" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {transits.length === 0 ? (
        <p className="rounded-lg border border-cream-faint bg-dark2 p-8 text-center text-cream-dim">
          Aucun bon correspondant.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {transits.map((t) => (
            <TransitCard key={t.id} transit={t} />
          ))}
        </div>
      )}
    </div>
  );
}
