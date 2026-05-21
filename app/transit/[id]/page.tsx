"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { agencyBySlug, getTransit, updateTransit } from "@/lib/mock";
import { useRole } from "@/lib/role-context";
import { StatusChip } from "@/components/StatusChip";
import { ActionButton } from "@/components/ActionButton";
import { useToast } from "@/components/ToastProvider";
import { formatDateTime } from "@/lib/utils";
import type { Transit } from "@/lib/types";

export default function TransitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { push } = useToast();
  const { role, roleLabel, isPietro } = useRole();

  const initial = getTransit(id);
  // On garde un state local pour refléter les mutations en mémoire sans re-mount
  const [transit, setTransit] = useState<Transit | undefined>(initial);

  useEffect(() => {
    setTransit(getTransit(id));
  }, [id]);

  if (!transit) return notFound();

  const fromAgency = agencyBySlug(transit.from);
  const toAgency = agencyBySlug(transit.to);

  // Capacités selon rôle
  const isSender = role.kind === "agency" && role.agencySlug === transit.from;
  const isRecipient = role.kind === "agency" && role.agencySlug === transit.to;

  function mutate(fn: (t: Transit) => Transit, toastText: string) {
    const updated = updateTransit(transit!.id, fn);
    if (updated) {
      setTransit({ ...updated });
      push(toastText, "success");
    }
  }

  function actorLabel(): string {
    if (role.kind === "admin") return "Pietro";
    return agencyBySlug(role.agencySlug).name;
  }

  // --- ACTIONS ---
  function validate() {
    mutate(
      (t) => ({
        ...t,
        status: "validated",
        events: [
          ...t.events,
          { date: new Date().toISOString(), label: "Validé par destinataire", by: actorLabel() },
        ],
      }),
      "Bon validé"
    );
  }

  function refuse() {
    const reason = window.prompt("Motif du refus ?", "Descriptif insuffisant");
    if (!reason) return;
    mutate(
      (t) => ({
        ...t,
        status: "refused",
        refusalReason: reason,
        events: [
          ...t.events,
          { date: new Date().toISOString(), label: `Refusé : ${reason}`, by: actorLabel() },
        ],
      }),
      "Bon refusé"
    );
  }

  function ship() {
    mutate(
      (t) => ({
        ...t,
        status: "in_transit",
        events: [
          ...t.events,
          { date: new Date().toISOString(), label: "Expédié", by: actorLabel() },
        ],
      }),
      "Expédition enregistrée"
    );
  }

  function receive() {
    mutate(
      (t) => ({
        ...t,
        status: "received",
        events: [
          ...t.events,
          { date: new Date().toISOString(), label: "Réceptionné", by: actorLabel() },
        ],
      }),
      "Réception confirmée"
    );
  }

  function declarePaid() {
    const inv = window.prompt(
      "Numéro de facture (obligatoire — doit figurer sur la facture) ?",
      "FA-2026-"
    );
    if (!inv || inv.trim().length < 4) {
      push("Numéro de facture invalide", "error");
      return;
    }
    mutate(
      (t) => ({
        ...t,
        status: "paid_unverified",
        invoiceNumber: inv.trim(),
        events: [
          ...t.events,
          {
            date: new Date().toISOString(),
            label: `Facturé + Payé déclaré (${inv.trim()})`,
            by: actorLabel(),
          },
        ],
      }),
      "Paiement déclaré — en attente de vérification Pietro"
    );
  }

  function pietroVerify() {
    mutate(
      (t) => ({
        ...t,
        status: "closed",
        events: [
          ...t.events,
          {
            date: new Date().toISOString(),
            label: "Virement vérifié — clôturé",
            by: "Pietro",
          },
        ],
      }),
      "Virement vérifié, bon clôturé"
    );
  }

  // --- Affichage actions selon règles métier ---
  const showValidate =
    (isRecipient || isPietro) && transit.status === "pending";
  const showRefuse = (isRecipient || isPietro) && transit.status === "pending";
  // L'expédition n'est possible QU'APRÈS validation
  const showShip =
    (isSender || isPietro) && transit.status === "validated";
  const showReceive =
    (isRecipient || isPietro) && transit.status === "in_transit";
  const showDeclarePaid =
    (isRecipient || isPietro) && transit.status === "received";
  const showPietroVerify = isPietro && transit.status === "paid_unverified";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/transit" className="text-sm text-cream-dim hover:text-gold">
          ← Tous les transits
        </Link>
        <span className="text-xs text-cream-dim">
          Connecté en <span className="text-gold">{roleLabel}</span>
        </span>
      </div>

      <header className="rounded-xl border border-cream-faint bg-dark2 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">Bon de transit</p>
            <h1 className="mt-1 font-serif text-4xl text-cream">{transit.reference}</h1>
            <p className="mt-2 text-cream-dim">
              <span className="text-cream">{fromAgency.name}</span>
              <span className="mx-2">→</span>
              <span className="text-cream">{toAgency.name}</span>
              <span className="mx-2">·</span>
              {transit.transporter}
              <span className="mx-2">·</span>
              Créé le {formatDateTime(transit.createdAt)}
            </p>
          </div>
          <StatusChip status={transit.status} />
        </div>

        {transit.invoiceNumber && (
          <p className="mt-4 text-sm text-cream">
            Facture&nbsp;: <span className="text-gold">{transit.invoiceNumber}</span>
          </p>
        )}
        {transit.refusalReason && (
          <p className="mt-4 rounded-md border border-[#4a2424] bg-[#341a1a] p-3 text-sm text-[#f0c4c4]">
            Motif de refus&nbsp;: {transit.refusalReason}
          </p>
        )}
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-cream-faint bg-dark2 p-6">
            <h2 className="mb-3 font-serif text-xl text-cream">Descriptif</h2>
            <p className="whitespace-pre-line text-sm text-cream">{transit.description}</p>
          </div>

          <div className="rounded-xl border border-cream-faint bg-dark2 p-6">
            <h2 className="mb-4 font-serif text-xl text-cream">Historique</h2>
            <ol className="space-y-3">
              {transit.events.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-gold"
                    aria-hidden
                  />
                  <div className="flex-1 border-b border-cream-faint pb-3 last:border-b-0">
                    <p className="text-sm text-cream">{e.label}</p>
                    <p className="mt-0.5 text-xs text-cream-dim">
                      {formatDateTime(e.date)} · {e.by}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-cream-faint bg-dark2 p-6">
            <h3 className="mb-3 font-serif text-lg text-cream">Actions</h3>

            {!showValidate &&
            !showRefuse &&
            !showShip &&
            !showReceive &&
            !showDeclarePaid &&
            !showPietroVerify ? (
              <p className="text-sm text-cream-dim">
                Aucune action disponible pour votre rôle au statut actuel.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {showValidate && (
                  <ActionButton onClick={validate}>Valider le bon</ActionButton>
                )}
                {showRefuse && (
                  <ActionButton variant="danger" onClick={refuse}>
                    Refuser
                  </ActionButton>
                )}
                {showShip && (
                  <ActionButton onClick={ship}>Marquer comme expédié</ActionButton>
                )}
                {showReceive && (
                  <ActionButton onClick={receive}>Confirmer réception</ActionButton>
                )}
                {showDeclarePaid && (
                  <ActionButton variant="primary" onClick={declarePaid}>
                    Facturé + Payé
                  </ActionButton>
                )}
                {showPietroVerify && (
                  <ActionButton onClick={pietroVerify}>
                    Vérifier virement &amp; clôturer
                  </ActionButton>
                )}
              </div>
            )}

            <div className="mt-4 border-t border-cream-faint pt-3 text-xs text-cream-dim">
              {transit.status === "pending" && "En attente de validation du destinataire."}
              {transit.status === "validated" &&
                "Validé — l'agence émettrice peut maintenant expédier."}
              {transit.status === "in_transit" &&
                "Colis en route — réception à confirmer."}
              {transit.status === "received" &&
                "Reçu — destinataire doit déclarer paiement avec n° de facture."}
              {transit.status === "paid_unverified" &&
                "En attente de vérification bancaire par Pietro."}
              {transit.status === "closed" && "Bon clôturé."}
              {transit.status === "refused" && "Bon refusé — recréer un nouveau bon si besoin."}
            </div>
          </div>

          <div className="rounded-xl border border-cream-faint bg-dark2 p-6 text-xs text-cream-dim">
            <p className="mb-2 font-medium text-cream">Adresses</p>
            <p>
              <span className="text-cream">Émetteur&nbsp;:</span> {fromAgency.address}
            </p>
            <p className="mt-2">
              <span className="text-cream">Destinataire&nbsp;:</span> {toAgency.address}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
