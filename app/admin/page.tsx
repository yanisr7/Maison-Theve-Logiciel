"use client";

import Link from "next/link";
import { AGENCIES, getAllTransits, STATUS_LABEL, agencyBySlug } from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import { useRole } from "@/lib/role-context";
import type { TransitStatus } from "@/lib/types";
import { StatusChip } from "@/components/StatusChip";

const ALL_STATUSES: TransitStatus[] = [
  "pending",
  "validated",
  "in_transit",
  "received",
  "paid_unverified",
  "closed",
  "refused",
];

export default function AdminPage() {
  const { isPietro } = useRole();
  const all = getAllTransits();

  if (!isPietro) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-cream-faint bg-dark2 p-8 text-center">
        <h1 className="font-serif text-2xl text-cream">Accès Pietro uniquement</h1>
        <p className="mt-2 text-sm text-cream-dim">
          Ce dashboard est réservé au rôle <span className="text-gold">Pietro (Admin)</span>.
          Changez de rôle via le sélecteur en haut.
        </p>
        <div className="mt-6">
          <Link
            href="/transit"
            className="rounded-md border border-cream-faint px-4 py-2 text-sm text-cream hover:border-gold"
          >
            Voir le module Transit →
          </Link>
        </div>
      </div>
    );
  }

  const toVerify = all.filter((t) => t.status === "paid_unverified");
  const inFlight = all.filter((t) =>
    (["pending", "validated", "in_transit", "received"] as TransitStatus[]).includes(t.status)
  );

  const byStatus: Record<TransitStatus, number> = ALL_STATUSES.reduce(
    (acc, s) => {
      acc[s] = all.filter((t) => t.status === s).length;
      return acc;
    },
    {} as Record<TransitStatus, number>
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Pietro</p>
        <h1 className="font-serif text-4xl text-cream">Vue 360°</h1>
        <p className="mt-1 text-cream-dim">
          Pilotage consolidé des {AGENCIES.length} agences.
        </p>
      </header>

      {toVerify.length > 0 && (
        <section className="rounded-xl border border-gold bg-gold-dim p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-cream">
              Alertes paiement — à vérifier
            </h2>
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-medium text-[var(--dark)]">
              {toVerify.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-cream-dim">
            Federbe a déclaré ces virements payés — vérifier la banque puis clôturer.
          </p>
          <ul className="mt-4 space-y-2">
            {toVerify.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-md bg-dark2 p-3"
              >
                <div>
                  <Link href={`/transit/${t.id}`} className="font-serif text-gold hover:underline">
                    {t.reference}
                  </Link>
                  <p className="text-xs text-cream-dim">
                    {agencyBySlug(t.from).name} → {agencyBySlug(t.to).name} ·{" "}
                    Facture <span className="text-cream">{t.invoiceNumber}</span>
                  </p>
                </div>
                <Link
                  href={`/transit/${t.id}`}
                  className="rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-[var(--dark)] hover:bg-[var(--gold-light)]"
                >
                  Traiter
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-serif text-2xl text-cream">Statuts en cours</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {ALL_STATUSES.map((s) => (
            <div key={s} className="rounded-lg border border-cream-faint bg-dark2 p-4">
              <StatusChip status={s} className="text-[10px]" />
              <p className="mt-3 font-serif text-3xl text-gold">{byStatus[s]}</p>
              <p className="text-[11px] uppercase tracking-wide text-cream-dim">
                {STATUS_LABEL[s]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl text-cream">Agences</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {AGENCIES.map((a) => {
            const ts = all.filter((t) => t.from === a.slug || t.to === a.slug);
            return (
              <Link
                key={a.slug}
                href={`/agence/${a.slug}`}
                className="rounded-xl border border-cream-faint bg-dark2 p-5 transition-colors hover:border-gold hover:bg-dark3"
              >
                <p className="font-serif text-xl text-cream">{a.name}</p>
                <p className="text-xs text-cream-dim">{a.manager}</p>
                <p className="mt-3 text-sm text-cream-dim">
                  {ts.length} bons impliqués
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl text-cream">Flux en cours</h2>
        {inFlight.length === 0 ? (
          <p className="rounded-lg border border-cream-faint bg-dark2 p-6 text-cream-dim">
            Tout est à jour.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {inFlight.map((t) => (
              <TransitCard key={t.id} transit={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
