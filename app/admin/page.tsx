"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AGENCIES,
  STATUS_LABEL,
  agencyBySlug,
  LEAVE_TYPE_LABEL,
} from "@/lib/mock";
import { getAllTransits } from "@/lib/transits-db";
import { getAllPickups } from "@/lib/pickups-db";
import { getAllAppointments } from "@/lib/appointments-db";
import { getAllReviews } from "@/lib/reviews-db";
import { getExpiringDocuments } from "@/lib/documents-db";
import { getAllOpenObservations } from "@/lib/observations-db";
import { getCurrentLeavesNetworkWide, getAllEmployees } from "@/lib/team-db";
import { TransitCard } from "@/components/TransitCard";
import { useRole } from "@/lib/role-context";
import type {
  Transit,
  Pickup,
  Appointment,
  Review,
  LegalDocument,
  Observation,
  Leave,
  Employee,
  AgencySlug,
  TransitStatus,
} from "@/lib/types";
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

type AdminData = {
  transits: Transit[];
  pickups: Pickup[];
  appointments: Appointment[];
  reviews: Review[];
  expiringDocuments: LegalDocument[];
  openObservations: Observation[];
  currentLeavesNetworkWide: Leave[];
  allEmployees: Employee[];
};

export default function AdminPage() {
  const { isPietro } = useRole();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewAgencyFilter, setReviewAgencyFilter] = useState<
    AgencySlug | "all"
  >("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getAllTransits(),
      getAllPickups(),
      getAllAppointments(),
      getAllReviews(),
      getExpiringDocuments(),
      getAllOpenObservations("high"),
      getCurrentLeavesNetworkWide(),
      getAllEmployees(),
    ])
      .then(
        ([
          transits,
          pickups,
          appointments,
          reviews,
          expiringDocuments,
          openObservations,
          currentLeavesNetworkWide,
          allEmployees,
        ]) => {
          if (!active) return;
          setData({
            transits,
            pickups,
            appointments,
            reviews,
            expiringDocuments,
            openObservations,
            currentLeavesNetworkWide,
            allEmployees,
          });
          setLoading(false);
        }
      )
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const all = data?.transits ?? [];
  const allPickups = data?.pickups ?? [];
  const allAppointments = data?.appointments ?? [];
  const allReviews = data?.reviews ?? [];

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

  if (loading || data === null) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
        Chargement…
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
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Pietro
        </p>
        <h1 className="text-4xl font-normal tracking-tight text-foreground">
          Vue 360°
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pilotage consolidé des {AGENCIES.length} agences.
        </p>
      </header>

      {/* === Rangée de KPI (style Shopeers) === */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Flux en cours
          </p>
          <p className="mt-2 text-3xl font-medium tabular-nums text-foreground">
            {inFlight.length}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            bons en circulation
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              À vérifier
            </p>
            {toVerify.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-[var(--gold)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--gold)]">
                {toVerify.length} en attente
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-medium tabular-nums text-[var(--gold)]">
            {toVerify.length}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatAmount(totalToVerify)} à contrôler
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Clôturé ce mois
          </p>
          <p className="mt-2 text-3xl font-medium tabular-nums text-foreground">
            {closedThisMonth.length}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatAmount(totalClosedMonth)} réseau
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Agences
          </p>
          <p className="mt-2 text-3xl font-medium tabular-nums text-foreground">
            {AGENCIES.length}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            réseau consolidé
          </p>
        </div>
      </div>

      {toVerify.length > 0 && (
        <Card className="rounded-2xl border-[var(--gold)]/40 bg-[var(--gold)]/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-[var(--gold)]" />
                <CardTitle className="text-2xl font-normal">
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
            <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-[var(--gold)]/40 bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total en attente de vérification bancaire
              </p>
              <p className="text-2xl font-medium text-[var(--gold)]">
                {formatAmount(totalToVerify)}
              </p>
            </div>
            <ul className="space-y-2">
              {toVerify.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div>
                    <Link
                      href={`/transit/${t.id}`}
                      className="font-medium text-[var(--gold)] hover:underline"
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
                    <span className="text-lg font-medium text-[var(--gold)]">
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
        <h2 className="mb-4 text-2xl font-normal text-foreground">
          Statuts en cours
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {ALL_STATUSES.map((s) => (
            <Card key={s} className="gap-2 rounded-2xl py-4 shadow-sm">
              <CardContent className="space-y-2 px-4">
                <StatusChip
                  status={s}
                  className="inline-flex max-w-full whitespace-normal text-left leading-tight"
                />
                <p className="text-3xl font-medium tabular-nums text-[var(--gold)]">
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
        <h2 className="mb-4 text-2xl font-normal text-foreground">Agences</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {AGENCIES.map((a) => {
            const ts = all.filter(
              (t) => t.from === a.slug || t.to === a.slug
            );
            const inProgress = ts.filter(
              (t) => t.status !== "closed" && t.status !== "refused"
            );
            const inProgressTotal = inProgress.reduce(
              (sum, t) => sum + t.amount,
              0
            );
            return (
              <Link
                key={a.slug}
                href={`/agence/${a.slug}`}
                className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="gap-2 rounded-2xl py-5 shadow-sm transition-all hover:border-[var(--gold)] hover:shadow-md">
                  <CardContent className="space-y-1">
                    <div className="flex items-start justify-between">
                      <p className="text-xl font-normal text-foreground">
                        {a.name}
                      </p>
                      <ExternalLink className="size-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.manager}
                    </p>
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Transits en cours
                      </p>
                      <p className="text-lg font-bold tabular-nums text-[var(--gold)]">
                        {formatAmount(inProgressTotal)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {inProgress.length} bon{inProgress.length > 1 ? "s" : ""} en cours
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-normal text-foreground">
          Flux en cours
        </h2>
        {inFlight.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
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
          <h2 className="text-2xl font-normal text-foreground">
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
              <Card key={a.slug} className="gap-2 rounded-2xl py-5 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-normal text-foreground">
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
                    <span className="text-lg font-medium tabular-nums text-foreground">
                      {incoming}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <PickupStatusChip status="available" />
                    <span className="text-lg font-medium tabular-nums text-foreground">
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
          <h2 className="text-2xl font-normal text-foreground">
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
              <Card key={a.slug} className="gap-2 rounded-2xl py-5 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-normal text-foreground">
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
                    <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
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
          <h2 className="text-2xl font-normal text-foreground">
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
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
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
      <NetworkDocumentsSection docs={data.expiringDocuments} />

      {/* === Observations critiques (réseau) === */}
      <NetworkCriticalObservationsSection
        observations={data.openObservations}
      />

      {/* === Absences en cours (réseau) === */}
      <NetworkCurrentLeavesSection
        leaves={data.currentLeavesNetworkWide}
        employees={data.allEmployees}
      />
    </div>
  );
}

function NetworkDocumentsSection({ docs }: { docs: LegalDocument[] }) {
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
        <h2 className="flex items-center gap-2 text-2xl font-normal text-foreground">
          <FileText className="size-5 text-[var(--gold)]" aria-hidden />
          Documents à surveiller — réseau
        </h2>
        <Badge variant="outline">{sorted.length}</Badge>
      </div>
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
          Tous les documents sont à jour.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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

function NetworkCriticalObservationsSection({
  observations,
}: {
  observations: Observation[];
}) {
  const critical = observations;
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-normal text-foreground">
          <AlertTriangle className="size-5 text-red-600" aria-hidden />
          Observations critiques — réseau
        </h2>
        <Badge variant="outline">{critical.length}</Badge>
      </div>
      {critical.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
          Aucune observation critique ouverte.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {critical.map((o) => {
            const agency = agencyBySlug(o.agencyId);
            return (
              <Card key={o.id} className="rounded-2xl border-red-200 shadow-sm">
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

function NetworkCurrentLeavesSection({
  leaves,
  employees,
}: {
  leaves: Leave[];
  employees: Employee[];
}) {
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const grouped = Object.fromEntries(
    AGENCIES.map((a) => [a.slug, [] as Leave[]])
  ) as Record<AgencySlug, Leave[]>;
  for (const l of leaves) grouped[l.agencyId]?.push(l);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-normal text-foreground">
          <CalendarRange className="size-5 text-[var(--gold)]" aria-hidden />
          Absences en cours — réseau
        </h2>
        <Badge variant="outline">{leaves.length}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {AGENCIES.map((a) => {
          const ls = grouped[a.slug];
          return (
            <Card key={a.slug} className="gap-2 rounded-2xl py-5 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-normal text-foreground">
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
                      const emp = employeeById.get(l.employeeId);
                      return (
                        <li
                          key={l.id}
                          className="rounded-xl border border-border bg-muted/20 p-2"
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
