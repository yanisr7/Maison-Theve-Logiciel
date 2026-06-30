"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";
import { agencyBySlug } from "@/lib/mock";
import {
  addProposal,
  getAllProposals,
  getProposalsByAgency,
  updateProposalStatus,
} from "@/lib/proposals-db";
import type { Proposal, ProposalStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { relativeDate } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

const STATUS_LABEL: Record<ProposalStatus, string> = {
  new: "Nouvelle",
  planned: "Planifiée",
  done: "Réalisée",
  declined: "Écartée",
};

const STATUS_STYLE: Record<ProposalStatus, string> = {
  new: "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30",
  planned: "bg-amber-50 text-amber-700 border-amber-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-muted text-muted-foreground border-border",
};

export default function PropositionsPage() {
  const { role, isPietro, roleLabel } = useRole();
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const agencySlug = role.kind === "agency" ? role.agencySlug : null;

  async function load() {
    try {
      const data = isPietro
        ? await getAllProposals()
        : agencySlug
          ? await getProposalsByAgency(agencySlug)
          : [];
      setProposals(data);
    } catch {
      setProposals([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPietro, agencySlug]);

  const canSubmit = title.trim().length > 2 && description.trim().length > 5;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await addProposal({
        title: title.trim(),
        description: description.trim(),
        authorName: roleLabel,
        authorRole: isPietro ? "admin" : "agency",
        agencySlug,
      });
      toast.success("Proposition envoyée", {
        description: "Pietro la verra dans sa liste.",
      });
      setTitle("");
      setDescription("");
      await load();
    } catch {
      toast.error("Échec de l'envoi, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(id: string, status: ProposalStatus) {
    const updated = await updateProposalStatus(id, status);
    if (updated) {
      setProposals((prev) =>
        prev ? prev.map((p) => (p.id === id ? updated : p)) : prev
      );
      toast.success("Statut mis à jour");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
          Logiciel
        </p>
        <h1 className="flex items-center gap-2 text-4xl font-bold tracking-tight text-foreground">
          <Lightbulb className="size-8 text-[var(--gold)]" />
          Propositions d&apos;amélioration
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isPietro
            ? "Toutes les idées remontées par les agences pour faire évoluer l'outil."
            : "Une idée pour améliorer le logiciel ? Proposez-la — Pietro la recevra."}
        </p>
      </header>

      {/* Formulaire (tout le monde peut proposer) */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la proposition</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Ajouter un export PDF des transits"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Détail</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Décrivez l'amélioration souhaitée et en quoi elle aide au quotidien."
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Envoi…" : "Envoyer la proposition"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste */}
      <section className="space-y-4">
        <h2 className="text-2xl font-normal text-foreground">
          {isPietro ? "Toutes les propositions" : "Propositions de votre agence"}
        </h2>

        {proposals === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm">
                <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Aucune proposition pour l&apos;instant.
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => (
              <Card key={p.id} className="rounded-2xl shadow-sm">
                <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {p.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[p.status]}`}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">
                      {p.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Par <span className="text-foreground">{p.authorName}</span>
                      {p.agencySlug && ` · ${agencyBySlug(p.agencySlug).name}`} ·{" "}
                      {relativeDate(p.createdAt)}
                    </p>
                  </div>

                  {isPietro && (
                    <Select
                      value={p.status}
                      onValueChange={(v) =>
                        changeStatus(p.id, v as ProposalStatus)
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          ["new", "planned", "done", "declined"] as ProposalStatus[]
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
