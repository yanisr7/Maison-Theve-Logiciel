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
