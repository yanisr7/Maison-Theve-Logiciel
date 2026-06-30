"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENCIES, agencyBySlug } from "@/lib/mock";
import { getCasDeFigureByAgency } from "@/lib/cas-db";
import type { AgencySlug, CasSeverity, CasDeFigure } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { CasCard } from "@/components/CasCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";

const SEVERITY_ORDER: CasSeverity[] = ["danger", "warning", "info"];

export default function AgencyCasDeFigurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const isValid = AGENCIES.some((a) => a.slug === slug);
  if (!isValid) return notFound();
  const agencySlug = slug as AgencySlug;
  const agency = agencyBySlug(agencySlug);
  const { isPietro, isAgency } = useRole();

  const canView = isPietro || isAgency(agencySlug);

  const [cas, setCas] = useState<CasDeFigure[] | null>(null);

  useEffect(() => {
    if (!canView) return;
    let active = true;
    getCasDeFigureByAgency(agencySlug)
      .then((res) => {
        if (active) setCas(res);
      })
      .catch(() => {
        if (active) setCas([]);
      });
    return () => {
      active = false;
    };
  }, [agencySlug, canView]);

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
              Les cas de figure de {agency.name} sont visibles uniquement par
              l'agence concernée ou par Pietro.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!cas) {
    return (
      <div className="py-24 text-center text-muted-foreground">Chargement…</div>
    );
  }

  const casList = [...cas].sort((a, b) => {
    const ra = SEVERITY_ORDER.indexOf(a.severity);
    const rb = SEVERITY_ORDER.indexOf(b.severity);
    if (ra !== rb) return ra - rb;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const dangerCount = casList.filter((c) => c.severity === "danger").length;
  const warningCount = casList.filter((c) => c.severity === "warning").length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <Link
          href={`/agence/${agencySlug}`}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-[var(--gold)]"
        >
          <ArrowLeft className="size-3" /> Retour {agency.name}
        </Link>
        <h1 className="flex items-center gap-2 font-serif text-4xl text-foreground">
          <ShieldAlert className="size-7 text-[var(--gold)]" aria-hidden />
          Cas de figure — {agency.name}
        </h1>
        <p className="text-muted-foreground">
          Retours d'expérience et alertes terrain : fausses devises, faux
          bijoux, clients à surveiller, tentatives de vol. À partager entre
          cambistes pour aiguiser la vigilance.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Counter label="Total signalé" value={casList.length} tone="muted" />
        <Counter label="Vigilance" value={warningCount} tone="warn" />
        <Counter label="Alertes" value={dangerCount} tone="alert" />
      </section>

      <Separator />

      <section>
        {casList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Aucun cas de figure signalé pour cette agence.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {casList.map((c) => (
              <CasCard key={c.id} cas={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warn" | "alert" | "muted";
}) {
  const toneClass =
    tone === "warn"
      ? "text-[var(--gold)]"
      : tone === "alert"
        ? "text-red-600"
        : "text-muted-foreground";
  return (
    <Card className="gap-1 py-4">
      <CardContent className="space-y-1 px-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`font-serif text-2xl ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
