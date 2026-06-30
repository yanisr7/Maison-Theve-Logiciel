"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { agencyBySlug } from "@/lib/mock";
import {
  getAppointment,
  updateAppointmentStatus,
} from "@/lib/appointments-db";
import { useRole } from "@/lib/role-context";
import { AppointmentStatusChip } from "@/components/AppointmentStatusChip";
import { formatDateTime } from "@/lib/utils";
import type { Appointment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, CalendarClock } from "lucide-react";

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { role, roleLabel, isPietro } = useRole();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const [openReschedule, setOpenReschedule] = useState(false);
  const [newDate, setNewDate] = useState<string>("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAppointment(id)
      .then((data) => {
        if (active) setAppointment(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
        Chargement…
      </div>
    );
  }

  if (!appointment) return notFound();

  const agency = agencyBySlug(appointment.agencyId);

  const isOwnAgency =
    role.kind === "agency" && role.agencySlug === appointment.agencyId;
  const canAct = isOwnAgency || isPietro;

  function refresh(updated: Appointment | null) {
    if (updated) setAppointment({ ...updated });
  }

  async function handleDone() {
    const updated = await updateAppointmentStatus(appointment!.id, "done");
    refresh(updated);
    toast.success(
      `📧 Email satisfaction envoyé à ${appointment!.clientEmail}`
    );
  }

  async function handleCancel() {
    const updated = await updateAppointmentStatus(
      appointment!.id,
      "cancelled"
    );
    refresh(updated);
    toast.success("RDV annulé");
  }

  async function handleReschedule() {
    if (!newDate) {
      toast.error("Choisissez une nouvelle date");
      return;
    }
    const iso = new Date(newDate).toISOString();
    const updated = await updateAppointmentStatus(
      appointment!.id,
      "rescheduled",
      iso
    );
    refresh(updated);
    setOpenReschedule(false);
    setNewDate("");
    toast.success(`RDV reporté au ${formatDateTime(iso)}`);
  }

  const showActions = canAct && appointment.status === "scheduled";

  const displayDate =
    appointment.status === "rescheduled" && appointment.rescheduledAt
      ? appointment.rescheduledAt
      : appointment.scheduledAt;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/rdv"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--gold)]"
        >
          <ArrowLeft className="size-4" />
          Tous les RDV
        </Link>
        <span className="text-xs text-muted-foreground">
          Connecté en{" "}
          <span className="font-medium text-[var(--gold)]">{roleLabel}</span>
        </span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                Rendez-vous
              </p>
              <h1 className="mt-1 flex items-center gap-2 font-serif text-4xl text-foreground">
                <CalendarClock className="size-7 text-[var(--gold)]" aria-hidden />
                {formatDateTime(displayDate)}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-muted-foreground">
                <span className="text-foreground">{agency.name}</span>
                {appointment.status === "rescheduled" &&
                  appointment.rescheduledAt && (
                    <>
                      <span className="mx-1">·</span>
                      <span className="italic">
                        Initialement le{" "}
                        {formatDateTime(appointment.scheduledAt)}
                      </span>
                    </>
                  )}
              </p>
            </div>
            <AppointmentStatusChip status={appointment.status} />
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Nom&nbsp;: </span>
                <span className="text-foreground">{appointment.clientName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email&nbsp;: </span>
                <span className="text-foreground">
                  {appointment.clientEmail}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Téléphone&nbsp;: </span>
                <span className="text-foreground">
                  {appointment.clientPhone}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">
                Motif du RDV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-foreground">
                {appointment.reason}
              </p>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showActions ? (
                <div className="flex flex-col gap-2">
                  <Button onClick={handleDone}>Effectué</Button>
                  <Button
                    variant="outline"
                    onClick={() => setOpenReschedule(true)}
                  >
                    Reporter
                  </Button>
                  <Button variant="destructive" onClick={handleCancel}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune action disponible pour votre rôle au statut actuel.
                </p>
              )}

              <Separator />

              <p className="text-xs text-muted-foreground">
                {appointment.status === "scheduled" &&
                  "À venir — clôturer après passage du client."}
                {appointment.status === "done" &&
                  "Effectué — email de satisfaction envoyé."}
                {appointment.status === "cancelled" && "RDV annulé."}
                {appointment.status === "rescheduled" &&
                  "RDV reporté — voir la nouvelle date ci-dessus."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Agence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p className="text-foreground">{agency.name}</p>
              <p>{agency.address}</p>
              <p>Responsable : {agency.manager}</p>
            </CardContent>
          </Card>
        </aside>
      </section>

      <Dialog open={openReschedule} onOpenChange={setOpenReschedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Reporter le RDV
            </DialogTitle>
            <DialogDescription>
              Choisissez la nouvelle date et heure. Le client sera notifié.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newDate">Nouvelle date et heure</Label>
            <Input
              id="newDate"
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReschedule(false)}>
              Annuler
            </Button>
            <Button onClick={handleReschedule}>Confirmer le report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
