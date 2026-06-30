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
