"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AGENCIES,
  EMPLOYEE_ROLE_LABEL,
  LEAVE_TYPE_LABEL,
  agencyBySlug,
  getEmployeesByAgency,
  getUpcomingLeavesByAgency,
  getEmployee,
  getCurrentLeavesByAgency,
} from "@/lib/mock";
import type { AgencySlug } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { formatDate, yearsSince } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  CalendarRange,
  Crown,
  Mail,
  Phone,
  UserCheck,
} from "lucide-react";

export default function AgencyTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const isValid = AGENCIES.some((a) => a.slug === slug);
  if (!isValid) return notFound();
  const agencySlug = slug as AgencySlug;
  const agency = agencyBySlug(agencySlug);
  const { isPietro, isAgency } = useRole();

  const canView = isPietro || isAgency(agencySlug);
  if (!canView) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-[var(--gold)]" />
              <CardTitle className="font-serif text-2xl">
                Accès restreint
              </CardTitle>
            </div>
            <CardDescription>
              L'équipe de {agency.name} est visible uniquement par l'agence
              concernée ou par Pietro.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const employees = getEmployeesByAgency(agencySlug);
  const manager = employees.find((e) => e.role === "responsable");
  const others = employees.filter((e) => e.role !== "responsable");
  const upcomingLeaves = getUpcomingLeavesByAgency(agencySlug, 14);
  const currentLeaves = getCurrentLeavesByAgency(agencySlug);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <Link
          href={`/agence/${agencySlug}`}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-[var(--gold)]"
        >
          <ArrowLeft className="size-3" /> Retour {agency.name}
        </Link>
        <h1 className="font-serif text-4xl text-foreground">
          Équipe — {agency.name}
        </h1>
        <p className="text-muted-foreground">
          {employees.length} personne{employees.length > 1 ? "s" : ""} sur ce
          site
          {currentLeaves.length > 0 && (
            <>
              {" "}
              ·{" "}
              <span className="font-medium text-[var(--gold)]">
                {currentLeaves.length} absent
                {currentLeaves.length > 1 ? "s" : ""} aujourd'hui
              </span>
            </>
          )}
        </p>
      </header>

      {manager && (
        <section>
          <h2 className="mb-3 font-serif text-2xl text-foreground">
            Responsable
          </h2>
          <Card className="border-[var(--gold)]/40 bg-[var(--gold)]/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-serif text-xl text-foreground">
                  <Crown className="size-5 text-[var(--gold)]" aria-hidden />
                  {manager.firstName} {manager.lastName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ancienneté : {yearsSince(manager.startedAt)}
                </p>
              </div>
              <Badge className="bg-[var(--gold)] text-primary-foreground">
                {EMPLOYEE_ROLE_LABEL[manager.role]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <Mail className="size-4 text-muted-foreground" aria-hidden />
                <a
                  href={`mailto:${manager.email}`}
                  className="hover:text-[var(--gold)] hover:underline"
                >
                  {manager.email}
                </a>
              </p>
              {manager.phone && (
                <p className="flex items-center gap-2 text-foreground">
                  <Phone
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  {manager.phone}
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      <Separator />

      <section>
        <h2 className="mb-3 font-serif text-2xl text-foreground">Cambistes</h2>
        {others.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            Aucun cambiste rattaché.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => (
              <Card key={e.id} className="gap-3 py-5">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-serif text-lg text-foreground">
                      <UserCheck
                        className="size-4 text-[var(--gold)]"
                        aria-hidden
                      />
                      {e.firstName} {e.lastName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ancienneté : {yearsSince(e.startedAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    {EMPLOYEE_ROLE_LABEL[e.role]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-foreground">
                    <Mail
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    <a
                      href={`mailto:${e.email}`}
                      className="truncate hover:text-[var(--gold)] hover:underline"
                    >
                      {e.email}
                    </a>
                  </p>
                  {e.phone && (
                    <p className="flex items-center gap-2 text-foreground">
                      <Phone
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                      {e.phone}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <CalendarRange
            className="size-5 text-[var(--gold)]"
            aria-hidden
          />
          <h2 className="font-serif text-2xl text-foreground">
            Planning & congés
          </h2>
          <span className="text-xs text-muted-foreground">
            (14 prochains jours)
          </span>
        </div>
        {upcomingLeaves.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            Aucun congé planifié.
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {upcomingLeaves.map((l) => {
              const emp = getEmployee(l.employeeId);
              const empName = emp
                ? `${emp.firstName} ${emp.lastName}`
                : "Employé inconnu";
              const now = Date.now();
              const start = new Date(l.startsAt).getTime();
              const end = new Date(l.endsAt).getTime();
              const inProgress = start <= now && end >= now;
              return (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {empName}
                      {inProgress && (
                        <Badge className="ml-2 bg-[var(--gold)] text-primary-foreground">
                          En cours
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(l.startsAt)} → {formatDate(l.endsAt)}
                      {l.reason && <> · {l.reason}</>}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    {LEAVE_TYPE_LABEL[l.type]}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
