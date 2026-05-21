"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AGENCIES, createTransit, nextReference } from "@/lib/mock";
import type { AgencySlug, Transporter } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { ActionButton } from "@/components/ActionButton";
import { useToast } from "@/components/ToastProvider";

const TRANSPORTERS: Transporter[] = ["Thémis", "Elite", "Interne", "Pietro"];

export default function NouveauBonPage() {
  const router = useRouter();
  const { role, isPietro } = useRole();
  const { push } = useToast();

  const defaultFrom: AgencySlug =
    role.kind === "agency" ? role.agencySlug : "gambetta";

  const [from, setFrom] = useState<AgencySlug>(defaultFrom);
  const [to, setTo] = useState<AgencySlug>(
    AGENCIES.find((a) => a.slug !== defaultFrom)?.slug ?? "federbe"
  );
  const [transporter, setTransporter] = useState<Transporter>("Thémis");
  const [description, setDescription] = useState("");

  const previewRef = useMemo(() => nextReference(), []);
  const canSubmit = from !== to && description.trim().length > 5;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const t = createTransit({ from, to, transporter, description: description.trim() });
    push(`Bon ${t.reference} créé — en attente de validation`, "success");
    router.push(`/transit/${t.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Transit</p>
        <h1 className="font-serif text-4xl text-cream">Nouveau bon</h1>
        <p className="mt-1 text-cream-dim">
          Numéro auto-généré&nbsp;:&nbsp;
          <span className="text-gold">{previewRef}</span>
        </p>
      </header>

      {isPietro && (
        <div className="rounded-md border border-gold bg-gold-dim p-3 text-xs text-cream">
          Vous êtes Pietro — vous pouvez créer un bon au nom de n&apos;importe quelle agence.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-cream-faint bg-dark2 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Agence émettrice">
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as AgencySlug)}
              disabled={!isPietro}
              className="select"
            >
              {AGENCIES.map((a) => (
                <option key={a.slug} value={a.slug} className="bg-dark2">
                  {a.name}
                </option>
              ))}
            </select>
            {!isPietro && (
              <p className="mt-1 text-xs text-cream-dim">
                Vous créez en tant que votre agence courante.
              </p>
            )}
          </Field>

          <Field label="Destinataire">
            <select
              value={to}
              onChange={(e) => setTo(e.target.value as AgencySlug)}
              className="select"
            >
              {AGENCIES.filter((a) => a.slug !== from).map((a) => (
                <option key={a.slug} value={a.slug} className="bg-dark2">
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Transporteur">
          <div className="flex flex-wrap gap-2">
            {TRANSPORTERS.map((tr) => (
              <button
                key={tr}
                type="button"
                onClick={() => setTransporter(tr)}
                className={
                  "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                  (transporter === tr
                    ? "border-gold bg-gold-dim text-cream"
                    : "border-cream-faint text-cream-dim hover:border-gold hover:text-cream")
                }
              >
                {tr}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Descriptif du contenu" hint="Saisie libre, pas de catalogue. Soyez précis.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex&nbsp;: 1 lingot 250g + 3 Napoléons 20F + lot débris or 18k 22g"
            rows={5}
            className="w-full rounded-md border border-cream-faint bg-dark3 px-3 py-2 text-sm text-cream placeholder:text-cream-dim/60 outline-none transition-colors focus:border-gold"
          />
        </Field>

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-cream-dim">
            Une fois créé, le bon part en validation chez le destinataire.
          </p>
          <div className="flex gap-2">
            <ActionButton type="button" variant="ghost" onClick={() => router.back()}>
              Annuler
            </ActionButton>
            <ActionButton type="submit" disabled={!canSubmit}>
              Créer le bon
            </ActionButton>
          </div>
        </div>
      </form>

      <style jsx>{`
        .select {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid var(--cream-faint);
          background: var(--dark3);
          color: var(--cream);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .select:focus {
          border-color: var(--gold);
        }
        .select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wide text-cream-dim">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cream-dim">{hint}</span>}
    </label>
  );
}
