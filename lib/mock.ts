import type {
  Agency,
  AgencySlug,
  Appointment,
  AppointmentStatus,
  DocumentCategory,
  DocumentStatus,
  Employee,
  EmployeeRole,
  Leave,
  LeaveType,
  LegalDocument,
  Observation,
  ObservationPriority,
  ObservationStatus,
  Pickup,
  PickupStatus,
  Review,
  Transit,
  TransitStatus,
} from "./types";

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

// (Anciennes données équipe/observations stub remplacées par les modules
// dédiés DOCUMENTS / EMPLOYEES / LEAVES / OBSERVATIONS plus bas.)

// ============================================================
// Point Relais Paris → Lille
// ============================================================

export const PICKUP_STATUS_LABEL: Record<PickupStatus, string> = {
  incoming: "Annoncé Paris",
  available: "Disponible en boutique",
  picked_up: "Remis au client",
};

export const PAYMENT_METHOD_LABEL: Record<
  Pickup["paymentMethod"],
  string
> = {
  virement: "Virement",
  carte: "Carte",
  espèces: "Espèces",
  autre: "Autre",
};

// Dates de référence autour de "now" pour des mocks vivants
const NOW = new Date("2026-05-21T10:00:00");
function isoOffsetDays(days: number, hours = 10, minutes = 0): string {
  const d = new Date(NOW.getTime());
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const initialPickups: Pickup[] = [
  {
    id: "p1",
    parisOrderRef: "GOD-2026-12345",
    clientName: "Camille Lefèvre",
    clientEmail: "camille.lefevre@example.fr",
    clientPhone: "06 12 34 56 78",
    description: "Lingot 100g + 2 Napoléons 20F",
    paymentMethod: "virement",
    destinationAgencyId: "gambetta",
    transporter: "Thémis",
    status: "incoming",
    createdAt: isoOffsetDays(-1, 9, 15),
  },
  {
    id: "p2",
    parisOrderRef: "GOD-2026-12346",
    clientName: "Julien Mercier",
    clientEmail: "julien.mercier@example.fr",
    clientPhone: "07 88 21 09 44",
    description: "Bracelet or 18k — 22g",
    paymentMethod: "carte",
    destinationAgencyId: "federbe",
    transporter: "Elite",
    status: "available",
    createdAt: isoOffsetDays(-3, 14, 0),
  },
  {
    id: "p3",
    parisOrderRef: "GOD-2026-12347",
    clientName: "Sophie Vandamme",
    clientEmail: "sophie.vandamme@example.fr",
    clientPhone: "06 45 78 12 03",
    description: "Collection 6 pièces argent 1 oz",
    paymentMethod: "virement",
    destinationAgencyId: "grand-beta",
    transporter: "Interne",
    status: "available",
    createdAt: isoOffsetDays(-2, 11, 30),
  },
  {
    id: "p4",
    parisOrderRef: "GOD-2026-12348",
    clientName: "Antoine Bernard",
    clientEmail: "antoine.bernard@example.fr",
    clientPhone: "06 71 50 22 88",
    description: "1 Krugerrand 1 oz + 1 Vreneli 20 CHF",
    paymentMethod: "virement",
    destinationAgencyId: "gambetta",
    transporter: "Pietro",
    status: "picked_up",
    createdAt: isoOffsetDays(-7, 16, 0),
  },
  {
    id: "p5",
    parisOrderRef: "GOD-2026-12349",
    clientName: "Marie Dubois",
    clientEmail: "marie.dubois@example.fr",
    clientPhone: "07 02 19 67 33",
    description: "Chaîne or 18k 45cm — 12g",
    paymentMethod: "espèces",
    destinationAgencyId: "federbe",
    transporter: "Thémis",
    status: "incoming",
    createdAt: isoOffsetDays(0, 8, 45),
  },
  {
    id: "p6",
    parisOrderRef: "GOD-2026-12350",
    clientName: "Lucas Petit",
    clientEmail: "lucas.petit@example.fr",
    clientPhone: "06 90 12 34 21",
    description: "Lingotin 50g + médaille religieuse or",
    paymentMethod: "autre",
    destinationAgencyId: "grand-beta",
    transporter: "Elite",
    status: "picked_up",
    createdAt: isoOffsetDays(-10, 10, 30),
  },
  {
    id: "p7",
    parisOrderRef: "GOD-2026-12351",
    clientName: "Élodie Rousseau",
    clientEmail: "elodie.rousseau@example.fr",
    clientPhone: "07 14 56 89 02",
    description: "Bague solitaire or blanc 18k (sans pierre)",
    paymentMethod: "carte",
    destinationAgencyId: "gambetta",
    transporter: "Thémis",
    status: "available",
    createdAt: isoOffsetDays(-4, 13, 15),
  },
];

let PICKUPS: Pickup[] = [...initialPickups];

export function getAllPickups(): Pickup[] {
  return PICKUPS;
}

export function getPickup(id: string): Pickup | undefined {
  return PICKUPS.find((p) => p.id === id);
}

export function updatePickupStatus(
  id: string,
  status: PickupStatus
): Pickup | undefined {
  const idx = PICKUPS.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const updated: Pickup = { ...PICKUPS[idx], status };
  PICKUPS = [...PICKUPS.slice(0, idx), updated, ...PICKUPS.slice(idx + 1)];
  return updated;
}

// ============================================================
// RDV Clients
// ============================================================

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "À venir",
  done: "Effectué",
  cancelled: "Annulé",
  rescheduled: "Reporté",
};

