import type { Agency, AgencySlug, Transit, TransitStatus } from "./types";

export const AGENCIES: Agency[] = [
  {
    slug: "gambetta",
    name: "Gambetta",
    address: "12 rue Léon Gambetta, 59000 Lille",
    manager: "Sébastien",
  },
  {
    slug: "federbe",
    name: "Federbe",
    address: "47 rue Faidherbe, 59000 Lille",
    manager: "Karim",
  },
  {
    slug: "grand-beta",
    name: "Grand Béta",
    address: "8 Grand Place, 59800 Lille",
    manager: "Audrey",
  },
];

export function agencyBySlug(slug: AgencySlug): Agency {
  const a = AGENCIES.find((x) => x.slug === slug);
  if (!a) throw new Error(`Agence inconnue : ${slug}`);
  return a;
}

export const STATUS_LABEL: Record<TransitStatus, string> = {
  pending: "En attente de validation",
  validated: "Validé par destinataire",
  in_transit: "En transit",
  received: "Réceptionné",
  paid_unverified: "Facturé + Payé (non vérifié)",
  closed: "Clôturé",
  refused: "Refusé",
};

// Mock data — réinitialisé en mémoire à chaque session
const initialTransits: Transit[] = [
  {
    id: "t1",
    reference: "TR-2026-0001",
    from: "gambetta",
    to: "federbe",
    transporter: "Thémis",
    description: "1 lingot 250g + 3 Napoléons 20F",
    status: "pending",
    createdAt: "2026-05-18T09:14:00",
    events: [
      { date: "2026-05-18T09:14:00", label: "Bon créé", by: "Gambetta" },
    ],
  },
  {
    id: "t2",
    reference: "TR-2026-0002",
    from: "gambetta",
    to: "federbe",
    transporter: "Elite",
    description: "5 chaînes or 18k — 35g total + 2 alliances",
    status: "validated",
    createdAt: "2026-05-17T15:02:00",
    events: [
      { date: "2026-05-17T15:02:00", label: "Bon créé", by: "Gambetta" },
      { date: "2026-05-17T16:10:00", label: "Validé par destinataire", by: "Federbe" },
    ],
  },
  {
    id: "t3",
    reference: "TR-2026-0003",
    from: "federbe",
    to: "grand-beta",
    transporter: "Interne",
    description: "12 pièces argent diverses + 1 montre or 18k",
    status: "in_transit",
    createdAt: "2026-05-16T11:30:00",
    events: [
      { date: "2026-05-16T11:30:00", label: "Bon créé", by: "Federbe" },
      { date: "2026-05-16T12:00:00", label: "Validé par destinataire", by: "Grand Béta" },
      { date: "2026-05-16T14:20:00", label: "Expédié", by: "Federbe" },
    ],
  },
  {
    id: "t4",
    reference: "TR-2026-0004",
    from: "gambetta",
    to: "federbe",
    transporter: "Thémis",
    description: "2 lingots 500g + lot bijoux fantaisie",
    status: "received",
    createdAt: "2026-05-14T09:45:00",
    events: [
      { date: "2026-05-14T09:45:00", label: "Bon créé", by: "Gambetta" },
      { date: "2026-05-14T10:00:00", label: "Validé par destinataire", by: "Federbe" },
      { date: "2026-05-14T15:00:00", label: "Expédié", by: "Gambetta" },
      { date: "2026-05-15T10:12:00", label: "Réceptionné", by: "Federbe" },
    ],
  },
  {
    id: "t5",
    reference: "TR-2026-0005",
    from: "grand-beta",
    to: "federbe",
    transporter: "Pietro",
    description: "Lot débris or 18k — 142g",
    status: "paid_unverified",
    createdAt: "2026-05-10T08:20:00",
    invoiceNumber: "FA-2026-0451",
    events: [
      { date: "2026-05-10T08:20:00", label: "Bon créé", by: "Grand Béta" },
      { date: "2026-05-10T09:00:00", label: "Validé par destinataire", by: "Federbe" },
      { date: "2026-05-10T14:30:00", label: "Expédié", by: "Grand Béta" },
      { date: "2026-05-11T11:15:00", label: "Réceptionné", by: "Federbe" },
      { date: "2026-05-12T09:00:00", label: "Facturé + Payé déclaré (FA-2026-0451)", by: "Federbe" },
    ],
  },
  {
    id: "t6",
    reference: "TR-2026-0006",
    from: "gambetta",
    to: "federbe",
    transporter: "Thémis",
    description: "1 lingot 1kg + 8 Napoléons + lot dentaire 22g",
    status: "closed",
    createdAt: "2026-05-02T10:00:00",
    invoiceNumber: "FA-2026-0398",
    events: [
      { date: "2026-05-02T10:00:00", label: "Bon créé", by: "Gambetta" },
      { date: "2026-05-02T10:30:00", label: "Validé par destinataire", by: "Federbe" },
      { date: "2026-05-02T14:00:00", label: "Expédié", by: "Gambetta" },
      { date: "2026-05-03T10:00:00", label: "Réceptionné", by: "Federbe" },
      { date: "2026-05-04T09:00:00", label: "Facturé + Payé déclaré (FA-2026-0398)", by: "Federbe" },
      { date: "2026-05-05T16:30:00", label: "Virement vérifié — clôturé", by: "Pietro" },
    ],
  },
  {
    id: "t7",
    reference: "TR-2026-0007",
    from: "federbe",
    to: "gambetta",
    transporter: "Elite",
    description: "Lot bijoux divers 9k — qualité incertaine",
    status: "refused",
    createdAt: "2026-05-09T13:00:00",
    refusalReason: "Descriptif insuffisant, photo manquante. À refaire avec détails poids/titres.",
    events: [
      { date: "2026-05-09T13:00:00", label: "Bon créé", by: "Federbe" },
      { date: "2026-05-09T14:20:00", label: "Refusé par destinataire", by: "Gambetta" },
    ],
  },
];

