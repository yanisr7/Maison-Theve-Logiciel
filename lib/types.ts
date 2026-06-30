export type AgencySlug =
  | "gambetta"
  | "federbe"
  | "le-touquet"
  | "abbeville"
  | "saint-omer"
  | "dunkerque"
  | "valenciennes"
  | "arras"
  | "abidjan";

export type Agency = {
  slug: AgencySlug;
  name: string;
  address: string;
  manager: string;
};

export type Transporter = "Thémis" | "Elite" | "Interne" | "Pietro";

export type TransitStatus =
  | "pending"
  | "validated"
  | "in_transit"
  | "received"
  | "paid_unverified"
  | "closed"
  | "refused";

export type TransitEvent = {
  date: string;
  label: string;
  by: string; // qui a fait l'action (Gambetta / Federbe / Pietro)
};

export type Transit = {
  id: string;
  reference: string; // TR-2026-XXXX
  from: AgencySlug;
  to: AgencySlug;
  transporter: Transporter;
  description: string;
  amount: number; // montant en euros — affiché sur la facture, utilisé par Pietro pour la vérification bancaire
  status: TransitStatus;
  createdAt: string;
  createdBy?: string; // nom du cambiste qui a émis le bon (ex: "Victor Rico")
  departAt?: string; // date de départ prévue (renseignée à la création)
  expectedAt?: string; // date d'arrivée prévue (renseignée à la création)
  events: TransitEvent[];
  invoiceNumber?: string;
  refusalReason?: string;
};

// === Référentiel produits / lingots ===
// Permet de remplir descriptif + montant en un clic à la création d'un bon.

export type ProductCategory = "lingot" | "piece" | "bijou" | "autre";

export type ProductRef = {
  id: string;
  label: string; // "Lingot 250 g"
  category: ProductCategory;
  unitPrice: number; // prix unitaire indicatif en euros
};

export type Role =
  | { kind: "agency"; agencySlug: AgencySlug }
  | { kind: "admin" };

// === Point Relais ===

export type PaymentMethod = "virement" | "carte" | "espèces" | "autre";

export type PickupStatus = "incoming" | "available" | "picked_up";

export type Pickup = {
  id: string;
  parisOrderRef: string; // ex: GOD-2026-12345
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  paymentMethod: PaymentMethod;
  destinationAgencyId: AgencySlug;
  transporter: Transporter;
  status: PickupStatus;
  createdAt: string;
};

// === RDV Clients ===

export type AppointmentStatus =
  | "scheduled"
  | "done"
  | "cancelled"
  | "rescheduled";

export type Appointment = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  reason: string;
  agencyId: AgencySlug;
  scheduledAt: string; // ISO
  status: AppointmentStatus;
  rescheduledAt?: string;
};

// === Avis Clients ===

export type ReviewSource = "pickup" | "appointment";

export type Review = {
  id: string;
  clientName: string;
  source: ReviewSource;
  sourceId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  agencyId: AgencySlug;
};

// === Documents légaux par agence ===

export type DocumentStatus =
  | "up_to_date"
  | "expiring_soon"
  | "expired"
  | "missing";

export type DocumentCategory =
  | "kbis"
  | "declaration"
  | "id"
  | "assurance" // attestation d'assurance
  | "entretien" // état de l'agence : menuiserie, peinture, électricité
  | "securite" // registre de sécurité (passages, contrôles)
  | "medical" // visites médicales / médecine du travail
  | "extincteur" // visite périodique des extincteurs
  | "casier" // casier judiciaire B2 (annuel, par personne)
  | "other";

// Regroupement des catégories en sections d'onglets (page Documents)
export type DocumentSection = "administratif" | "etat" | "obligations";

export type LegalDocument = {
  id: string;
  agencyId: AgencySlug;
  name: string;
  category: DocumentCategory;
  fileName?: string;
  uploadedAt?: string;
  expiresAt?: string;
  status: DocumentStatus;
};

// === Équipe & planning ===

export type EmployeeRole = "responsable" | "cambiste" | "apprenti" | "stagiaire";

export type Employee = {
  id: string;
  agencyId: AgencySlug;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  startedAt: string;
};

export type LeaveType = "paid" | "unpaid" | "sick" | "training";

export type Leave = {
  id: string;
  employeeId: string;
  agencyId: AgencySlug;
  type: LeaveType;
  startsAt: string;
  endsAt: string;
  reason?: string;
};

// === Observations agences ===

export type ObservationStatus = "open" | "resolved";
export type ObservationPriority = "low" | "normal" | "high";

export type Observation = {
  id: string;
  agencyId: AgencySlug;
  text: string;
  authorName: string;
  createdAt: string;
  resolvedAt?: string;
  status: ObservationStatus;
  priority: ObservationPriority;
};

// === Cas de figure (retours d'expérience / alertes terrain) ===
// Ex: client aux fausses devises, faux billets, typologie de client à surveiller.

export type CasType =
  | "fausse_monnaie"
  | "faux_bijou"
  | "client_suspect"
  | "tentative_vol"
  | "autre";

export type CasSeverity = "info" | "warning" | "danger";

export type CasDeFigure = {
  id: string;
  agencyId: AgencySlug;
  type: CasType;
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
  severity: CasSeverity;
};

// === Propositions d'amélioration du logiciel ===

export type ProposalStatus = "new" | "planned" | "done" | "declined";

export type Proposal = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorRole: "admin" | "agency";
  agencySlug: AgencySlug | null;
  status: ProposalStatus;
  createdAt: string;
};

// === Messagerie interne (1-à-1) ===
// Une "partie" est identifiée par une clé : "admin" (Pietro) ou un slug d'agence.

export type ParticipantKey = "admin" | AgencySlug;

export type Message = {
  id: string;
  fromKey: ParticipantKey;
  toKey: ParticipantKey;
  body: string;
  createdAt: string;
  readAt: string | null;
};

// Résumé d'une conversation pour le listing.
export type ConversationSummary = {
  otherKey: ParticipantKey;
  lastBody: string;
  lastAt: string;
  unread: number;
};