const initialAppointments: Appointment[] = [
  {
    id: "rdv1",
    clientName: "Marc Dubreuil",
    clientEmail: "marc.dubreuil@example.fr",
    clientPhone: "06 11 22 33 44",
    reason: "Estimation lingot 1kg hérité",
    agencyId: "gambetta",
    scheduledAt: isoOffsetDays(0, 14, 30),
    status: "scheduled",
  },
  {
    id: "rdv2",
    clientName: "Hélène Carpentier",
    clientEmail: "helene.carpentier@example.fr",
    clientPhone: "07 55 66 77 88",
    reason: "Vente collection bijoux héritage grand-mère",
    agencyId: "federbe",
    scheduledAt: isoOffsetDays(1, 10, 0),
    status: "scheduled",
  },
  {
    id: "rdv3",
    clientName: "Patrick Lambert",
    clientEmail: "patrick.lambert@example.fr",
    clientPhone: "06 33 99 88 11",
    reason: "Estimation montre Cartier or",
    agencyId: "grand-beta",
    scheduledAt: isoOffsetDays(2, 11, 15),
    status: "scheduled",
  },
  {
    id: "rdv4",
    clientName: "Nadia Moreau",
    clientEmail: "nadia.moreau@example.fr",
    clientPhone: "07 21 45 78 90",
    reason: "Vente alliance + chevalière",
    agencyId: "gambetta",
    scheduledAt: isoOffsetDays(-3, 15, 0),
    status: "done",
  },
  {
    id: "rdv5",
    clientName: "Thierry Vasseur",
    clientEmail: "thierry.vasseur@example.fr",
    clientPhone: "06 78 90 12 34",
    reason: "Estimation Napoléons (lot 12 pièces)",
    agencyId: "federbe",
    scheduledAt: isoOffsetDays(-5, 9, 30),
    status: "done",
  },
  {
    id: "rdv6",
    clientName: "Catherine Lemoine",
    clientEmail: "catherine.lemoine@example.fr",
    clientPhone: "07 90 11 22 33",
    reason: "Vente lot bijoux fantaisie or",
    agencyId: "grand-beta",
    scheduledAt: isoOffsetDays(-2, 16, 0),
    status: "cancelled",
  },
  {
    id: "rdv7",
    clientName: "Olivier Charpentier",
    clientEmail: "olivier.charpentier@example.fr",
    clientPhone: "06 18 27 36 45",
    reason: "Estimation lingot 250g + souverains GB",
    agencyId: "gambetta",
    scheduledAt: isoOffsetDays(-1, 10, 0),
    status: "rescheduled",
    rescheduledAt: isoOffsetDays(4, 14, 0),
  },
  {
    id: "rdv8",
    clientName: "Isabelle Rousseaux",
    clientEmail: "isabelle.rousseaux@example.fr",
    clientPhone: "07 03 14 25 36",
    reason: "Vente bracelet diamants (or 18k base)",
    agencyId: "federbe",
    scheduledAt: isoOffsetDays(5, 11, 0),
    status: "scheduled",
  },
  {
    id: "rdv9",
    clientName: "Damien Tessier",
    clientEmail: "damien.tessier@example.fr",
    clientPhone: "06 47 58 69 70",
    reason: "Estimation collection pièces hérités père",
    agencyId: "grand-beta",
    scheduledAt: isoOffsetDays(3, 9, 0),
    status: "scheduled",
  },
];

