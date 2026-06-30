"use client";

import { useEffect, useMemo, useState } from "react";
import { AGENCIES, APPOINTMENT_STATUS_LABEL } from "@/lib/mock";
import { getAllAppointments } from "@/lib/appointments-db";
import { AppointmentCard } from "@/components/AppointmentCard";
import type {
  AgencySlug,
  Appointment,
  AppointmentStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

const STATUSES: (AppointmentStatus | "all")[] = [
  "all",
  "scheduled",
  "done",
  "cancelled",
  "rescheduled",
];

type DateFilter = "all" | "today" | "week";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isThisWeek(d: Date, ref: Date) {
  const start = new Date(ref);
  start.setHours(0, 0, 0, 0);
  start.setDate(ref.getDate() - ref.getDay()); // dimanche
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}

export default function RdvListPage() {
  const { role } = useRole();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [agencyFilter, setAgencyFilter] = useState<AgencySlug | "all">("all");
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllAppointments()
      .then((data) => {
        if (active) setAllAppointments(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const appointments = useMemo(() => {
    let all = allAppointments;
    if (role.kind === "agency") {
      all = all.filter((a) => a.agencyId === role.agencySlug);
    } else if (agencyFilter !== "all") {
      all = all.filter((a) => a.agencyId === agencyFilter);
    }
    if (statusFilter !== "all") {
      all = all.filter((a) => a.status === statusFilter);
    }
    const now = new Date();
    if (dateFilter === "today") {
      all = all.filter((a) =>
        isSameDay(new Date(a.rescheduledAt ?? a.scheduledAt), now)
      );
    } else if (dateFilter === "week") {
      all = all.filter((a) =>
        isThisWeek(new Date(a.rescheduledAt ?? a.scheduledAt), now)
      );
    }
    return [...all].sort((a, b) => {
      const da = new Date(a.rescheduledAt ?? a.scheduledAt).getTime();
      const db = new Date(b.rescheduledAt ?? b.scheduledAt).getTime();
      return da - db;
    });
  }, [allAppointments, statusFilter, dateFilter, agencyFilter, role]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Module
        </p>
        <h1 className="font-serif text-4xl text-foreground">RDV clients</h1>
        <p className="mt-1 text-muted-foreground">
          {role.kind === "admin"
            ? "Tous les RDV du réseau."
            : "RDV de votre agence."}
        </p>
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                statusFilter === s
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
              )}
            >
              {s === "all" ? "Tous" : APPOINTMENT_STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Date
          </span>
          {(
            [
              { v: "all" as const, label: "Toutes" },
              { v: "today" as const, label: "Aujourd'hui" },
              { v: "week" as const, label: "Cette semaine" },
            ]
          ).map((d) => (
            <button
              key={d.v}
              onClick={() => setDateFilter(d.v)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                dateFilter === d.v
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        {role.kind === "admin" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Agence
            </span>
            <button
              onClick={() => setAgencyFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                agencyFilter === "all"
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
              )}
            >
              Toutes
            </button>
            {AGENCIES.map((a) => (
              <button
                key={a.slug}
                onClick={() => setAgencyFilter(a.slug)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  agencyFilter === a.slug
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
                )}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          Chargement…
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          Aucun RDV correspondant.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
