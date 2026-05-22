"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AGENCIES, createTransit, nextReference } from "@/lib/mock";
import type { AgencySlug, Transporter } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const TRANSPORTERS: Transporter[] = ["Thémis", "Elite", "Interne", "Pietro"];

export default function NouveauBonPage() {
  const router = useRouter();
  const { role, isPietro } = useRole();

  const defaultFrom: AgencySlug =
    role.kind === "agency" ? role.agencySlug : "gambetta";

  const [from, setFrom] = useState<AgencySlug>(defaultFrom);
  const [to, setTo] = useState<AgencySlug>(
    AGENCIES.find((a) => a.slug !== defaultFrom)?.slug ?? "federbe"
  );
  const [transporter, setTransporter] = useState<Transporter>("Thémis");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");

  const previewRef = useMemo(() => nextReference(), []);
  const amountValue = Number.parseInt(amount, 10);
  const amountValid = Number.isFinite(amountValue) && amountValue > 0;
  const canSubmit =
    from !== to && description.trim().length > 5 && amountValid;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const t = createTransit({
      from,
      to,
      transporter,
      description: description.trim(),
      amount: amountValue,
    });
    toast.success(`Bon ${t.reference} créé`, {
      description: "En attente de validation du destinataire.",
    });
    router.push(`/transit/${t.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Transit
        </p>
        <h1 className="font-serif text-4xl text-foreground">Nouveau bon</h1>
        <p className="mt-1 text-muted-foreground">
          Numéro auto-généré&nbsp;:&nbsp;
          <span className="font-mono text-[var(--gold)]">{previewRef}</span>
        </p>
      </header>

      {isPietro && (
        <div className="rounded-md border border-[var(--gold)] bg-[var(--gold)]/10 px-4 py-3 text-sm text-foreground">
          Vous êtes Pietro — vous pouvez créer un bon au nom de n&apos;importe
          quelle agence.
        </div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">Agence émettrice</Label>
                <Select
                  value={from}
                  onValueChange={(v) => setFrom(v as AgencySlug)}
                  disabled={!isPietro}
                >
                  <SelectTrigger id="from" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENCIES.map((a) => (
                      <SelectItem key={a.slug} value={a.slug}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isPietro && (
                  <p className="text-xs text-muted-foreground">
                    Vous créez en tant que votre agence courante.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">Destinataire</Label>
                <Select
                  value={to}
                  onValueChange={(v) => setTo(v as AgencySlug)}
                >
                  <SelectTrigger id="to" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENCIES.filter((a) => a.slug !== from).map((a) => (
                      <SelectItem key={a.slug} value={a.slug}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transporteur</Label>
              <div className="flex flex-wrap gap-2">
                {TRANSPORTERS.map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setTransporter(tr)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      transporter === tr
                        ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
                    )}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriptif du contenu</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : 1 lingot 250g + 3 Napoléons 20F + lot débris or 18k 22g"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Saisie libre, pas de catalogue. Soyez précis (poids, titres,
                quantités).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step={1}
                required
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 1213"
              />
              <p className="text-xs text-muted-foreground">
                Montant figurant sur la facture, en euros entiers. Utilisé par
                Pietro pour la vérification bancaire.
              </p>
            </div>

            {/* Champ caché pour démo du composant Input — facturation future */}
            <Input type="hidden" name="reference" value={previewRef} readOnly />

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Une fois créé, le bon part en validation chez le destinataire.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  Créer le bon
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