// Mutation in-memory (sera reset au reload — c'est volontaire pour le mock)
let TRANSITS: Transit[] = [...initialTransits];

export function getAllTransits(): Transit[] {
  return TRANSITS;
}

export function getTransit(id: string): Transit | undefined {
  return TRANSITS.find((t) => t.id === id);
}

export function nextReference(): string {
  const max = TRANSITS.reduce((acc, t) => {
    const num = parseInt(t.reference.split("-")[2] ?? "0", 10);
    return num > acc ? num : acc;
  }, 0);
  return `TR-2026-${String(max + 1).padStart(4, "0")}`;
}

export function createTransit(input: Omit<Transit, "id" | "reference" | "status" | "createdAt" | "events">): Transit {
  const reference = nextReference();
  const id = "t" + (TRANSITS.length + 1) + "-" + Date.now();
  const createdAt = new Date().toISOString();
  const fromName = agencyBySlug(input.from).name;
  const t: Transit = {
    ...input,
    id,
    reference,
    status: "pending",
    createdAt,
    events: [{ date: createdAt, label: "Bon créé", by: fromName }],
  };
  TRANSITS = [t, ...TRANSITS];
  return t;
}

export function updateTransit(id: string, fn: (t: Transit) => Transit): Transit | undefined {
  const idx = TRANSITS.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  const updated = fn(TRANSITS[idx]);
  TRANSITS = [...TRANSITS.slice(0, idx), updated, ...TRANSITS.slice(idx + 1)];
  return updated;
}

// Observations / équipe — stubs simples par agence
export const OBSERVATIONS: Record<AgencySlug, { date: string; author: string; text: string }[]> = {
  gambetta: [
    { date: "2026-05-19", author: "Sébastien", text: "Client revenu pour les Napoléons — accord conclu à 295€/pièce." },
    { date: "2026-05-15", author: "Sébastien", text: "Vitrine 2 cassée, devis vitrier envoyé à Pietro." },
  ],
  federbe: [
    { date: "2026-05-18", author: "Karim", text: "Demande de mise en sécu coffre — réceptionné Thémis OK." },
  ],
  "grand-beta": [
    { date: "2026-05-16", author: "Audrey", text: "Ouverture exceptionnelle samedi 23/05, prévenir équipe." },
  ],
};

export const TEAM: Record<AgencySlug, { name: string; role: string }[]> = {
  gambetta: [
    { name: "Sébastien", role: "Responsable" },
    { name: "Léa", role: "Vendeuse" },
    { name: "Marc", role: "Apprenti" },
  ],
  federbe: [
    { name: "Karim", role: "Responsable" },
    { name: "Sofia", role: "Vendeuse" },
  ],
  "grand-beta": [
    { name: "Audrey", role: "Responsable" },
    { name: "Tom", role: "Vendeur" },
  ],
};
