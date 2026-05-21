"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AGENCIES, OBSERVATIONS, TEAM, agencyBySlug, getAllTransits } from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import type { AgencySlug } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { formatDate } from "@/lib/utils";

export default function AgencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isValid = AGENCIES.some((a) => a.slug === slug);
  if (!isValid) return notFound();

  const agencySlug = slug as AgencySlug;
  const agency = agencyBySlug(agencySlug);
  const { roleLabel, isPietro } = useRole();

  const transits = getAllTransits().filter(
    (t) => t.from === agencySlug || t.to === agencySlug
  );
  const sent = transits.filter((t) => t.from === agencySlug);
  const received = transits.filter((t) => t.to === agencySlug);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Agence</p>
        <h1 className="font-serif text-4xl text-cream">{agency.name}</h1>
        <p className="text-cream-dim">{agency.address}</p>
        <p className="text-sm text-cream-dim">
          Responsable&nbsp;: <span className="text-cream">{agency.manager}</span>
          <span className="mx-2">·</span>
          Vous êtes connecté en <span className="text-gold">{roleLabel}</span>
          {isPietro && (
            <span className="ml-2 rounded bg-gold-dim px-2 py-0.5 text-xs text-gold">vue admin</span>
          )}
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-cream">Transit récent</h2>
          <Link href="/transit" className="text-sm text-gold hover:underline">
            Voir tout →
          </Link>
        </div>
        {transits.length === 0 ? (
          <p className="rounded-lg border border-cream-faint bg-dark2 p-6 text-cream-dim">
            Aucun transit pour cette agence.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {transits.slice(0, 4).map((t) => (
              <TransitCard key={t.id} transit={t} />
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-cream-dim md:grid-cols-4">
          <Stat label="Envois" value={sent.length} />
          <Stat label="Réceptions" value={received.length} />
          <Stat
            label="En attente"
            value={transits.filter((t) => t.status === "pending").length}
          />
          <Stat
            label="À vérifier (Pietro)"
            value={transits.filter((t) => t.status === "paid_unverified").length}
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-cream-faint bg-dark2 p-6">
          <h3 className="mb-3 font-serif text-xl text-cream">Observations</h3>
          {OBSERVATIONS[agencySlug].length === 0 ? (
            <p className="text-sm text-cream-dim">Aucune observation.</p>
          ) : (
            <ul className="space-y-3">
              {OBSERVATIONS[agencySlug].map((o, i) => (
                <li key={i} className="rounded-md border border-cream-faint bg-dark3 p-3">
                  <p className="text-sm text-cream">{o.text}</p>
                  <p className="mt-2 text-xs text-cream-dim">
                    {formatDate(o.date)} · {o.author}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs italic text-cream-dim">
            (Module observations — stub statique pour cette ébauche)
          </p>
        </div>

        <div className="rounded-xl border border-cream-faint bg-dark2 p-6">
          <h3 className="mb-3 font-serif text-xl text-cream">Équipe</h3>
          <ul className="divide-y divide-cream-faint">
            {TEAM[agencySlug].map((m) => (
              <li key={m.name} className="flex items-center justify-between py-3 text-sm">
                <span className="text-cream">{m.name}</span>
                <span className="text-cream-dim">{m.role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs italic text-cream-dim">(Module équipe — stub statique)</p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-cream-faint bg-dark2 p-4">
      <p className="text-xs uppercase tracking-wide text-cream-dim">{label}</p>
      <p className="mt-1 font-serif text-2xl text-gold">{value}</p>
    </div>
  );
}
