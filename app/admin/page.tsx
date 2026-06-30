"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AGENCIES,
  getAllTransits,
  STATUS_LABEL,
  agencyBySlug,
  getAllPickups,
  getAllAppointments,
  getAllReviews,
  getExpiringDocuments,
  getAllOpenObservations,
  getCurrentLeavesNetworkWide,
  getEmployee,
  LEAVE_TYPE_LABEL,
} from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import { useRole } from "@/lib/role-context";
import type { AgencySlug, TransitStatus } from "@/lib/types";
import { StatusChip } from "@/components/StatusChip";
import { ReviewCard } from "@/components/ReviewCard";
import { PickupStatusChip } from "@/components/PickupStatusChip";
import { DocumentStatusChip } from "@/components/DocumentStatusChip";
import {
  ObservationPriorityChip,
} from "@/components/ObservationChips";
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
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarRange,
  ExternalLink,
  FileText,
  Package,
} from "lucide-react";
import {
  cn,
  formatAmount,
  formatDate,
  formatDateTime,
  relativeDate,
} from "@/lib/utils";

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
  const allPickups = getAllPickups();
  const allAppointments = getAllAppointments();
  const allReviews = getAllReviews();
  const [reviewAgencyFilter, setReviewAgencyFilter] = useState<
    AgencySlug | "all"
  >("all");

  const filteredReviews = useMemo(() => {
    const sorted = [...allReviews].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
    if (reviewAgencyFilter === "all") return sorted.slice(0, 5);
    return sorted
      .filter((r) => r.agencyId === reviewAgencyFilter)
      .slice(0, 5);
  }, [allReviews, reviewAgencyFilter]);

  const now = new Date();
  const upcomingAppointments = allAppointments.filter((a) => {
    if (a.status !== "scheduled") return false;
    const d = new Date(a.rescheduledAt ?? a.scheduledAt);
    return d >= now;
  });

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
  const totalToVerify = toVerify.reduce((sum, t) => sum + t.amount, 0);
  const inFlight = all.filter((t) =>
    (["pending", "validated", "in_transit", "received"] as TransitStatus[]).includes(
      t.status
    )
  );

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const closedThisMonth = all.filter((t) => {
    if (t.status !== "closed") return false;
    const created = new Date(t.createdAt);
    return created >= monthStart;
  });
  const totalClosedMonth = closedThisMonth.reduce(
    (sum, t) => sum + t.amount,
    0
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
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-[var(--gold)]/40 bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total en attente de vérification bancaire
              </p>
              <p className="font-serif text-2xl text-[var(--gold)]">
                {formatAmount(totalToVerify)}
              </p>
            </div>
            <ul className="space-y-2">
              {toVerify.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-3"
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
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-[var(--gold)]">
                      {formatAmount(t.amount)}
                    </span>
                    <Button asChild size="sm">
                      <Link href={`/transit/${t.id}`}>Traiter</Link>
                    </Button>
                  </div>
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
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Card className="gap-2 py-4">
            <CardContent className="space-y-1 px-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                En attente de vérification bancaire
              </p>
              <p className="font-serif text-2xl text-[var(--gold)]">
                {formatAmount(totalToVerify)}
              </p>
              <p className="text-xs text-muted-foreground">
                {toVerify.length} bon{toVerify.length > 1 ? "s" : ""}{" "}
                {STATUS_LABEL.paid_unverified.toLowerCase()}
              </p>
            </CardContent>
          </Card>
          <Card className="gap-2 py-4">
            <CardContent className="space-y-1 px-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Total réseau — mois en cours (clôturés)
              </p>
              <p className="font-serif text-2xl text-[var(--gold)]">
                {formatAmount(totalClosedMonth)}
              </p>
              <p className="text-xs text-muted-foreground">
                {closedThisMonth.length} bon
                {closedThisMonth.length > 1 ? "s" : ""} clôturé
                {closedThisMonth.length > 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
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

      <Separator />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            Colis point relais — réseau
          </h2>
          <Link
            href="/colis"
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {AGENCIES.map((a) => {
            const ps = allPickups.filter(
              (p) => p.destinationAgencyId === a.slug
            );
            const open = ps.filter((p) => p.status !== "picked_up");
            const incoming = ps.filter((p) => p.status === "incoming").length;
            const available = ps.filter((p) => p.status === "available").length;
            return (
              <Card key={a.slug} className="gap-2 py-5">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl text-foreground">
                      {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ps.length} colis au total
                    </p>
                  </div>
                  <Package
                    className="size-5 text-[var(--gold)]"
                    aria-hidden
                  />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <PickupStatusChip status="incoming" />
                    <span className="font-serif text-lg text-foreground">
                      {incoming}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <PickupStatusChip status="available" />
                    <span className="font-serif text-lg text-foreground">
                      {available}
                    </span>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-[var(--gold)]">
                      {open.length}
                    </span>{" "}
                    en attente d'action
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            RDV à venir — réseau
          </h2>
          <Link
            href="/rdv"
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {AGENCIES.map((a) => {
            const ups = upcomingAppointments.filter(
              (ap) => ap.agencyId === a.slug
            );
            const next = [...ups].sort((x, y) => {
              const dx = new Date(x.rescheduledAt ?? x.scheduledAt).getTime();
              const dy = new Date(y.rescheduledAt ?? y.scheduledAt).getTime();
              return dx - dy;
            })[0];
            return (
              <Card key={a.slug} className="gap-2 py-5">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl text-foreground">
                      {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-[var(--gold)]">
                        {ups.length}
                      </span>{" "}
                      RDV à venir
                    </p>
                  </div>
                  <CalendarClock
                    className="size-5 text-[var(--gold)]"
                    aria-hidden
                  />
                </CardHeader>
                <CardContent>
                  {next ? (
                    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                      <p className="text-foreground">{next.clientName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(next.rescheduledAt ?? next.scheduledAt)}
                      </p>
                      <Link
                        href={`/rdv/${next.id}`}
                        className="mt-2 inline-block text-xs font-medium text-[var(--gold)] hover:underline"
                      >
                        Détail →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Aucun RDV à venir.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-foreground">
            Derniers avis clients
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setReviewAgencyFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                reviewAgencyFilter === "all"
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
              )}
            >
              Réseau
            </button>
            {AGENCIES.map((a) => (
              <button
                key={a.slug}
                onClick={() => setReviewAgencyFilter(a.slug)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  reviewAgencyFilter === a.slug
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
                )}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            Aucun avis pour ce filtre.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* === Documents à surveiller (réseau) === */}
      <NetworkDocumentsSection />

      {/* === Observations critiques (réseau) === */}
      <NetworkCriticalObservationsSection />

      {/* === Absences en cours (réseau) === */}
      <NetworkCurrentLeavesSection />
    </div>
  );
}

function NetworkDocumentsSection() {
  const docs = getExpiringDocuments();
  const sorted = [...docs].sort((a, b) => {
    // priorité : expired > missing > expiring_soon
    const rank: Record<string, number> = {
      expired: 0,
      missing: 1,
      expiring_soon: 2,
      up_to_date: 3,
    };
    const ra = rank[a.status];
    const rb = rank[b.status];
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name);
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
          <FileText className="size-5 text-[var(--gold)]" aria-hidden />
          Documents à surveiller — réseau
        </h2>
        <Badge variant="outline">{sorted.length}</Badge>
      </div>
      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
          Tous les documents sont à jour.
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {sorted.map((d) => {
            const agency = agencyBySlug(d.agencyId);
            return (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {agency.name}
                    {d.expiresAt && (
                      <> · expire le {formatDate(d.expiresAt)}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <DocumentStatusChip status={d.status} />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/agence/${d.agencyId}/documents`}>
                      Ouvrir <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function NetworkCriticalObservationsSection() {
  const critical = getAllOpenObservations("high");
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
          <AlertTriangle className="size-5 text-red-600" aria-hidden />
          Observations critiques — réseau
        </h2>
        <Badge variant="outline">{critical.length}</Badge>
      </div>
      {critical.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
          Aucune observation critique ouverte.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {critical.map((o) => {
            const agency = agencyBySlug(o.agencyId);
            return (
              <Card key={o.id} className="border-red-200">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-red-600 text-white">
                      {agency.name}
                    </Badge>
                    <ObservationPriorityChip priority={o.priority} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {relativeDate(o.createdAt)}
                  </span>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-foreground whitespace-pre-line">
                    {o.text}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Par{" "}
                    <span className="font-medium text-foreground">
                      {o.authorName}
                    </span>
                  </p>
                  <Link
                    href={`/agence/${o.agencyId}/observations`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--gold)] hover:underline"
                  >
                    Voir sur {agency.name} <ArrowRight className="size-3" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function NetworkCurrentLeavesSection() {
  const leaves = getCurrentLeavesNetworkWide();
  const grouped = Object.fromEntries(
    AGENCIES.map((a) => [a.slug, [] as typeof leaves])
  ) as Record<AgencySlug, typeof leaves>;
  for (const l of leaves) grouped[l.agencyId]?.push(l);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
          <CalendarRange className="size-5 text-[var(--gold)]" aria-hidden />
          Absences en cours — réseau
        </h2>
        <Badge variant="outline">{leaves.length}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {AGENCIES.map((a) => {
          const ls = grouped[a.slug];
          return (
            <Card key={a.slug} className="gap-2 py-5">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl text-foreground">
                    {a.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-[var(--gold)]">
                      {ls.length}
                    </span>{" "}
                    absent{ls.length > 1 ? "s" : ""}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/agence/${a.slug}/equipe`}>
                    Équipe <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {ls.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Personne d'absent aujourd'hui.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {ls.map((l) => {
                      const emp = getEmployee(l.employeeId);
                      return (
                        <li
                          key={l.id}
                          className="rounded-md border border-border bg-muted/20 p-2"
                        >
                          <p className="text-foreground">
                            {emp
                              ? `${emp.firstName} ${emp.lastName}`
                              : "Employé inconnu"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {LEAVE_TYPE_LABEL[l.type]} · retour{" "}
                            {formatDate(
                              new Date(
                                new Date(l.endsAt).getTime() +
                                  24 * 60 * 60 * 1000
                              )
                            )}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
