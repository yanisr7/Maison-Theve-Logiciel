"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AGENCIES, agencyBySlug } from "@/lib/mock";
import {
  getConversations,
  getThread,
  markThreadRead,
  sendMessage,
} from "@/lib/messages-db";
import type {
  ConversationSummary,
  Message,
  ParticipantKey,
} from "@/lib/types";
import { cn, relativeDate, formatDateTime } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send } from "lucide-react";

function truncate(s: string, max = 60): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export default function MessagesPage() {
  const { role, isPietro } = useRole();

  // Clé de la partie courante : "admin" pour Pietro, sinon le slug de l'agence.
  const myKey: ParticipantKey = isPietro
    ? "admin"
    : role.kind === "agency"
      ? role.agencySlug
      : "admin";

  const nameOf = useCallback((key: ParticipantKey): string => {
    return key === "admin" ? "Pietro (Admin)" : agencyBySlug(key).name;
  }, []);

  // Parties contactables = admin + toutes les agences, sauf moi-même.
  const contactables = useMemo<ParticipantKey[]>(() => {
    const all: ParticipantKey[] = ["admin", ...AGENCIES.map((a) => a.slug)];
    return all.filter((k) => k !== myKey);
  }, [myKey]);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const [selected, setSelected] = useState<ParticipantKey | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await getConversations(myKey);
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, [myKey]);

  const loadThread = useCallback(
    async (otherKey: ParticipantKey) => {
      setLoadingThread(true);
      try {
        const data = await getThread(myKey, otherKey);
        setThread(data);
        await markThreadRead(myKey, otherKey);
      } catch {
        setThread([]);
      } finally {
        setLoadingThread(false);
      }
      // Recharge la liste pour vider le badge non-lus.
      void loadConversations();
    },
    [myKey, loadConversations]
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const openConversation = useCallback(
    (otherKey: ParticipantKey) => {
      setSelected(otherKey);
      void loadThread(otherKey);
    },
    [loadThread]
  );

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || !selected || sending) return;
    setSending(true);
    try {
      await sendMessage(myKey, selected, body);
      setDraft("");
      const data = await getThread(myKey, selected);
      setThread(data);
      void loadConversations();
    } catch {
      // erreur silencieuse
    } finally {
      setSending(false);
    }
  }, [draft, selected, sending, myKey, loadConversations]);

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl flex-col gap-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Messagerie</h1>
        <p className="text-sm text-muted-foreground">
          Échangez en direct avec Pietro et les agences.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
        {/* Colonne gauche — Conversations */}
        <aside className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border bg-card p-4 md:w-80">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Conversations
          </h2>

          <Select
            value=""
            onValueChange={(v) => openConversation(v as ParticipantKey)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Nouvelle conversation…" />
            </SelectTrigger>
            <SelectContent>
              {contactables.map((key) => (
                <SelectItem key={key} value={key}>
                  {nameOf(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {loadingConvs ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                Chargement…
              </p>
            ) : conversations.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                Aucune conversation pour l’instant.
              </p>
            ) : (
              conversations.map((c) => {
                const active = c.otherKey === selected;
                return (
                  <button
                    key={c.otherKey}
                    type="button"
                    onClick={() => openConversation(c.otherKey)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors",
                      active
                        ? "bg-[var(--gold)]/10 ring-1 ring-[var(--gold)]/40"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {nameOf(c.otherKey)}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {relativeDate(c.lastAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {truncate(c.lastBody)}
                      </span>
                      {c.unread > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Colonne droite — Fil */}
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-card">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-40" />
              <p className="text-sm">
                Sélectionnez ou démarrez une conversation
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-2 border-b px-5 py-3">
                <span className="font-semibold">{nameOf(selected)}</span>
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                {loadingThread ? (
                  <p className="text-sm text-muted-foreground">Chargement…</p>
                ) : thread.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun message. Écrivez le premier !
                  </p>
                ) : (
                  thread.map((m) => {
                    const mine = m.fromKey === myKey;
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex flex-col",
                          mine ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words",
                            mine
                              ? "bg-[var(--gold)] text-white"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {m.body}
                        </div>
                        <span className="mt-1 text-[11px] text-muted-foreground">
                          {formatDateTime(m.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-end gap-2 border-t p-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Écrivez un message… (Entrée pour envoyer, Maj+Entrée pour un retour à la ligne)"
                  className="min-h-[44px] flex-1 resize-none"
                  rows={1}
                />
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={sending || draft.trim().length === 0}
                  className="bg-[var(--gold)] text-white hover:bg-[var(--gold)]/90"
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
