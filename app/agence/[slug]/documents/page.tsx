"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import {
  AGENCIES,
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_SECTION_LABEL,
  DOCUMENT_STATUS_LABEL,
  agencyBySlug,
  getDocumentsByAgency,
  getDocumentsBySection,
  replaceDocument,
} from "@/lib/mock";
import type {
  AgencySlug,
  DocumentSection,
  DocumentStatus,
  LegalDocument,
} from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DocumentStatusChip } from "@/components/DocumentStatusChip";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileText,
  Upload,
} from "lucide-react";

const STATUS_ORDER: DocumentStatus[] = [
  "expired",
  "missing",
  "expiring_soon",
  "up_to_date",
];

export default function AgencyDocumentsPage({
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
  const canEdit = canView; // mêmes règles ici

  // Tick local pour re-render après mutation in-memory
  const [tick, setTick] = useState(0);
  const docs = useMemo(
    () => getDocumentsByAgency(agencySlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agencySlug, tick]
  );

  const counters = useMemo(() => {
    const c: Record<DocumentStatus, number> = {
      up_to_date: 0,
      expiring_soon: 0,
      expired: 0,
      missing: 0,
    };
    for (const d of docs) c[d.status] += 1;
    return c;
  }, [docs]);

  const SECTIONS: DocumentSection[] = ["administratif", "etat", "obligations"];

  const docsBySection = useMemo(() => {
    const sortDocs = (list: LegalDocument[]) =>
      [...list].sort((a, b) => {
        const ra = STATUS_ORDER.indexOf(a.status);
        const rb = STATUS_ORDER.indexOf(b.status);
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name);
      });
    return {
      administratif: sortDocs(getDocumentsBySection(agencySlug, "administratif")),
      etat: sortDocs(getDocumentsBySection(agencySlug, "etat")),
      obligations: sortDocs(getDocumentsBySection(agencySlug, "obligations")),
    } as Record<DocumentSection, LegalDocument[]>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencySlug, tick]);

  if (!canView) {
    return <AccessDenied agencyName={agency.name} />;
  }

  function handleDownload(d: LegalDocument) {
    if (!d.fileName) {
      toast.error("Aucun fichier à télécharger.");
      return;
    }
    toast.success(`Téléchargement simulé : ${d.fileName}`);
  }

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
          Documents légaux — {agency.name}
        </h1>
        <p className="text-muted-foreground">
          KBis, déclaration d'existence, pièces d'identité dirigeant et autres
          pièces obligatoires.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Counter
          label={DOCUMENT_STATUS_LABEL.up_to_date}
          value={counters.up_to_date}
          tone="ok"
        />
        <Counter
          label={DOCUMENT_STATUS_LABEL.expiring_soon}
          value={counters.expiring_soon}
          tone="warn"
        />
        <Counter
          label={DOCUMENT_STATUS_LABEL.expired}
          value={counters.expired}
          tone="alert"
        />
        <Counter
          label={DOCUMENT_STATUS_LABEL.missing}
          value={counters.missing}
          tone="muted"
        />
      </section>

      <Separator />

      <section>
        <Tabs
          defaultValue="administratif"
          orientation="vertical"
          className="md:flex-row md:gap-6"
        >
          <TabsList
            variant="line"
            className="md:w-56 md:shrink-0 md:items-stretch"
          >
            {SECTIONS.map((section) => {
              const count = docsBySection[section].length;
              const alerts = docsBySection[section].filter(
                (d) => d.status === "expired" || d.status === "missing"
              ).length;
              return (
                <TabsTrigger
                  key={section}
                  value={section}
                  className="md:justify-between md:px-3 md:py-2.5"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="size-4" aria-hidden />
                    {DOCUMENT_SECTION_LABEL[section]}
                  </span>
                  {alerts > 0 ? (
                    <Badge className="bg-red-600 text-[10px] text-white">
                      {alerts}
                    </Badge>
                  ) : (
                    count > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-muted-foreground"
                      >
                        {count}
                      </Badge>
                    )
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {SECTIONS.map((section) => {
            const list = docsBySection[section];
            return (
              <TabsContent key={section} value={section} className="mt-0">
                <h2 className="mb-4 font-serif text-2xl text-foreground">
                  {DOCUMENT_SECTION_LABEL[section]}
                </h2>
                {list.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
                    Aucun document dans cette section.
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {list.map((d) => (
                      <DocumentRow
                        key={d.id}
                        document={d}
                        canEdit={canEdit}
                        onDownload={() => handleDownload(d)}
                        onReplaced={() => setTick((t) => t + 1)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
    </div>
  );
}

function AccessDenied({ agencyName }: { agencyName: string }) {
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
            Les documents légaux de {agencyName} sont visibles uniquement par
            l'agence concernée ou par Pietro. Changez de rôle pour y accéder.
          </CardDescription>
        </CardHeader>
      </Card>
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
  tone: "ok" | "warn" | "alert" | "muted";
}) {
  const toneClass =
    tone === "ok"
      ? "text-emerald-600"
      : tone === "warn"
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

function DocumentRow({
  document,
  canEdit,
  onDownload,
  onReplaced,
}: {
  document: LegalDocument;
  canEdit: boolean;
  onDownload: () => void;
  onReplaced: () => void;
}) {
  return (
    <Card className="gap-3 py-5">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[var(--gold)]" aria-hidden />
            <p className="font-serif text-lg text-foreground">
              {document.name}
            </p>
          </div>
          <Badge variant="outline" className="text-[11px]">
            {DOCUMENT_CATEGORY_LABEL[document.category]}
          </Badge>
        </div>
        <DocumentStatusChip status={document.status} />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {document.fileName ? (
          <p className="text-muted-foreground">
            Fichier :{" "}
            <span className="font-medium text-foreground">
              {document.fileName}
            </span>
          </p>
        ) : (
          <p className="text-muted-foreground italic">
            Aucun fichier déposé pour le moment.
          </p>
        )}
        {document.uploadedAt && (
          <p className="text-xs text-muted-foreground">
            Déposé le {formatDate(document.uploadedAt)}
          </p>
        )}
        {document.expiresAt && (
          <p className="text-xs text-muted-foreground">
            Expire le{" "}
            <span className="font-medium text-foreground">
              {formatDate(document.expiresAt)}
            </span>
          </p>
        )}
        {canEdit && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onDownload}
              disabled={!document.fileName}
            >
              <Download className="size-4" /> Télécharger
            </Button>
            <ReplaceDocumentDialog
              document={document}
              onReplaced={onReplaced}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReplaceDocumentDialog({
  document,
  onReplaced,
}: {
  document: LegalDocument;
  onReplaced: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function submit() {
    const finalFileName =
      fileName.trim() ||
      `${document.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${new Date().getFullYear()}.pdf`;
    replaceDocument(document.id, {
      fileName: finalFileName,
      uploadedAt: new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });
    toast.success(`Document mis à jour : ${finalFileName}`);
    setOpen(false);
    setFileName("");
    setExpiresAt("");
    onReplaced();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="size-4" />{" "}
          {document.fileName ? "Remplacer" : "Déposer"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            {document.fileName ? "Remplacer" : "Déposer"} — {document.name}
          </DialogTitle>
          <DialogDescription>
            Démonstration — aucun fichier n'est réellement uploadé, on simule la
            mise à jour des métadonnées.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="file">Fichier (mock)</Label>
            <Input id="file" type="file" disabled />
            <p className="text-xs text-muted-foreground">
              Champ désactivé — usage démo.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fileName">Nom du fichier</Label>
            <Input
              id="fileName"
              placeholder="ex: kbis-gambetta-2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiresAt">Date d'expiration (optionnel)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={submit}>Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
