import Link from "next/link";
import type { Appointment } from "@/lib/types";
import { agencyBySlug } from "@/lib/mock";
import { AppointmentStatusChip } from "./AppointmentStatusChip";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";

export function AppointmentCard({
  appointment,
}: {
  appointment: Appointment;
}) {
  const agency = agencyBySlug(appointment.agencyId);
  const dateShown =
    appointment.status === "rescheduled" && appointment.rescheduledAt
      ? appointment.rescheduledAt
      : appointment.scheduledAt;

  return (
    <Link
      href={`/rdv/${appointment.id}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="gap-3 py-5 transition-all hover:border-[var(--gold)] hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 font-serif text-lg text-[var(--gold)]">
              <CalendarClock className="size-4" aria-hidden />
              {formatDateTime(dateShown)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="text-foreground">{appointment.clientName}</span>
              <span className="mx-1.5">·</span>
              {agency.name}
            </p>
          </div>
          <AppointmentStatusChip status={appointment.status} />
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {appointment.reason}
          </p>
          {appointment.status === "rescheduled" && (
            <p className="text-xs italic text-muted-foreground">
              (Reporté depuis le {formatDateTime(appointment.scheduledAt)})
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
