// Couche d'accès Cas de figure — Supabase (Phase 2c).
import { supabase } from "./supabase";
import type { AgencySlug, CasDeFigure, CasSeverity, CasType } from "./types";

type CasRow = {
  id: string;
  agency_id: string;
  type: string;
  title: string;
  description: string;
  author_name: string;
  created_at: string;
  severity: string;
};

function mapRow(r: CasRow): CasDeFigure {
  return {
    id: r.id,
    agencyId: r.agency_id as AgencySlug,
    type: r.type as CasType,
    title: r.title,
    description: r.description,
    authorName: r.author_name,
    createdAt: r.created_at,
    severity: r.severity as CasSeverity,
  };
}

export async function getAllCasDeFigure(): Promise<CasDeFigure[]> {
  const { data, error } = await supabase
    .from("cas_de_figure")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CasRow[]).map(mapRow);
}

export async function getCasDeFigureByAgency(
  agencyId: AgencySlug
): Promise<CasDeFigure[]> {
  const { data, error } = await supabase
    .from("cas_de_figure")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CasRow[]).map(mapRow);
}

export async function addCasDeFigure(
  input: Omit<CasDeFigure, "id" | "createdAt">
): Promise<CasDeFigure> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `cas-${crypto.randomUUID()}`
      : `cas-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("cas_de_figure")
    .insert({
      id,
      agency_id: input.agencyId,
      type: input.type,
      title: input.title,
      description: input.description,
      author_name: input.authorName,
      severity: input.severity,
      created_at: createdAt,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as CasRow);
}
