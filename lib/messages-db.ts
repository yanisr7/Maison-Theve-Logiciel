// Couche d'accès Messagerie interne (1-à-1) — Supabase.
import { supabase } from "./supabase";
import type {
  ConversationSummary,
  Message,
  ParticipantKey,
} from "./types";

type MessageRow = {
  id: string;
  from_key: string;
  to_key: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

function mapRow(r: MessageRow): Message {
  return {
    id: r.id,
    fromKey: r.from_key as ParticipantKey,
    toKey: r.to_key as ParticipantKey,
    body: r.body,
    createdAt: r.created_at,
    readAt: r.read_at,
  };
}

// Fil de discussion entre deux parties (ordre chronologique).
export async function getThread(
  a: ParticipantKey,
  b: ParticipantKey
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(from_key.eq.${a},to_key.eq.${b}),and(from_key.eq.${b},to_key.eq.${a})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as MessageRow[]).map(mapRow);
}

// Liste des conversations de `myKey` (un résumé par interlocuteur).
export async function getConversations(
  myKey: ParticipantKey
): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`from_key.eq.${myKey},to_key.eq.${myKey}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data as MessageRow[]).map(mapRow);

  const byOther = new Map<ParticipantKey, ConversationSummary>();
  for (const m of rows) {
    const other = m.fromKey === myKey ? m.toKey : m.fromKey;
    const existing = byOther.get(other);
    const isUnreadForMe = m.toKey === myKey && m.readAt === null;
    if (!existing) {
      byOther.set(other, {
        otherKey: other,
        lastBody: m.body,
        lastAt: m.createdAt,
        unread: isUnreadForMe ? 1 : 0,
      });
    } else if (isUnreadForMe) {
      existing.unread += 1;
    }
  }
  // rows déjà triés desc → le premier vu par interlocuteur est le plus récent
  return [...byOther.values()].sort((x, y) =>
    x.lastAt < y.lastAt ? 1 : -1
  );
}

export async function sendMessage(
  fromKey: ParticipantKey,
  toKey: ParticipantKey,
  body: string
): Promise<Message> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `msg-${crypto.randomUUID()}`
      : `msg-${Date.now()}`;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      id,
      from_key: fromKey,
      to_key: toKey,
      body,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as MessageRow);
}

// Marque comme lus les messages reçus de `otherKey` par `myKey`.
export async function markThreadRead(
  myKey: ParticipantKey,
  otherKey: ParticipantKey
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("to_key", myKey)
    .eq("from_key", otherKey)
    .is("read_at", null);
  if (error) throw error;
}

// Nombre total de messages non lus reçus par `myKey` (badge sidebar).
export async function getUnreadCount(myKey: ParticipantKey): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("to_key", myKey)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}
