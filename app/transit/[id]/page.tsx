"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { agencyBySlug } from "@/lib/mock";
import { getTransit, updateTransit } from "@/lib/transits-db";
import { useRole } from "@/lib/role-context";
import { StatusChip } from "@/components/StatusChip";
import { formatAmount, formatDateTime } from "@/lib/utils";
import type { Transit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function TransitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { role, roleLabel, isPietro } = useRole();

  const [transit, setTransit] = useState<Transit | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getTransit(id)
      .then((t) => {
        if (!active) return;
        setTransit(t ?? undefined);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
        Chargement…
      </div>
    );
  }

  if (!transit) return notFound();

  const fromAgency = agencyBySlug(transit.from);
  const toAgency = agencyBySlug(transit.to);

  const isSender = role.kind === "agency" && role.agencySlug === transit.from;
  const isRecipient = role.kind === "agency" && role.agencySlug === transit.to;

  async function mutate(fn: (t: Transit) => Transit, toastText: string) {
    const updated = await updateTransit(transit!.id, fn);
    if (updated) {
      setTransit({ ...updated });
      toast.success(toastText);
    }
  }

  function actorLabel(): string {
    if (role.kind === "admin") return "Pietro";
    return agencyBySlug(role.agencySlug).name;
  }

  function validate() {
    mutate(
      (t) => ({
        ...t,
        status: "validated",
        events: [
          ...t.events,
          {
            date: new Date().toISOString(),
            label: "Validé par destinataire",
            by: actorLabel(),
          },
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
          {
            date: new Date().toISOString(),
            label: `Refusé : ${reason}`,
            by: actorLabel(),
          },
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
          {
            date: new Date().toISOString(),
            label: "Expédié",
            by: actorLabel(),
          },
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
          {
            date: new Date().toISOString(),
            label: "Réceptionné",
            by: actorLabel(),
          },
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
      toast.error("Numéro de facture invalide");
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

  const showValidate = (isRecipient || isPietro) && transit.status === "pending";
  const showRefuse = (isRecipient || isPietro) && transit.status === "pending";
  const showShip = (isSender || isPietro) && transit.status === "validated";
  const showReceive =
    (isRecipient || isPietro) && transit.status === "in_transit";
  const showDeclarePaid =
    (isRecipient || isPietro) && transit.status === "received";
  const showPietroVerify = isPietro && transit.status === "paid_unverified";

  const noAction =
    !showValidate &&
    !showRefuse &&
    !showShip &&
    !showReceive &&
    !showDeclarePaid &&
    !showPietroVerify;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/transit"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--gold)]"
        >
          <ArrowLeft className="size-4" />
          Tous les transits
        </Link>
        <span className="text-xs text-muted-foreground">
          Connecté en{" "}
          <span className="font-medium text-[var(--gold)]">{roleLabel}</span>
        </span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                Bon de transit
              </p>
              <h1 className="mt-1 font-serif text-4xl text-foreground">
                {transit.reference}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-muted-foreground">
                <span className="text-foreground">{fromAgency.name}</span>
                <ArrowRight className="size-3.5" aria-hidden />
                <span className="text-foreground">{toAgency.name}</span>
                <span className="mx-1">·</span>
                {transit.transporter}
                <span className="mx-1">·</span>
                Créé le {formatDateTime(transit.createdAt)}
                {transit.createdBy && (
                  <>
                    <span className="mx-1">·</span>
                    Émis par{" "}
                    <span className="text-foreground">{transit.createdBy}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusChip status={transit.status} />
              <p className="font-serif text-3xl text-[var(--gold)]">
                {formatAmount(transit.amount)}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Montant facturé
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {transit.invoiceNumber && (
            <p className="text-sm">
              Facture&nbsp;:{" "}
              <span className="font-medium text-[var(--gold)]">
                {transit.invoiceNumber}
              </span>
            </p>
          )}
          {transit.refusalReason && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-medium">Motif de refus&nbsp;: </span>
              {transit.refusalReason}
            </div>
          )}
          {transit.status === "paid_unverified" && isPietro && (
            <div className="rounded-md border border-[var(--gold)] bg-[var(--gold)]/10 px-4 py-3 text-sm text-foreground">
              <p className="font-medium">Vérification bancaire</p>
              <p className="mt-1 text-muted-foreground">
                Contrôler sur le relevé bancaire&nbsp;: montant attendu ={" "}
                <span className="font-serif text-base text-[var(--gold)]">
                  {formatAmount(transit.amount)}
                </span>
                {transit.invoiceNumber && (
                  <>
                    {" "}
                    · réf. facture{" "}
                    <span className="font-medium text-foreground">
                      {transit.invoiceNumber}
                    </span>
                  </>
                )}
                .
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Descriptif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-foreground">
                {transit.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {transit.events.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--gold)]"
                      aria-hidden
                    />
                    <div className="flex-1 border-b border-border pb-3 last:border-b-0">
                      <p className="text-sm text-foreground">{e.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(e.date)} · {e.by}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {noAction ? (
                <p className="text-sm text-muted-foreground">
                  Aucune action disponible pour votre rôle au statut actuel.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {showValidate && (
                    <Button onClick={validate}>Valider le bon</Button>
                  )}
                  {showRefuse && (
                    <Button variant="destructive" onClick={refuse}>
                      Refuser
                    </Button>
                  )}
                  {showShip && (
                    <Button onClick={ship}>Marquer comme expédié</Button>
                  )}
                  {showReceive && (
                    <Button onClick={receive}>Confirmer réception</Button>
                  )}
                  {showDeclarePaid && (
                    <Button onClick={declarePaid}>Facturé + Payé</Button>
                  )}
                  {showPietroVerify && (
                    <Button onClick={pietroVerify}>
                      Vérifier virement &amp; clôturer
                    </Button>
                  )}
                </div>
              )}

              <Separator />

              <p className="text-xs text-muted-foreground">
                {transit.status === "pending" &&
                  "En attente de validation du destinataire."}
                {transit.status === "validated" &&
                  "Validé — l'agence émettrice peut maintenant expédier."}
                {transit.status === "in_transit" &&
                  "Colis en route — réception à confirmer."}
                {transit.status === "received" &&
                  "Reçu — destinataire doit déclarer paiement avec n° de facture."}
                {transit.status === "paid_unverified" &&
                  "En attente de vérification bancaire par Pietro."}
                {transit.status === "closed" && "Bon clôturé."}
                {transit.status === "refused" &&
                  "Bon refusé — recréer un nouveau bon si besoin."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Adresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="text-foreground">Émetteur&nbsp;:</span>{" "}
                {fromAgency.address}
              </p>
              <p>
                <span className="text-foreground">Destinataire&nbsp;:</span>{" "}
                {toAgency.address}
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