let APPOINTMENTS: Appointment[] = [...initialAppointments];

export function getAllAppointments(): Appointment[] {
  return APPOINTMENTS;
}

export function getAppointment(id: string): Appointment | undefined {
  return APPOINTMENTS.find((a) => a.id === id);
}

export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  rescheduledAt?: string
): Appointment | undefined {
  const idx = APPOINTMENTS.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  const updated: Appointment = {
    ...APPOINTMENTS[idx],
    status,
    ...(rescheduledAt ? { rescheduledAt } : {}),
  };
  APPOINTMENTS = [
    ...APPOINTMENTS.slice(0, idx),
    updated,
    ...APPOINTMENTS.slice(idx + 1),
  ];
  return updated;
}

// ============================================================
// Avis Clients
// ============================================================

const initialReviews: Review[] = [
  {
    id: "rev1",
    clientName: "Camille Lefèvre",
    source: "pickup",
    sourceId: "p4",
    rating: 5,
    comment:
      "Retrait impeccable, équipe Gambetta très professionnelle. Je recommande.",
    createdAt: isoOffsetDays(-6, 12, 0),
    agencyId: "gambetta",
  },
  {
    id: "rev2",
    clientName: "Nadia Moreau",
    source: "appointment",
    sourceId: "rdv4",
    rating: 4,
    comment:
      "Estimation honnête et rapide, légère attente à l'accueil mais sans plus.",
    createdAt: isoOffsetDays(-2, 17, 30),
    agencyId: "gambetta",
  },
  {
    id: "rev3",
    clientName: "Thierry Vasseur",
    source: "appointment",
    sourceId: "rdv5",
    rating: 5,
    comment:
      "Karim a pris le temps de tout expliquer. Excellente première expérience.",
    createdAt: isoOffsetDays(-4, 18, 0),
    agencyId: "federbe",
  },
  {
    id: "rev4",
    clientName: "Lucas Petit",
    source: "pickup",
    sourceId: "p6",
    rating: 3,
    comment: "Retrait OK mais l'agence n'avait pas mes infos quand je suis arrivé.",
    createdAt: isoOffsetDays(-9, 14, 30),
    agencyId: "grand-beta",
  },
  {
    id: "rev5",
    clientName: "Antoine Bernard",
    source: "pickup",
    sourceId: "p4",
    rating: 5,
    comment: "Super réactif, livraison plus rapide qu'annoncée.",
    createdAt: isoOffsetDays(-5, 10, 0),
    agencyId: "gambetta",
  },
  {
    id: "rev6",
    clientName: "Sophie Vandamme",
    source: "pickup",
    sourceId: "p3",
    rating: 4,
    comment: "Bel accueil chez Grand Béta, les pièces étaient bien protégées.",
    createdAt: isoOffsetDays(-1, 16, 0),
    agencyId: "grand-beta",
  },
];

let REVIEWS: Review[] = [...initialReviews];

export function getAllReviews(): Review[] {
  return REVIEWS;
}

export function addReview(input: Omit<Review, "id" | "createdAt">): Review {
  const id = "rev" + (REVIEWS.length + 1) + "-" + Date.now();
  const r: Review = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
  REVIEWS = [r, ...REVIEWS];
  return r;
}

// ============================================================
// Documents légaux par agence
// ============================================================

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  up_to_date: "À jour",
  expiring_soon: "Expire bientôt",
  expired: "Expiré",
  missing: "Manquant",
};

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  kbis: "KBis",
  declaration: "Déclaration",
  id: "Pièce d'identité",
  other: "Autre",
};

