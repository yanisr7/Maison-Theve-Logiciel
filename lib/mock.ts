import type {
  Agency,
  AgencySlug,
  Appointment,
  AppointmentStatus,
  CasDeFigure,
  CasType,
  DocumentCategory,
  DocumentSection,
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
  ProductRef,
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
    slug: "le-touquet",
    name: "Le Touquet",
    address: "5 rue Saint-Jean, 62520 Le Touquet-Paris-Plage",
    manager: "Camille",
  },
  {
    slug: "abbeville",
    name: "Abbeville",
    address: "18 place du Pilori, 80100 Abbeville",
    manager: "Damien",
  },
  {
    slug: "saint-omer",
    name: "Saint-Omer",
    address: "9 rue des Clouteries, 62500 Saint-Omer",
    manager: "Nathalie",
  },
  {
    slug: "dunkerque",
    name: "Dunkerque",
    address: "22 rue Clemenceau, 59140 Dunkerque",
    manager: "Patrick",
  },
  {
    slug: "valenciennes",
    name: "Valenciennes",
    address: "14 rue de Famars, 59300 Valenciennes",
    manager: "Élodie",
  },
  {
    slug: "arras",
    name: "Arras",
    address: "8 Grand-Place, 62000 Arras",
    manager: "Romain",
  },
  {
    slug: "abidjan",
    name: "Abidjan",
    address: "Plateau, Boulevard de la République, Abidjan (Côte d'Ivoire)",
    manager: "Yao",
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
    amount: 18750,
    status: "pending",
    createdAt: "2026-05-18T09:14:00",
    createdBy: "Victor Rico",
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
    amount: 2380,
    status: "validated",
    createdAt: "2026-05-17T15:02:00",
    createdBy: "Léa Martin",
    events: [
      { date: "2026-05-17T15:02:00", label: "Bon créé", by: "Gambetta" },
      { date: "2026-05-17T16:10:00", label: "Validé par destinataire", by: "Federbe" },
    ],
  },
  {
    id: "t4",
    reference: "TR-2026-0004",
    from: "gambetta",
    to: "federbe",
    transporter: "Thémis",
    description: "2 lingots 500g + lot bijoux fantaisie",
    amount: 67400,
    status: "received",
    createdAt: "2026-05-14T09:45:00",
    createdBy: "Victor Rico",
    events: [
      { date: "2026-05-14T09:45:00", label: "Bon créé", by: "Gambetta" },
      { date: "2026-05-14T10:00:00", label: "Validé par destinataire", by: "Federbe" },
      { date: "2026-05-14T15:00:00", label: "Expédié", by: "Gambetta" },
      { date: "2026-05-15T10:12:00", label: "Réceptionné", by: "Federbe" },
    ],
  },
  {
    id: "t6",
    reference: "TR-2026-0006",
    from: "gambetta",
    to: "federbe",
    transporter: "Thémis",
    description: "1 lingot 1kg + 8 Napoléons + lot dentaire 22g",
    amount: 92150,
    status: "closed",
    createdAt: "2026-05-02T10:00:00",
    createdBy: "Sébastien Dubois",
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
    amount: 1213,
    status: "refused",
    createdAt: "2026-05-09T13:00:00",
    createdBy: "Sofia Garcia",
    refusalReason: "Descriptif insuffisant, photo manquante. À refaire avec détails poids/titres.",
    events: [
      { date: "2026-05-09T13:00:00", label: "Bon créé", by: "Federbe" },
      { date: "2026-05-09T14:20:00", label: "Refusé par destinataire", by: "Gambetta" },
    ],
  },
  {
    id: "t8",
    reference: "TR-2026-0008",
    from: "valenciennes",
    to: "arras",
    transporter: "Elite",
    description: "3 lingots 100g + 12 Napoléons 20F",
    amount: 24600,
    status: "in_transit",
    createdAt: "2026-05-19T11:30:00",
    createdBy: "Romain Delcourt",
    events: [
      { date: "2026-05-19T11:30:00", label: "Bon créé", by: "Valenciennes" },
      { date: "2026-05-19T13:00:00", label: "Validé par destinataire", by: "Arras" },
      { date: "2026-05-19T16:45:00", label: "Expédié", by: "Valenciennes" },
    ],
  },
  {
    id: "t9",
    reference: "TR-2026-0009",
    from: "le-touquet",
    to: "gambetta",
    transporter: "Thémis",
    description: "Lot souverains GB (15 pièces) + 1 lingot 50g",
    amount: 8900,
    status: "pending",
    createdAt: "2026-05-20T10:05:00",
    createdBy: "Camille Forestier",
    events: [
      { date: "2026-05-20T10:05:00", label: "Bon créé", by: "Le Touquet" },
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
// Référentiel produits / lingots
// ============================================================
// À la création d'un bon, le cambiste peut cliquer un produit du référentiel
// pour pré-remplir le descriptif et le montant (limite les erreurs de saisie).

export const PRODUCT_CATALOG: ProductRef[] = [
  { id: "lingot-1kg", label: "Lingot 1 kg", category: "lingot", unitPrice: 92000 },
  { id: "lingot-500g", label: "Lingot 500 g", category: "lingot", unitPrice: 46000 },
  { id: "lingot-250g", label: "Lingot 250 g", category: "lingot", unitPrice: 23000 },
  { id: "lingot-100g", label: "Lingot 100 g", category: "lingot", unitPrice: 9200 },
  { id: "lingot-50g", label: "Lingot 50 g", category: "lingot", unitPrice: 4600 },
  { id: "lingot-20g", label: "Lingot 20 g", category: "lingot", unitPrice: 1850 },
  { id: "lingot-10g", label: "Lingot 10 g", category: "lingot", unitPrice: 930 },
  { id: "lingot-5g", label: "Lingot 5 g", category: "lingot", unitPrice: 470 },
  { id: "napoleon-20f", label: "Napoléon 20 F", category: "piece", unitPrice: 480 },
  { id: "souverain-gb", label: "Souverain GB", category: "piece", unitPrice: 610 },
  { id: "krugerrand-1oz", label: "Krugerrand 1 oz", category: "piece", unitPrice: 2950 },
  { id: "vreneli-20chf", label: "Vreneli 20 CHF", category: "piece", unitPrice: 480 },
  { id: "chaine-18k-g", label: "Chaîne or 18k (au gramme)", category: "bijou", unitPrice: 68 },
  { id: "alliance-18k", label: "Alliance or 18k", category: "bijou", unitPrice: 320 },
];

export function getProductCatalog(): ProductRef[] {
  return PRODUCT_CATALOG;
}

export function getProduct(id: string): ProductRef | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id);
}

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
    id: "rev5",
    clientName: "Antoine Bernard",
    source: "pickup",
    sourceId: "p4",
    rating: 5,
    comment: "Super réactif, livraison plus rapide qu'annoncée.",
    createdAt: isoOffsetDays(-5, 10, 0),
    agencyId: "gambetta",
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
  assurance: "Attestation d'assurance",
  entretien: "État / entretien agence",
  securite: "Registre de sécurité",
  medical: "Visite médicale",
  extincteur: "Extincteurs",
  casier: "Casier judiciaire B2",
  other: "Autre",
};

