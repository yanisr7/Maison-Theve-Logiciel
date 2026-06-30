// Couche d'accès Observations — Supabase (Phase 2c).
import { supabase } from "./supabase";
import type {
  AgencySlug,
  Observation,
  ObservationPriority,
  ObservationStatus,
} from "./types";

type ObsRow = {
  id: string;
  agency_id: string;
  text: string;
  author_name: string;
  created_at: string;
  resolved_at: string | null;
  status: string;
  priority: string;
};

const PRIORITY_RANK: Record<ObservationPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
};

function mapRow(r: ObsRow): Observation {
  return {
    id: r.id,
    agencyId: r.agency_id as AgencySlug,
    text: r.text,
    authorName: r.author_name,
    createdAt: r.created_at,
    status: r.status as ObservationStatus,
    priority: r.priority as ObservationPriority,
    ...(r.resolved_at ? { resolvedAt: r.resolved_at } : {}),
  };
}

export async function getAllObservations(): Promise<Observation[]> {
  const { data, error } = await supabase.from("observations").select("*");
  if (error) throw error;
  return (data as ObsRow[]).map(mapRow);
}

// Filtré côté base (index agency_id, status).
export async function getObservationsByAgency(
  agencyId: AgencySlug
): Promise<Observation[]> {
  const { data, error } = await supabase
    .from("observations")
    .select("*")
    .eq("agency_id", agencyId);
  if (error) throw error;
  return (data as ObsRow[]).map(mapRow);
}

export async function getOpenObservationsByAgency(
  agencyId: AgencySlug
): Promise<Observation[]> {
  const { data, error } = await supabase
    .from("observations")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("status", "open");
  if (error) throw error;
  return (data as ObsRow[]).map(mapRow);
}

export async function getAllOpenObservations(
  priorityMin?: ObservationPriority
): Promise<Observation[]> {
  const min = priorityMin ? PRIORITY_RANK[priorityMin] : 0;
  // Statut filtré côté base ; tri par priorité en JS (rang non lexicographique).
  const { data, error } = await supabase
    .from("observations")
    .select("*")
    .eq("status", "open");
  if (error) throw error;
  return (data as ObsRow[])
    .map(mapRow)
    .filter((o) => PRIORITY_RANK[o.priority] >= min)
    .sort(
      (a, b) =>
        PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
        (a.createdAt < b.createdAt ? 1 : -1)
    );
}

export async function addObservation(
  agencyId: AgencySlug,
  text: string,
  authorName: string,
  priority: ObservationPriority
): Promise<string> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `obs-${crypto.randomUUID()}`
      : `obs-${Date.now()}`;
  const { error } = await supabase.from("observations").insert({
    id,
    agency_id: agencyId,
    text,
    author_name: authorName,
    priority,
    status: "open",
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
  return id;
}

export async function resolveObservation(
  id: string
): Promise<Observation | null> {
  const { data, error } = await supabase
    .from("observations")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data ? mapRow(data as ObsRow) : null;
}
