// Couche d'accès Avis (reviews) — Supabase (Phase 2c).
import { supabase } from "./supabase";
import type { AgencySlug, Review, ReviewSource } from "./types";

type ReviewRow = {
  id: string;
  client_name: string;
  source: string;
  source_id: string;
  rating: number;
  comment: string;
  created_at: string;
  agency_id: string;
};

function mapRow(r: ReviewRow): Review {
  return {
    id: r.id,
    clientName: r.client_name,
    source: r.source as ReviewSource,
    sourceId: r.source_id,
    rating: r.rating as Review["rating"],
    comment: r.comment,
    createdAt: r.created_at,
    agencyId: r.agency_id as AgencySlug,
  };
}

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(mapRow);
}

// Avis d'une agence — filtré côté base.
export async function getReviewsByAgency(
  agency: AgencySlug
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("agency_id", agency)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(mapRow);
}

export async function addReview(
  input: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `rev-${crypto.randomUUID()}`
      : `rev-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      id,
      client_name: input.clientName,
      source: input.source,
      source_id: input.sourceId,
      rating: input.rating,
      comment: input.comment,
      agency_id: input.agencyId,
      created_at: createdAt,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as ReviewRow);
}
