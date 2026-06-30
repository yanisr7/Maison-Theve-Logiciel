"use client";

import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/types";
import { AGENCIES } from "@/lib/mock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES: { value: string; label: string; role: Role }[] = [
  ...AGENCIES.map((a) => ({
    value: a.slug,
    label: a.name,
    role: { kind: "agency", agencySlug: a.slug } as Role,
  })),
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
