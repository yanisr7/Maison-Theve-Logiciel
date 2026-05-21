"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import {
  AGENCIES,
  agencyBySlug,
  addObservation,
  getObservationsByAgency,
  resolveObservation,
} from "@/lib/mock";
import type {
  AgencySlug,
  Observation,
  ObservationPriority,
} from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { relativeDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ObservationPriorityChip,
  ObservationStatusChip,
} from "@/components/ObservationChips";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | "open" | "resolved";

const PRIORITY_RANK: Record<ObservationPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
};

export default function AgencyObservationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const isValid = AGENCIES.some((a) => a.slug === slug);
  if (!isValid) return notFound();
  const agencySlug = slug as AgencySlug;
  const agency = agencyBySlug(agencySlug);
  const { isPietro, isAgency, roleLabel } = useRole();

  const canView = isPietro || isAgency(agencySlug);
  const canEdit = canView;

  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<ObservationPriority>("normal");

  const observations = useMemo(
    () => getObservationsByAgency(agencySlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agencySlug, tick]
  );

  const open = useMemo(
    () =>
      observations
        .filter((o) => o.status === "open")
        .sort(
          (a, b) =>
            PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
            (a.createdAt < b.createdAt ? 1 : -1)
        ),
    [observations]
  );

  const resolved = useMemo(
    () =>
      observations
        .filter((o) => o.status === "resolved")
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [observations]
  );

  if (!canView) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-[var(--gold)]" />
              <CardTitle className="font-serif text-2xl">
                Accès restreint
              </CardTitle>
            </div>
            <CardDescription>
              Les observations de {agency.name} sont visibles uniquement par
              l'agence concernée ou par Pietro.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Le texte ne peut pas être vide.");
      return;
    }
    const author = isPietro ? "Pietro" : roleLabel;
    addObservation(agencySlug, trimmed, author, priority);
    toast.success("Observation ajoutée.");
    setText("");
    setPriority("normal");
    setTick((t) => t + 1);
  }

  function resolve(id: string) {
    resolveObservation(id);
    toast.success("Observation marquée comme résolue.");
    setTick((t) => t + 1);
  }

  const visible: { open: Observation[]; resolved: Observation[] } = {
    open: filter === "resolved" ? [] : open,
    resolved: filter === "open" ? [] : resolved,
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <Link
          href={`/agence/${agencySlug}`}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-[var(--gold)]"
        >
          <ArrowLeft className="size-3" /> Retour {agency.name}
        </Link>
        <h1 className="font-serif text-4xl text-foreground">
          Observations — {agency.name}
        </h1>
        <p className="text-muted-foreground">
          {open.length} ouverte{open.length > 1 ? "s" : ""} ·{" "}
          {resolved.length} résolue{resolved.length > 1 ? "s" : ""}
        </p>
      </header>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">
              Nouvelle observation
            </CardTitle>
            <CardDescription>
              Saisie libre — incidents matériels, faits du jour, demandes à
              Pietro, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="text">Texte</Label>
              <Textarea
                id="text"
                placeholder="Ex : Vitrine LED côté gauche défectueuse — clignote par intermittence."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as ObservationPriority)}
                >
                  <SelectTrigger id="priority" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={submit}>Ajouter</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <FilterTab
          label={`Toutes (${open.length + resolved.length})`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterTab
          label={`Ouvertes (${open.length})`}
          active={filter === "open"}
          onClick={() => setFilter("open")}
        />
        <FilterTab
          label={`Résolues (${resolved.length})`}
          active={filter === "resolved"}
          onClick={() => setFilter("resolved")}
        />
      </div>

      {filter !== "resolved" && (
        <section>
          <h2 className="mb-3 font-serif text-2xl text-foreground">
            Ouvertes
          </h2>
          {visible.open.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
              Aucune observation ouverte.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visible.open.map((o) => (
                <ObservationCard
                  key={o.id}
                  observation={o}
                  canEdit={canEdit}
                  onResolve={() => resolve(o.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {filter !== "open" && (
        <>
          <Separator />
          <section>
            <h2 className="mb-3 font-serif text-2xl text-foreground">
              Résolues
            </h2>
            {visible.resolved.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                Aucune observation résolue.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {visible.resolved.map((o) => (
                  <ObservationCard
                    key={o.id}
                    observation={o}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
          : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function ObservationCard({
  observation,
  canEdit,
  onResolve,
}: {
  observation: Observation;
  canEdit: boolean;
  onResolve?: () => void;
}) {
  const isOpen = observation.status === "open";
  return (
    <Card
      className={cn(
        "gap-3 py-5",
        isOpen && observation.priority === "high" && "border-red-300"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ObservationStatusChip status={observation.status} />
          <ObservationPriorityChip priority={observation.priority} />
        </div>
        <span className="text-xs text-muted-foreground">
          {relativeDate(observation.createdAt)}
        </span>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-foreground whitespace-pre-line">
          {observation.text}
        </p>
        <p className="text-xs text-muted-foreground">
          Par{" "}
          <span className="font-medium text-foreground">
            {observation.authorName}
          </span>
          {observation.resolvedAt && (
            <> · résolue {relativeDate(observation.resolvedAt)}</>
          )}
        </p>
        {isOpen && canEdit && onResolve && (
          <Button size="sm" variant="outline" onClick={onResolve}>
            <CheckCircle2 className="size-4" /> Marquer comme résolu
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