// Onglets de la page Documents : 3 sections regroupant les catégories.
export const DOCUMENT_SECTION_LABEL: Record<DocumentSection, string> = {
  administratif: "Documents administratifs",
  etat: "État de l'agence",
  obligations: "Obligations légales",
};

export const DOCUMENT_CATEGORY_SECTION: Record<DocumentCategory, DocumentSection> = {
  kbis: "administratif",
  declaration: "administratif",
  id: "administratif",
  assurance: "administratif",
  entretien: "etat",
  securite: "obligations",
  medical: "obligations",
  extincteur: "obligations",
  casier: "obligations",
  other: "administratif",
};

export function getDocumentsBySection(
  agencyId: AgencySlug,
  section: DocumentSection
): LegalDocument[] {
  return DOCUMENTS.filter(
    (d) =>
      d.agencyId === agencyId &&
      DOCUMENT_CATEGORY_SECTION[d.category] === section
  );
}

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
  // --- Gambetta : état + obligations légales ---
  {
    id: "doc9",
    agencyId: "gambetta",
    name: "Attestation assurance multirisque",
    category: "assurance",
    fileName: "assurance-gambetta-2026.pdf",
    uploadedAt: isoOffsetDays(-60, 9, 0),
    expiresAt: isoOffsetDays(300, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc10",
    agencyId: "gambetta",
    name: "État des lieux — menuiserie / peinture / électricité",
    category: "entretien",
    fileName: "etat-gambetta-2026.pdf",
    uploadedAt: isoOffsetDays(-120, 10, 0),
    status: "up_to_date",
  },
  {
    id: "doc11",
    agencyId: "gambetta",
    name: "Registre de sécurité (passages & contrôles)",
    category: "securite",
    fileName: "registre-securite-gambetta.pdf",
    uploadedAt: isoOffsetDays(-20, 11, 0),
    status: "up_to_date",
  },
  {
    id: "doc12",
    agencyId: "gambetta",
    name: "Visites médicales — synthèse salariés",
    category: "medical",
    fileName: "visites-medicales-gambetta.pdf",
    uploadedAt: isoOffsetDays(-200, 9, 0),
    expiresAt: isoOffsetDays(20, 0, 0),
    status: "expiring_soon",
  },
  {
    id: "doc13",
    agencyId: "gambetta",
    name: "Vérification périodique extincteurs",
    category: "extincteur",
    fileName: "extincteurs-gambetta-2025.pdf",
    uploadedAt: isoOffsetDays(-400, 14, 0),
    expiresAt: isoOffsetDays(-35, 0, 0),
    status: "expired",
  },
  {
    id: "doc14",
    agencyId: "gambetta",
    name: "Casier judiciaire B2 — Sébastien Dubois",
    category: "casier",
    fileName: "b2-sebastien-2026.pdf",
    uploadedAt: isoOffsetDays(-90, 9, 0),
    expiresAt: isoOffsetDays(275, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc15",
    agencyId: "gambetta",
    name: "Casier judiciaire B2 — Léa Martin",
    category: "casier",
    status: "missing",
  },
  // --- Federbe : état + obligations légales ---
  {
    id: "doc16",
    agencyId: "federbe",
    name: "Attestation assurance multirisque",
    category: "assurance",
    fileName: "assurance-federbe-2026.pdf",
    uploadedAt: isoOffsetDays(-50, 9, 0),
    expiresAt: isoOffsetDays(310, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc17",
    agencyId: "federbe",
    name: "État des lieux — menuiserie / peinture / électricité",
    category: "entretien",
    fileName: "etat-federbe-2026.pdf",
    uploadedAt: isoOffsetDays(-110, 10, 0),
    status: "up_to_date",
  },
  {
    id: "doc18",
    agencyId: "federbe",
    name: "Registre de sécurité (passages & contrôles)",
    category: "securite",
    status: "missing",
  },
  {
    id: "doc19",
    agencyId: "federbe",
    name: "Visites médicales — synthèse salariés",
    category: "medical",
    fileName: "visites-medicales-federbe.pdf",
    uploadedAt: isoOffsetDays(-150, 9, 0),
    expiresAt: isoOffsetDays(120, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc20",
    agencyId: "federbe",
    name: "Vérification périodique extincteurs",
    category: "extincteur",
    fileName: "extincteurs-federbe-2026.pdf",
    uploadedAt: isoOffsetDays(-30, 14, 0),
    expiresAt: isoOffsetDays(335, 0, 0),
    status: "up_to_date",
  },
  {
    id: "doc21",
    agencyId: "federbe",
    name: "Casier judiciaire B2 — Karim Benali",
    category: "casier",
    fileName: "b2-karim-2026.pdf",
    uploadedAt: isoOffsetDays(-70, 9, 0),
    expiresAt: isoOffsetDays(295, 0, 0),
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

// ============================================================
// Cas de figure (retours d'expérience / alertes terrain)
// ============================================================

export const CAS_TYPE_LABEL: Record<CasType, string> = {
  fausse_monnaie: "Fausses devises",
  faux_bijou: "Faux bijou / contrefaçon",
  client_suspect: "Client à surveiller",
  tentative_vol: "Tentative de vol",
  autre: "Autre",
};

const initialCasDeFigure: CasDeFigure[] = [
  {
    id: "cas1",
    agencyId: "gambetta",
    type: "fausse_monnaie",
    title: "Client présentant de faux billets de 50 €",
    description:
      "Un client a tenté de régler un achat avec plusieurs billets de 50 € détectés faux au stylo. Refus poli, client reparti sans incident. Signalement transmis.",
    authorName: "Léa Martin",
    createdAt: isoOffsetDays(-2, 16, 30),
    severity: "danger",
  },
  {
    id: "cas2",
    agencyId: "gambetta",
    type: "faux_bijou",
    title: "Lot de « Napoléons » plaqués présentés comme or massif",
    description:
      "Estimation demandée sur 8 pièces se révélant plaquées. Vérification densité + aimant. Bon réflexe : toujours tester avant estimation.",
    authorName: "Victor Rico",
    createdAt: isoOffsetDays(-6, 11, 0),
    severity: "warning",
  },
  {
    id: "cas3",
    agencyId: "federbe",
    type: "client_suspect",
    title: "Individu repérant les vitrines à plusieurs reprises",
    description:
      "Même personne passée 3 fois dans la semaine, photographie discrètement l'agencement. Vigilance renforcée, alerte voisins commerçants.",
    authorName: "Karim Benali",
    createdAt: isoOffsetDays(-1, 18, 0),
    severity: "warning",
  },
  {
    id: "cas4",
    agencyId: "federbe",
    type: "tentative_vol",
    title: "Tentative de vol à l'étalage déjouée",
    description:
      "Client a tenté de dissimuler une chaîne pendant l'essayage. Récupérée, client invité à quitter les lieux. RAS depuis.",
    authorName: "Sofia Garcia",
    createdAt: isoOffsetDays(-9, 15, 30),
    severity: "danger",
  },
];

let CAS_LIST: CasDeFigure[] = [...initialCasDeFigure];

export function getAllCasDeFigure(): CasDeFigure[] {
  return CAS_LIST;
}

export function getCasDeFigureByAgency(agencyId: AgencySlug): CasDeFigure[] {
  return CAS_LIST.filter((c) => c.agencyId === agencyId);
}

export function addCasDeFigure(
  input: Omit<CasDeFigure, "id" | "createdAt">
): CasDeFigure {
  const id = "cas" + (CAS_LIST.length + 1) + "-" + Date.now();
  const c: CasDeFigure = { ...input, id, createdAt: new Date().toISOString() };
  CAS_LIST = [c, ...CAS_LIST];
  return c;
}
