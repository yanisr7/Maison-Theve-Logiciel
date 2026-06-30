import { cn } from "@/lib/utils";

// Bloc de chargement "pulsant" — remplace les "Chargement…" pour un rendu fluide.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-muted", className)}
    />
  );
}
