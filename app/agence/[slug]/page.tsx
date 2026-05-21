"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AGENCIES,
  OBSERVATIONS,
  TEAM,
  agencyBySlug,
  getAllTransits,
} from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import type { AgencySlug } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AgencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Agence
        </p>
        <h1 className="font-serif text-4xl text-foreground">{agency.name}</h1>
        <p className="text-muted-foreground">{agency.address}</p>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          Responsable&nbsp;:{" "}
          <span className="text-foreground">{agency.manager}</span>
          <span>·</span>
          Vous êtes connecté en{" "}
          <span className="font-medium text-[var(--gold)]">{roleLabel}</span>
          {isPietro && (
            <Badge variant="secondary" className="ml-1">
              vue admin
            </Badge>
          )}
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            Transit récent
          </h2>
          <Link
            href="/transit"
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        {transits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Aucun transit pour cette agence.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {transits.slice(0, 4).map((t) => (
              <TransitCard key={t.id} transit={t} />
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Envois" value={sent.length} />
          <Stat label="Réceptions" value={received.length} />
          <Stat
            label="En attente"
            value={transits.filter((t) => t.status === "pending").length}
          />
          <Stat
            label="À vérifier (Pietro)"
            value={
              transits.filter((t) => t.status === "paid_unverified").length
            }
          />
        </div>
      </section>

      <Separator />

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Observations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {OBSERVATIONS[agencySlug].length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune observation.
              </p>
            ) : (
              <ul className="space-y-3">
                {OBSERVATIONS[agencySlug].map((o, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border bg-muted/30 p-3"
                  >
                    <p className="text-sm text-foreground">{o.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(o.date)} · {o.author}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs italic text-muted-foreground">
              (Module observations — stub statique pour cette ébauche)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {TEAM[agencySlug].map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-foreground">{m.name}</span>
                  <span className="text-muted-foreground">{m.role}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs italic text-muted-foreground">
              (Module équipe — stub statique)
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="space-y-1 px-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-serif text-2xl text-[var(--gold)]">{value}</p>
      </CardContent>
    </Card>
  );
}
