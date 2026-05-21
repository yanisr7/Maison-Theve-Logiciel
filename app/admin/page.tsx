"use client";

import Link from "next/link";
import {
  AGENCIES,
  getAllTransits,
  STATUS_LABEL,
  agencyBySlug,
} from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import { useRole } from "@/lib/role-context";
import type { TransitStatus } from "@/lib/types";
import { StatusChip } from "@/components/StatusChip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowRight, ExternalLink } from "lucide-react";

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
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              Accès Pietro uniquement
            </CardTitle>
            <CardDescription>
              Ce dashboard est réservé au rôle{" "}
              <span className="font-medium text-[var(--gold)]">
                Pietro (Admin)
              </span>
              . Changez de rôle via le sélecteur en haut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/transit">
                Voir le module Transit
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toVerify = all.filter((t) => t.status === "paid_unverified");
  const inFlight = all.filter((t) =>
    (["pending", "validated", "in_transit", "received"] as TransitStatus[]).includes(
      t.status
    )
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
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Pietro
        </p>
        <h1 className="font-serif text-4xl text-foreground">Vue 360°</h1>
        <p className="mt-1 text-muted-foreground">
          Pilotage consolidé des {AGENCIES.length} agences.
        </p>
      </header>

      {toVerify.length > 0 && (
        <Card className="border-[var(--gold)] bg-[var(--gold)]/5">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-[var(--gold)]" />
                <CardTitle className="font-serif text-2xl">
                  Alertes paiement — à vérifier
                </CardTitle>
              </div>
              <Badge className="bg-[var(--gold)] text-primary-foreground">
                {toVerify.length}
              </Badge>
            </div>
            <CardDescription>
              Federbe a déclaré ces virements payés — vérifier la banque puis
              clôturer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {toVerify.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3"
                >
                  <div>
                    <Link
                      href={`/transit/${t.id}`}
                      className="font-serif text-[var(--gold)] hover:underline"
                    >
                      {t.reference}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {agencyBySlug(t.from).name} → {agencyBySlug(t.to).name}{" "}
                      · Facture{" "}
                      <span className="font-medium text-foreground">
                        {t.invoiceNumber}
                      </span>
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/transit/${t.id}`}>Traiter</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-4 font-serif text-2xl text-foreground">
          Statuts en cours
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {ALL_STATUSES.map((s) => (
            <Card key={s} className="gap-2 py-4">
              <CardContent className="space-y-2 px-4">
                <StatusChip status={s} />
                <p className="font-serif text-3xl text-[var(--gold)]">
                  {byStatus[s]}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {STATUS_LABEL[s]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-4 font-serif text-2xl text-foreground">Agences</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {AGENCIES.map((a) => {
            const ts = all.filter(
              (t) => t.from === a.slug || t.to === a.slug
            );
            return (
              <Link
                key={a.slug}
                href={`/agence/${a.slug}`}
                className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="gap-2 py-5 transition-all hover:border-[var(--gold)] hover:shadow-md">
                  <CardContent className="space-y-1">
                    <div className="flex items-start justify-between">
                      <p className="font-serif text-xl text-foreground">
                        {a.name}
                      </p>
                      <ExternalLink className="size-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.manager}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {ts.length} bons impliqués
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl text-foreground">
          Flux en cours
        </h2>
        {inFlight.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Tout est à jour.
          </div>
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
