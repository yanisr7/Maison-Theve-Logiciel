// Couche d'accès RDV (appointments) — Supabase (Phase 2c).
import { supabase } from "./supabase";
import type { AgencySlug, Appointment, AppointmentStatus } from "./types";

type AppointmentRow = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  reason: string;
  agency_id: string;
  scheduled_at: string;
  status: string;
  rescheduled_at: string | null;
};

function mapRow(r: AppointmentRow): Appointment {
  return {
    id: r.id,
    clientName: r.client_name,
    clientEmail: r.client_email,
    clientPhone: r.client_phone,
    reason: r.reason,
    agencyId: r.agency_id as AgencySlug,
    scheduledAt: r.scheduled_at,
    status: r.status as AppointmentStatus,
    ...(r.rescheduled_at ? { rescheduledAt: r.rescheduled_at } : {}),
  };
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data as AppointmentRow[]).map(mapRow);
}

// RDV d'une agence — filtré côté base.
export async function getAppointmentsByAgency(
  agency: AgencySlug
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("agency_id", agency)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data as AppointmentRow[]).map(mapRow);
}

// Page de RDV (pagination côté base) + filtre statut optionnel.
export async function getAppointmentsPage(
  page: number,
  pageSize: number,
  status?: AppointmentStatus
): Promise<{ rows: Appointment[]; total: number }> {
  const from = (page - 1) * pageSize;
  let q = supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .order("scheduled_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (status) q = q.eq("status", status);
  const { data, count, error } = await q;
  if (error) throw error;
  return { rows: (data as AppointmentRow[]).map(mapRow), total: count ?? 0 };
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as AppointmentRow) : null;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  rescheduledAt?: string
): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from("appointments")
    .update({
      status,
      ...(rescheduledAt ? { rescheduled_at: rescheduledAt } : {}),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as AppointmentRow);
}
