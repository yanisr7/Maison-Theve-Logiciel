import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffSec) < 60)
    return diffSec >= 0 ? "à l'instant" : "dans quelques secondes";
  if (Math.abs(diffMin) < 60)
    return diffMin >= 0
      ? `il y a ${diffMin} min`
      : `dans ${Math.abs(diffMin)} min`;
  if (Math.abs(diffHour) < 24)
    return diffHour >= 0
      ? `il y a ${diffHour} h`
      : `dans ${Math.abs(diffHour)} h`;
  if (Math.abs(diffDay) < 30)
    return diffDay >= 0
      ? `il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`
      : `dans ${Math.abs(diffDay)} jour${Math.abs(diffDay) > 1 ? "s" : ""}`;
  return formatDate(date);
}

const AMOUNT_FORMATTER = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatAmount(n: number): string {
  return AMOUNT_FORMATTER.format(n);
}

export function yearsSince(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  let months = now.getMonth() - date.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0 && months <= 0) return "moins d'un mois";
  if (years <= 0) return `${months} mois`;
  if (months === 0) return `${years} an${years > 1 ? "s" : ""}`;
  return `${years} an${years > 1 ? "s" : ""} ${months} mois`;
}
