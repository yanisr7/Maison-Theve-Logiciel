export type AgencySlug = "gambetta" | "federbe";

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
  status: TransitStatus;
  createdAt: string;
  events: TransitEvent[];
  invoiceNumber?: string;
  refusalReason?: string;
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

export type DocumentCategory = "kbis" | "declaration" | "id" | "other";

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
