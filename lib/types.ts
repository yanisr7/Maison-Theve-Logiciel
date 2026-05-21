export type AgencySlug = "gambetta" | "federbe" | "grand-beta";

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
