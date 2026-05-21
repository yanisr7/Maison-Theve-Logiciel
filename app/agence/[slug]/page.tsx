"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AGENCIES,
  agencyBySlug,
  getAllTransits,
  getAllPickups,
  getAllAppointments,
  getAllReviews,
  getDocumentsByAgency,
  getEmployeesByAgency,
  getCurrentLeavesByAgency,
  getObservationsByAgency,
} from "@/lib/mock";
import { TransitCard } from "@/components/TransitCard";
import { PickupCard } from "@/components/PickupCard";
import { AppointmentCard } from "@/components/AppointmentCard";
import { ReviewCard } from "@/components/ReviewCard";
import { DocumentStatusChip } from "@/components/DocumentStatusChip";
import {
  ObservationPriorityChip,
  ObservationStatusChip,
} from "@/components/ObservationChips";
import type { AgencySlug } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { relativeDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";

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

  // === Modules Phase 1 enrichis ===
  const docs = getDocumentsByAgency(agencySlug);
  const docsOk = docs.filter((d) => d.status === "up_to_date").length;
  const docsAlert = docs.filter(
    (d) => d.status === "expired" || d.status === "missing"
  ).length;
  const docsAttention = docs.filter((d) => d.status !== "up_to_date").length;

  const employees = getEmployeesByAgency(agencySlug);
  const currentLeaves = getCurrentLeavesByAgency(agencySlug);

  const observations = getObservationsByAgency(agencySlug);
  const openObservations = observations.filter((o) => o.status === "open");
  const hasHighPriorityObs = openObservations.some(
    (o) => o.priority === "high"
  );
  const previewObservations = openObservations
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 2);

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

      {/* === Documents légaux === */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <FileText className="size-5 text-[var(--gold)]" aria-hidden />
            Documents légaux
            {docsAlert > 0 && (
              <Badge className="ml-2 bg-red-600 text-white">
                <AlertTriangle className="size-3" /> {docsAlert} à régulariser
              </Badge>
            )}
          </h2>
          <Link
            href={`/agence/${agencySlug}/documents`}
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{docsOk}</span>{" "}
              document{docsOk > 1 ? "s" : ""} à jour
              {docsAttention > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-medium text-[var(--gold)]">
                    {docsAttention}
                  </span>{" "}
                  attention requise
                </>
              )}
            </p>
            {docs
              .filter((d) => d.status !== "up_to_date")
              .slice(0, 3)
              .map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 p-3"
                >
                  <p className="text-sm text-foreground">{d.name}</p>
                  <DocumentStatusChip status={d.status} />
                </div>
              ))}
            <Link
              href={`/agence/${agencySlug}/documents`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--gold)] hover:underline"
            >
              Gérer les documents <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* === Équipe === */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <Users className="size-5 text-[var(--gold)]" aria-hidden />
            Équipe
            {currentLeaves.length > 0 && (
              <Badge className="ml-2 bg-[var(--gold)] text-primary-foreground">
                <CalendarRange className="size-3" /> {currentLeaves.length}{" "}
                absent{currentLeaves.length > 1 ? "s" : ""} aujourd'hui
              </Badge>
            )}
          </h2>
          <Link
            href={`/agence/${agencySlug}/equipe`}
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {employees.length}
              </span>{" "}
              employé{employees.length > 1 ? "s" : ""} actif
              {employees.length > 1 ? "s" : ""}
              {(() => {
                const mgr = employees.find((e) => e.role === "responsable");
                return mgr ? (
                  <>
                    {" "}
                    · Responsable :{" "}
                    <span className="text-foreground">
                      {mgr.firstName} {mgr.lastName}
                    </span>
                  </>
                ) : null;
              })()}
            </p>
            <Link
              href={`/agence/${agencySlug}/equipe`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--gold)] hover:underline"
            >
              Gérer l'équipe & le planning <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* === Observations === */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <ClipboardList
              className="size-5 text-[var(--gold)]"
              aria-hidden
            />
            Observations
            {openObservations.length > 0 && (
              <Badge className="ml-2 bg-[var(--gold)] text-primary-foreground">
                {openObservations.length} ouverte
                {openObservations.length > 1 ? "s" : ""}
              </Badge>
            )}
            {hasHighPriorityObs && (
              <Badge className="bg-red-600 text-white">
                <AlertTriangle className="size-3" /> priorité haute
              </Badge>
            )}
          </h2>
          <Link
            href={`/agence/${agencySlug}/observations`}
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        {previewObservations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Aucune observation ouverte pour cette agence.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {previewObservations.map((o) => (
              <Card key={o.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ObservationStatusChip status={o.status} />
                    <ObservationPriorityChip priority={o.priority} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {relativeDate(o.createdAt)}
                  </span>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="line-clamp-3 text-foreground">{o.text}</p>
                  <p className="text-xs text-muted-foreground">
                    Par{" "}
                    <span className="font-medium text-foreground">
                      {o.authorName}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
