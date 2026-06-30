// Couche d'accès Propositions d'amélioration — Supabase.
import { supabase } from "./supabase";
import type { AgencySlug, Proposal, ProposalStatus } from "./types";

type ProposalRow = {
  id: string;
  title: string;
  description: string;
  author_name: string;
  author_role: string;
  agency_slug: string | null;
  status: string;
  created_at: string;
};

function mapRow(r: ProposalRow): Proposal {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    authorName: r.author_name,
    authorRole: r.author_role as Proposal["authorRole"],
    agencySlug: (r.agency_slug as AgencySlug) ?? null,
    status: r.status as ProposalStatus,
    createdAt: r.created_at,
  };
}

export async function getAllProposals(): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from("improvement_proposals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProposalRow[]).map(mapRow);
}

export async function getProposalsByAgency(
  agencyId: AgencySlug
): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from("improvement_proposals")
    .select("*")
    .eq("agency_slug", agencyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProposalRow[]).map(mapRow);
}

export async function addProposal(
  input: Omit<Proposal, "id" | "createdAt" | "status">
): Promise<Proposal> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `prop-${crypto.randomUUID()}`
      : `prop-${Date.now()}`;
  const { data, error } = await supabase
    .from("improvement_proposals")
    .insert({
      id,
      title: input.title,
      description: input.description,
      author_name: input.authorName,
      author_role: input.authorRole,
      agency_slug: input.agencySlug,
      status: "new",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as ProposalRow);
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus
): Promise<Proposal | null> {
  const { data, error } = await supabase
    .from("improvement_proposals")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data ? mapRow(data as ProposalRow) : null;
}
