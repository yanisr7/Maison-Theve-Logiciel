"use client";

import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES: { value: string; label: string; role: Role }[] = [
  { value: "gambetta", label: "Gambetta", role: { kind: "agency", agencySlug: "gambetta" } },
  { value: "federbe", label: "Federbe", role: { kind: "agency", agencySlug: "federbe" } },
  { value: "grand-beta", label: "Grand Béta", role: { kind: "agency", agencySlug: "grand-beta" } },
  { value: "admin", label: "Pietro (Admin)", role: { kind: "admin" } },
];

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  const current = role.kind === "admin" ? "admin" : role.agencySlug;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline">
        Connecté en tant que
      </span>
      <Select
        value={current}
        onValueChange={(v) => {
          const next = ROLES.find((r) => r.value === v);
          if (next) setRole(next.role);
        }}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
