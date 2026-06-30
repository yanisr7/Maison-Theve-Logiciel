// Couche d'accès Transit — Supabase (Phase 2a).
// Remplace les fonctions in-memory de lib/mock.ts pour le module Transit.
// Mêmes formes de retour (type Transit) ; toutes les fonctions sont async.

import { supabase } from "./supabase";
import { agencyBySlug } from "./mock";
import type { AgencySlug, Transit, TransitEvent } from "./types";

type TransitRow = {
  id: string;
  reference: string;
  from_agency: string;
  to_agency: string;
  transporter: string;
  description: string;
  amount: number;
  status: string;
  created_by: string | null;
  invoice_number: string | null;
  refusal_reason: string | null;
  expected_at: string | null;
  events: TransitEvent[] | null;
  created_at: string;
};

function mapRow(r: TransitRow): Transit {
  return {
    id: r.id,
    reference: r.reference,
    from: r.from_agency as AgencySlug,
    to: r.to_agency as AgencySlug,
    transporter: r.transporter as Transit["transporter"],
    description: r.description,
    amount: r.amount,
    status: r.status as Transit["status"],
    createdAt: r.created_at,
    events: r.events ?? [],
    ...(r.created_by ? { createdBy: r.created_by } : {}),
    ...(r.invoice_number ? { invoiceNumber: r.invoice_number } : {}),
    ...(r.refusal_reason ? { refusalReason: r.refusal_reason } : {}),
    ...(r.expected_at ? { expectedAt: r.expected_at } : {}),
  };
}

export async function getAllTransits(): Promise<Transit[]> {
  const { data, error } = await supabase
    .from("transits")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TransitRow[]).map(mapRow);
}

// Transits concernant une agence (émetteur OU destinataire) — filtré côté base.
export async function getTransitsByAgency(
  agency: AgencySlug
): Promise<Transit[]> {
  const { data, error } = await supabase
    .from("transits")
    .select("*")
    .or(`from_agency.eq.${agency},to_agency.eq.${agency}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TransitRow[]).map(mapRow);
}

// Page de transits (pagination côté base) + filtre statut optionnel.
export async function getTransitsPage(
  page: number,
  pageSize: number,
  status?: Transit["status"]
): Promise<{ rows: Transit[]; total: number }> {
  const from = (page - 1) * pageSize;
  let q = supabase
    .from("transits")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (status) q = q.eq("status", status);
  const { data, count, error } = await q;
  if (error) throw error;
  return { rows: (data as TransitRow[]).map(mapRow), total: count ?? 0 };
}

export async function getTransit(id: string): Promise<Transit | null> {
  const { data, error } = await supabase
    .from("transits")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as TransitRow) : null;
}

export async function getNextReference(): Promise<string> {
  const { data, error } = await supabase
    .from("transits")
    .select("reference")
    .order("reference", { ascending: false })
    .limit(1);
  if (error) throw error;
  const last = (data as { reference: string }[])[0]?.reference;
  const num = last ? parseInt(last.split("-")[2] ?? "0", 10) : 0;
  return `TR-2026-${String(num + 1).padStart(4, "0")}`;
}

export async function createTransit(
  input: Omit<Transit, "id" | "reference" | "status" | "createdAt" | "events">
): Promise<Transit> {
  const reference = await getNextReference();
  const createdAt = new Date().toISOString();
  const fromName = agencyBySlug(input.from).name;
  const events: TransitEvent[] = [
    { date: createdAt, label: "Bon créé", by: fromName },
  ];

  const { data, error } = await supabase
    .from("transits")
    .insert({
      reference,
      from_agency: input.from,
      to_agency: input.to,
      transporter: input.transporter,
      description: input.description,
      amount: input.amount,
      status: "pending",
      created_by: input.createdBy ?? null,
      expected_at: input.expectedAt ?? null,
      events,
      created_at: createdAt,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TransitRow);
}

// Conserve le même contrat que le mock : on applique `fn` au transit courant,
// puis on persiste les champs qui peuvent changer (statut, events, facture, refus).
export async function updateTransit(
  id: string,
  fn: (t: Transit) => Transit
): Promise<Transit | null> {
  const current = await getTransit(id);
  if (!current) return null;
  const updated = fn(current);
  const { data, error } = await supabase
    .from("transits")
    .update({
      status: updated.status,
      events: updated.events,
      invoice_number: updated.invoiceNumber ?? null,
      refusal_reason: updated.refusalReason ?? null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TransitRow);
}
