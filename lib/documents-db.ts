// Couche d'accès Documents légaux — Supabase (Phase 2c).
import { supabase } from "./supabase";
import { DOCUMENT_CATEGORY_SECTION } from "./mock";
import type {
  AgencySlug,
  DocumentCategory,
  DocumentSection,
  DocumentStatus,
  LegalDocument,
} from "./types";

type DocRow = {
  id: string;
  agency_id: string;
  name: string;
  category: string;
  file_name: string | null;
  uploaded_at: string | null;
  expires_at: string | null;
  status: string;
};

function mapRow(r: DocRow): LegalDocument {
  return {
    id: r.id,
    agencyId: r.agency_id as AgencySlug,
    name: r.name,
    category: r.category as DocumentCategory,
    status: r.status as DocumentStatus,
    ...(r.file_name ? { fileName: r.file_name } : {}),
    ...(r.uploaded_at ? { uploadedAt: r.uploaded_at } : {}),
    ...(r.expires_at ? { expiresAt: r.expires_at } : {}),
  };
}

export async function getAllDocuments(): Promise<LegalDocument[]> {
  const { data, error } = await supabase.from("legal_documents").select("*");
  if (error) throw error;
  return (data as DocRow[]).map(mapRow);
}

export async function getDocumentsByAgency(
  agencyId: AgencySlug
): Promise<LegalDocument[]> {
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("agency_id", agencyId);
  if (error) throw error;
  return (data as DocRow[]).map(mapRow);
}

export async function getDocumentsBySection(
  agencyId: AgencySlug,
  section: DocumentSection
): Promise<LegalDocument[]> {
  const docs = await getDocumentsByAgency(agencyId);
  return docs.filter((d) => DOCUMENT_CATEGORY_SECTION[d.category] === section);
}

export async function getDocument(id: string): Promise<LegalDocument | null> {
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as DocRow) : null;
}

export async function getExpiringDocuments(): Promise<LegalDocument[]> {
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .neq("status", "up_to_date");
  if (error) throw error;
  return (data as DocRow[]).map(mapRow);
}

export async function addDocument(
  input: Omit<LegalDocument, "id">
): Promise<LegalDocument> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `doc-${crypto.randomUUID()}`
      : `doc-${Date.now()}`;
  const { data, error } = await supabase
    .from("legal_documents")
    .insert({
      id,
      agency_id: input.agencyId,
      name: input.name,
      category: input.category,
      file_name: input.fileName ?? null,
      uploaded_at: input.uploadedAt ?? null,
      expires_at: input.expiresAt ?? null,
      status: input.status,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as DocRow);
}

export async function replaceDocument(
  id: string,
  input: { fileName: string; uploadedAt?: string; expiresAt?: string }
): Promise<LegalDocument | null> {
  const now = new Date().toISOString();
  let status: DocumentStatus = "up_to_date";
  if (input.expiresAt) {
    const days =
      (new Date(input.expiresAt).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    if (days < 0) status = "expired";
    else if (days < 30) status = "expiring_soon";
  }
  const { data, error } = await supabase
    .from("legal_documents")
    .update({
      file_name: input.fileName,
      uploaded_at: input.uploadedAt ?? now,
      ...(input.expiresAt ? { expires_at: input.expiresAt } : {}),
      status,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data ? mapRow(data as DocRow) : null;
}
