"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  agencyBySlug,
  PAYMENT_METHOD_LABEL,
  PICKUP_STATUS_LABEL,
} from "@/lib/mock";
import { getPickup, updatePickupStatus } from "@/lib/pickups-db";
import { useRole } from "@/lib/role-context";
import { PickupStatusChip } from "@/components/PickupStatusChip";
import { formatDateTime } from "@/lib/utils";
import type { Pickup, PickupStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMELINE: PickupStatus[] = ["incoming", "available", "picked_up"];

export default function PickupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { role, roleLabel, isPietro } = useRole();

  const [pickup, setPickup] = useState<Pickup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPickup(id)
      .then((d) => {
        if (!active) return;
        setPickup(d);
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

  if (!pickup) return notFound();

  const agency = agencyBySlug(pickup.destinationAgencyId);

  const isDestAgency =
    role.kind === "agency" && role.agencySlug === pickup.destinationAgencyId;
  const canAct = isDestAgency || isPietro;

  async function handleReceive() {
    const updated = await updatePickupStatus(pickup!.id, "available");
    if (updated) {
      setPickup({ ...updated });
      // Email simulé (aucun envoi réel) — confirmation visuelle pour l'agence
      toast.success(
        `Email envoyé à ${pickup!.clientName} (${pickup!.clientEmail})`,
        {
          description: `Votre bien confié est arrivé à ${agency.name}. Venez l'essayer sous 48h.`,
        }
      );
    }
  }

  async function handlePickedUp() {
    const updated = await updatePickupStatus(pickup!.id, "picked_up");
    if (updated) {
      setPickup({ ...updated });
      toast.success(`Bien confié remis à ${pickup!.clientName}`);
    }
  }

  const showReceive = canAct && pickup.status === "incoming";
  const showPickedUp = canAct && pickup.status === "available";
  const noAction = !showReceive && !showPickedUp;

  const currentIdx = TIMELINE.indexOf(pickup.status);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/colis"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--gold)]"
        >
          <ArrowLeft className="size-4" />
          Tous les biens confiés
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
                Bien confié
              </p>
              <h1 className="mt-1 flex items-center gap-2 font-serif text-4xl text-foreground">
                <Package className="size-7 text-[var(--gold)]" aria-hidden />
                {pickup.parisOrderRef}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-muted-foreground">
                Destination&nbsp;:
                <span className="text-foreground">{agency.name}</span>
                <span className="mx-1">·</span>
                Transporteur&nbsp;: {pickup.transporter}
                <span className="mx-1">·</span>
                Annoncé le {formatDateTime(pickup.createdAt)}
              </p>
            </div>
            <PickupStatusChip status={pickup.status} />
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Nom&nbsp;: </span>
                <span className="text-foreground">{pickup.clientName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email&nbsp;: </span>
                <span className="text-foreground">{pickup.clientEmail}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Téléphone&nbsp;: </span>
                <span className="text-foreground">{pickup.clientPhone}</span>
              </p>
              <p>
                <span className="text-muted-foreground">
                  Mode de paiement&nbsp;:{" "}
                </span>
                <span className="text-foreground">
                  {PAYMENT_METHOD_LABEL[pickup.paymentMethod]}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Descriptif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-foreground">
                {pickup.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">
                Avancement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {TIMELINE.map((s, i) => {
                  const reached = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      {reached ? (
                        <CheckCircle2
                          className={cn(
                            "size-5 shrink-0",
                            isCurrent
                              ? "text-[var(--gold)]"
                              : "text-emerald-600"
                          )}
                          aria-hidden
                        />
                      ) : (
                        <Circle
                          className="size-5 shrink-0 text-muted-foreground/40"
                          aria-hidden
                        />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          reached
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {PICKUP_STATUS_LABEL[s]}
                      </span>
                    </li>
                  );
                })}
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
                  {showReceive && (
                    <Button onClick={handleReceive}>Réceptionner</Button>
                  )}
                  {showPickedUp && (
                    <Button onClick={handlePickedUp}>Remis au client</Button>
                  )}
                </div>
              )}

              <Separator />

              <p className="text-xs text-muted-foreground">
                {pickup.status === "incoming" &&
                  "Annoncé par l'agence d'origine — à réceptionner physiquement à l'agence."}
                {pickup.status === "available" &&
                  "Disponible en agence — email envoyé au client (essai sous 48h)."}
                {pickup.status === "picked_up" &&
                  "Remis au client — dossier clôturé."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Agence retrait</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p className="text-foreground">{agency.name}</p>
              <p>{agency.address}</p>
              <p>Responsable : {agency.manager}</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