const initialDocuments: LegalDocument[] = [
  // Gambetta — KBis à jour, Déclaration expire bientôt, CNI à jour, registre manquant
  {
    id: "doc1",
    agencyId: "gambetta",
    name: "KBis",
    category: "kbis",
    fileName: "kbis-gambetta-2026.pdf",
    uploadedAt: isoOffsetDays(-45, 9, 0),
    expiresAt: isoOffsetDays(120, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc2",
    agencyId: "gambetta",
    name: "Déclaration d'existence",
    category: "declaration",
    fileName: "declaration-gambetta-2024.pdf",
    uploadedAt: isoOffsetDays(-380, 11, 0),
    expiresAt: isoOffsetDays(18, 0, 0),
    status: "expiring_soon",
  },
  {
    id: "doc3",
    agencyId: "gambetta",
    name: "CNI dirigeant (Sébastien)",
    category: "id",
    fileName: "cni-sebastien.pdf",
    uploadedAt: isoOffsetDays(-200, 14, 30),
    expiresAt: isoOffsetDays(900, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc4",
    agencyId: "gambetta",
    name: "Attestation assurance locaux",
    category: "other",
    status: "missing",
  },
  // Federbe — KBis expiré, Déclaration à jour, CNI à jour
  {
    id: "doc5",
    agencyId: "federbe",
    name: "KBis",
    category: "kbis",
    fileName: "kbis-federbe-2024.pdf",
    uploadedAt: isoOffsetDays(-410, 10, 0),
    expiresAt: isoOffsetDays(-12, 0, 0),
    status: "expired",
  },
  {
    id: "doc6",
    agencyId: "federbe",
    name: "Déclaration d'existence",
    category: "declaration",
    fileName: "declaration-federbe-2026.pdf",
    uploadedAt: isoOffsetDays(-30, 9, 30),
    expiresAt: isoOffsetDays(335, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc7",
    agencyId: "federbe",
    name: "CNI dirigeant (Karim)",
    category: "id",
    fileName: "cni-karim.pdf",
    uploadedAt: isoOffsetDays(-150, 11, 0),
    expiresAt: isoOffsetDays(1200, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc8",
    agencyId: "federbe",
    name: "Registre du commerce (extrait)",
    category: "other",
    fileName: "rcs-federbe.pdf",
    uploadedAt: isoOffsetDays(-90, 16, 0),
    status: "up_to_date",
  },
  // Grand Béta — KBis à jour, Déclaration manquante, CNI expire bientôt
  {
    id: "doc9",
    agencyId: "grand-beta",
    name: "KBis",
    category: "kbis",
    fileName: "kbis-grand-beta-2026.pdf",
    uploadedAt: isoOffsetDays(-60, 9, 0),
    expiresAt: isoOffsetDays(100, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc10",
    agencyId: "grand-beta",
    name: "Déclaration d'existence",
    category: "declaration",
    status: "missing",
  },
  {
    id: "doc11",
    agencyId: "grand-beta",
    name: "CNI dirigeant (Audrey)",
    category: "id",
    fileName: "cni-audrey.pdf",
    uploadedAt: isoOffsetDays(-1800, 14, 0),
    expiresAt: isoOffsetDays(25, 0, 0),
    status: "expiring_soon",
  },
  {
    id: "doc12",
    agencyId: "grand-beta",
    name: "Bail commercial",
    category: "other",
    fileName: "bail-grand-beta.pdf",
    uploadedAt: isoOffsetDays(-720, 10, 0),
    expiresAt: isoOffsetDays(1500, 0, 0),
    status: "up_to_date",
  },
];

let DOCUMENTS: LegalDocument[] = [...initialDocuments];

export function getAllDocuments(): LegalDocument[] {
  return DOCUMENTS;
}

export function getDocumentsByAgency(agencyId: AgencySlug): LegalDocument[] {
  return DOCUMENTS.filter((d) => d.agencyId === agencyId);
}

export function getDocument(id: string): LegalDocument | undefined {
  return DOCUMENTS.find((d) => d.id === id);
}

export function getExpiringDocuments(): LegalDocument[] {
  return DOCUMENTS.filter((d) => d.status !== "up_to_date");
}

export function addDocument(
  input: Omit<LegalDocument, "id">
): LegalDocument {
  const id = "doc" + (DOCUMENTS.length + 1) + "-" + Date.now();
  const doc: LegalDocument = { ...input, id };
  DOCUMENTS = [doc, ...DOCUMENTS];
  return doc;
}

export function replaceDocument(
  id: string,
  input: { fileName: string; uploadedAt?: string; expiresAt?: string }
): LegalDocument | undefined {
  const idx = DOCUMENTS.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  const now = new Date().toISOString();
  // statut recalculé : si expiresAt fourni et < 30j → expiring_soon, sinon up_to_date
  let status: DocumentStatus = "up_to_date";
  if (input.expiresAt) {
    const ms = new Date(input.expiresAt).getTime() - Date.now();
    const days = ms / (1000 * 60 * 60 * 24);
    if (days < 0) status = "expired";
    else if (days < 30) status = "expiring_soon";
  }
  const updated: LegalDocument = {
    ...DOCUMENTS[idx],
    fileName: input.fileName,
    uploadedAt: input.uploadedAt ?? now,
    expiresAt: input.expiresAt ?? DOCUMENTS[idx].expiresAt,
    status,
  };
  DOCUMENTS = [...DOCUMENTS.slice(0, idx), updated, ...DOCUMENTS.slice(idx + 1)];
  return updated;
}

// ============================================================
// Équipe & planning
// ============================================================

export const EMPLOYEE_ROLE_LABEL: Record<EmployeeRole, string> = {
  responsable: "Responsable",
  cambiste: "Cambiste",
  apprenti: "Apprenti",
  stagiaire: "Stagiaire",
};

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  paid: "Congés payés",
  unpaid: "Sans solde",
  sick: "Arrêt maladie",
  training: "Formation",
};

const initialEmployees: Employee[] = [
  // Gambetta — 1 responsable, 2 cambistes, 1 apprenti
  {
    id: "emp1",
    agencyId: "gambetta",
    firstName: "Sébastien",
    lastName: "Dubois",
    email: "sebastien.dubois@godot-fils.fr",
    phone: "06 11 22 33 44",
    role: "responsable",
    startedAt: "2019-03-15",
  },
  {
    id: "emp2",
    agencyId: "gambetta",
    firstName: "Léa",
    lastName: "Martin",
    email: "lea.martin@godot-fils.fr",
    phone: "06 22 33 44 55",
    role: "cambiste",
    startedAt: "2022-09-01",
  },
  {
    id: "emp3",
    agencyId: "gambetta",
    firstName: "Marc",
    lastName: "Lefèvre",
    email: "marc.lefevre@godot-fils.fr",
    phone: "07 33 44 55 66",
    role: "apprenti",
    startedAt: "2025-09-01",
  },
  // Federbe — 1 responsable, 2 cambistes
  {
    id: "emp4",
    agencyId: "federbe",
    firstName: "Karim",
    lastName: "Benali",
    email: "karim.benali@godot-fils.fr",
    phone: "06 44 55 66 77",
    role: "responsable",
    startedAt: "2020-06-01",
  },
  {
    id: "emp5",
    agencyId: "federbe",
    firstName: "Sofia",
    lastName: "Garcia",
    email: "sofia.garcia@godot-fils.fr",
    phone: "06 55 66 77 88",
    role: "cambiste",
    startedAt: "2023-02-15",
  },
  {
    id: "emp6",
    agencyId: "federbe",
    firstName: "Théo",
    lastName: "Renard",
    email: "theo.renard@godot-fils.fr",
    phone: "07 66 77 88 99",
    role: "cambiste",
    startedAt: "2024-04-08",
  },
  // Grand Béta — 1 responsable, 2 cambistes, 1 stagiaire
  {
    id: "emp7",
    agencyId: "grand-beta",
    firstName: "Audrey",
    lastName: "Vasseur",
    email: "audrey.vasseur@godot-fils.fr",
    phone: "06 77 88 99 00",
    role: "responsable",
    startedAt: "2018-11-12",
  },
  {
    id: "emp8",
    agencyId: "grand-beta",
    firstName: "Tom",
    lastName: "Carpentier",
    email: "tom.carpentier@godot-fils.fr",
    phone: "06 88 99 00 11",
    role: "cambiste",
    startedAt: "2021-07-20",
  },
  {
    id: "emp9",
    agencyId: "grand-beta",
    firstName: "Margaux",
    lastName: "Petit",
    email: "margaux.petit@godot-fils.fr",
    phone: "07 99 00 11 22",
    role: "cambiste",
    startedAt: "2023-10-03",
  },
  {
    id: "emp10",
    agencyId: "grand-beta",
    firstName: "Hugo",
    lastName: "Bernard",
    email: "hugo.bernard@godot-fils.fr",
    phone: "06 10 20 30 40",
    role: "stagiaire",
    startedAt: "2026-04-01",
  },
];

let EMPLOYEES: Employee[] = [...initialEmployees];

export function getAllEmployees(): Employee[] {
  return EMPLOYEES;
}

export function getEmployeesByAgency(agencyId: AgencySlug): Employee[] {
  return EMPLOYEES.filter((e) => e.agencyId === agencyId);
}

export function getEmployee(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id);
}

// Congés — datés autour de NOW (2026-05-21)
const initialLeaves: Leave[] = [
  {
    id: "lv1",
    employeeId: "emp2",
    agencyId: "gambetta",
    type: "paid",
    startsAt: isoOffsetDays(-1, 0, 0),
    endsAt: isoOffsetDays(3, 0, 0),
    reason: "Congés famille",
  },
  {
    id: "lv2",
    employeeId: "emp5",
    agencyId: "federbe",
    type: "sick",
    startsAt: isoOffsetDays(0, 0, 0),
    endsAt: isoOffsetDays(2, 0, 0),
  },
  {
    id: "lv3",
    employeeId: "emp8",
    agencyId: "grand-beta",
    type: "training",
    startsAt: isoOffsetDays(5, 0, 0),
    endsAt: isoOffsetDays(6, 0, 0),
    reason: "Formation lutte anti-blanchiment",
  },
  {
    id: "lv4",
    employeeId: "emp3",
    agencyId: "gambetta",
    type: "paid",
    startsAt: isoOffsetDays(8, 0, 0),
    endsAt: isoOffsetDays(12, 0, 0),
  },
  {
    id: "lv5",
    employeeId: "emp6",
    agencyId: "federbe",
    type: "unpaid",
    startsAt: isoOffsetDays(-10, 0, 0),
    endsAt: isoOffsetDays(-8, 0, 0),
    reason: "Déménagement",
  },
  {
    id: "lv6",
    employeeId: "emp9",
    agencyId: "grand-beta",
    type: "paid",
    startsAt: isoOffsetDays(10, 0, 0),
    endsAt: isoOffsetDays(14, 0, 0),
  },
];

let LEAVES: Leave[] = [...initialLeaves];

export function getAllLeaves(): Leave[] {
  return LEAVES;
}

export function getLeavesByAgency(agencyId: AgencySlug): Leave[] {
  return LEAVES.filter((l) => l.agencyId === agencyId);
}

export function getCurrentLeavesByAgency(agencyId: AgencySlug): Leave[] {
  const now = Date.now();
  return LEAVES.filter(
    (l) =>
      l.agencyId === agencyId &&
      new Date(l.startsAt).getTime() <= now &&
      new Date(l.endsAt).getTime() >= now
  );
}

export function getCurrentLeavesNetworkWide(): Leave[] {
  const now = Date.now();
  return LEAVES.filter(
    (l) =>
      new Date(l.startsAt).getTime() <= now &&
      new Date(l.endsAt).getTime() >= now
  );
}

export function getUpcomingLeavesByAgency(
  agencyId: AgencySlug,
  daysAhead = 14
): Leave[] {
  const now = Date.now();
  const horizon = now + daysAhead * 24 * 60 * 60 * 1000;
  return LEAVES.filter((l) => {
    if (l.agencyId !== agencyId) return false;
    const start = new Date(l.startsAt).getTime();
    const end = new Date(l.endsAt).getTime();
    // Tout congé qui chevauche l'intervalle [now, horizon]
    return end >= now && start <= horizon;
  }).sort(
    (a, b) =>
      new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
}

// ============================================================
// Observations agences
// ============================================================

export const OBSERVATION_STATUS_LABEL: Record<ObservationStatus, string> = {
  open: "Ouverte",
  resolved: "Résolue",
};

export const OBSERVATION_PRIORITY_LABEL: Record<ObservationPriority, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
};

const initialObservations: Observation[] = [
  // Gambetta
  {
    id: "obs1",
    agencyId: "gambetta",
    text: "Réparation porte d'entrée en attente — devis serrurier transmis à Pietro le 12/05.",
    authorName: "Sébastien",
    createdAt: isoOffsetDays(-2, 9, 0),
    status: "open",
    priority: "high",
  },
  {
    id: "obs2",
    agencyId: "gambetta",
    text: "Stock pochons sécurisés à recommander (reste 12 unités).",
    authorName: "Léa",
    createdAt: isoOffsetDays(-4, 14, 30),
    status: "open",
    priority: "normal",
  },
  {
    id: "obs3",
    agencyId: "gambetta",
    text: "Nettoyage hebdomadaire OK — vitrines impeccables.",
    authorName: "Marc",
    createdAt: isoOffsetDays(-6, 18, 0),
    resolvedAt: isoOffsetDays(-6, 18, 5),
    status: "resolved",
    priority: "low",
  },
  // Federbe
  {
    id: "obs4",
    agencyId: "federbe",
    text: "Vitrine LED côté gauche défectueuse — clignote par intermittence.",
    authorName: "Karim",
    createdAt: isoOffsetDays(-1, 11, 0),
    status: "open",
    priority: "high",
  },
  {
    id: "obs5",
    agencyId: "federbe",
    text: "Tapis d'accueil très usé, à remplacer avant fin du mois.",
    authorName: "Sofia",
    createdAt: isoOffsetDays(-3, 16, 0),
    status: "open",
    priority: "normal",
  },
  {
    id: "obs6",
    agencyId: "federbe",
    text: "Alarme testée par Thémis — RAS.",
    authorName: "Karim",
    createdAt: isoOffsetDays(-10, 9, 30),
    resolvedAt: isoOffsetDays(-9, 10, 0),
    status: "resolved",
    priority: "low",
  },
  // Grand Béta
  {
    id: "obs7",
    agencyId: "grand-beta",
    text: "Imprimante caisse à bout de souffle — remplacement urgent recommandé.",
    authorName: "Audrey",
    createdAt: isoOffsetDays(-1, 15, 0),
    status: "open",
    priority: "high",
  },
  {
    id: "obs8",
    agencyId: "grand-beta",
    text: "Demander à Hugo (stagiaire) un retour écrit fin de stage.",
    authorName: "Audrey",
    createdAt: isoOffsetDays(-5, 17, 0),
    status: "open",
    priority: "low",
  },
  {
    id: "obs9",
    agencyId: "grand-beta",
    text: "Coffre vérifié — combinaison changée comme prévu.",
    authorName: "Tom",
    createdAt: isoOffsetDays(-8, 10, 0),
    resolvedAt: isoOffsetDays(-8, 11, 0),
    status: "resolved",
    priority: "normal",
  },
];

let OBSERVATIONS_LIST: Observation[] = [...initialObservations];

export function getAllObservations(): Observation[] {
  return OBSERVATIONS_LIST;
}

export function getObservationsByAgency(agencyId: AgencySlug): Observation[] {
  return OBSERVATIONS_LIST.filter((o) => o.agencyId === agencyId);
}

export function getOpenObservationsByAgency(
  agencyId: AgencySlug
): Observation[] {
  return OBSERVATIONS_LIST.filter(
    (o) => o.agencyId === agencyId && o.status === "open"
  );
}

const PRIORITY_RANK: Record<ObservationPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
};

export function getAllOpenObservations(
  priorityMin?: ObservationPriority
): Observation[] {
  const min = priorityMin ? PRIORITY_RANK[priorityMin] : 0;
  return OBSERVATIONS_LIST.filter(
    (o) => o.status === "open" && PRIORITY_RANK[o.priority] >= min
  ).sort(
    (a, b) =>
      PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
      (a.createdAt < b.createdAt ? 1 : -1)
  );
}

export function addObservation(
  agencyId: AgencySlug,
  text: string,
  authorName: string,
  priority: ObservationPriority
): string {
  const id = "obs" + (OBSERVATIONS_LIST.length + 1) + "-" + Date.now();
  const obs: Observation = {
    id,
    agencyId,
    text,
    authorName,
    createdAt: new Date().toISOString(),
    status: "open",
    priority,
  };
  OBSERVATIONS_LIST = [obs, ...OBSERVATIONS_LIST];
  return id;
}

export function resolveObservation(id: string): Observation | undefined {
  const idx = OBSERVATIONS_LIST.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const updated: Observation = {
    ...OBSERVATIONS_LIST[idx],
    status: "resolved",
    resolvedAt: new Date().toISOString(),
  };
  OBSERVATIONS_LIST = [
    ...OBSERVATIONS_LIST.slice(0, idx),
    updated,
    ...OBSERVATIONS_LIST.slice(idx + 1),
  ];
  return updated;
}
