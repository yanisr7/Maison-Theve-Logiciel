// Couche d'accès Bien confié (pickups) — Supabase (Phase 2c).
import { supabase } from "./supabase";
import type { AgencySlug, PaymentMethod, Pickup, PickupStatus } from "./types";

type PickupRow = {
  id: string;
  paris_order_ref: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  description: string;
  payment_method: string;
  destination_agency: string;
  transporter: string;
  status: string;
  created_at: string;
};

function mapRow(r: PickupRow): Pickup {
  return {
    id: r.id,
    parisOrderRef: r.paris_order_ref ?? "",
    clientName: r.client_name,
    clientEmail: r.client_email,
    clientPhone: r.client_phone,
    description: r.description,
    paymentMethod: r.payment_method as PaymentMethod,
    destinationAgencyId: r.destination_agency as AgencySlug,
    transporter: r.transporter as Pickup["transporter"],
    status: r.status as PickupStatus,
    createdAt: r.created_at,
  };
}

export async function getAllPickups(): Promise<Pickup[]> {
  const { data, error } = await supabase
    .from("pickups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as PickupRow[]).map(mapRow);
}

// Biens confiés destinés à une agence — filtré côté base.
export async function getPickupsByAgency(
  agency: AgencySlug
): Promise<Pickup[]> {
  const { data, error } = await supabase
    .from("pickups")
    .select("*")
    .eq("destination_agency", agency)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as PickupRow[]).map(mapRow);
}

// Page de biens confiés (pagination côté base) + filtre statut optionnel.
export async function getPickupsPage(
  page: number,
  pageSize: number,
  status?: PickupStatus
): Promise<{ rows: Pickup[]; total: number }> {
  const from = (page - 1) * pageSize;
  let q = supabase
    .from("pickups")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (status) q = q.eq("status", status);
  const { data, count, error } = await q;
  if (error) throw error;
  return { rows: (data as PickupRow[]).map(mapRow), total: count ?? 0 };
}

export async function getPickup(id: string): Promise<Pickup | null> {
  const { data, error } = await supabase
    .from("pickups")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as PickupRow) : null;
}

export async function updatePickupStatus(
  id: string,
  status: PickupStatus
): Promise<Pickup | null> {
  const { data, error } = await supabase
    .from("pickups")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as PickupRow);
}
