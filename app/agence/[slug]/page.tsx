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
  getAllPickups,
  getAllAppointments,
  getAllReviews,
} from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import { PickupCard } from "@/components/PickupCard";
import { AppointmentCard } from "@/components/AppointmentCard";
import { ReviewCard } from "@/components/ReviewCard";
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

  const allPickups = getAllPickups().filter(
    (p) => p.destinationAgencyId === agencySlug
  );
  const openPickups = allPickups.filter((p) => p.status !== "picked_up");
  const recentPickups = [...allPickups]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3);

  const allAppointments = getAllAppointments().filter(
    (a) => a.agencyId === agencySlug
  );
  const today = new Date();
  const isSameDay = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const todaysAppointments = allAppointments.filter((a) =>
    isSameDay(new Date(a.rescheduledAt ?? a.scheduledAt))
  );

  const agencyReviews = [...getAllReviews()]
    .filter((r) => r.agencyId === agencySlug)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const recentReviews = agencyReviews.slice(0, 3);

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

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            Colis point relais
            {openPickups.length > 0 && (
              <Badge className="ml-3 bg-[var(--gold)] text-primary-foreground">
                {openPickups.length} en attente
              </Badge>
            )}
          </h2>
          <Link
            href="/colis"
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        {recentPickups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            Aucun colis pour cette agence.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recentPickups.map((p) => (
              <PickupCard key={p.id} pickup={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            RDV du jour
            {todaysAppointments.length > 0 && (
              <Badge className="ml-3 bg-[var(--gold)] text-primary-foreground">
                {todaysAppointments.length}
              </Badge>
            )}
          </h2>
          <Link
            href="/rdv"
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        {todaysAppointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            Aucun RDV aujourd'hui.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {todaysAppointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">Avis clients</h2>
          <span className="text-xs text-muted-foreground">
            {agencyReviews.length} avis au total
          </span>
        </div>
        {recentReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            Aucun avis pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recentReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
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
