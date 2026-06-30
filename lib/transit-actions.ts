import type { Role, Transit } from "./types";

// Un transit "attend une action de ma part" selon le rôle effectif :
// - Admin (Pietro, vue consolidée) : virements à vérifier (paid_unverified).
// - Agence : valider un bon entrant en attente, expédier un bon sortant validé,
//   réceptionner un bon entrant en transit, déclarer le paiement d'un bon reçu.
export function transitNeedsAction(t: Transit, role: Role): boolean {
  if (role.kind === "admin") {
    return t.status === "paid_unverified";
  }
  const slug = role.agencySlug;
  const isSender = t.from === slug;
  const isRecipient = t.to === slug;
  return (
    (t.status === "pending" && isRecipient) ||
    (t.status === "validated" && isSender) ||
    (t.status === "in_transit" && isRecipient) ||
    (t.status === "received" && isRecipient)
  );
}
