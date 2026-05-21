import type {
  Agency,
  AgencySlug,
  Appointment,
  AppointmentStatus,
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
