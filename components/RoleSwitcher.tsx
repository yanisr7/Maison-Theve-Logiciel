"use client";

import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/types";

const ROLES: { value: string; label: string; role: Role }[] = [
  { value: "gambetta", label: "Gambetta", role: { kind: "agency", agencySlug: "gambetta" } },
  { value: "federbe", label: "Federbe", role: { kind: "agency", agencySlug: "federbe" } },
  { value: "grand-beta", label: "Grand Béta", role: { kind: "agency", agencySlug: "grand-beta" } },
  { value: "admin", label: "Pietro (Admin)", role: { kind: "admin" } },
];

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  const current =
    role.kind === "admin" ? "admin" : role.agencySlug;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-xs uppercase tracking-[0.18em] text-cream-dim sm:inline">
        Connecté en tant que
      </span>
      <select
        value={current}
        onChange={(e) => {
          const next = ROLES.find((r) => r.value === e.target.value);
          if (next) setRole(next.role);
        }}
        className="rounded-md border border-cream-faint bg-dark3 px-3 py-2 text-cream outline-none transition-colors hover:border-gold focus:border-gold"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value} className="bg-dark2 text-cream">
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
