"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AgencySlug, Role } from "./types";

const STORAGE_KEY = "mtl.role";

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
  isPietro: boolean;
  isAgency: (slug: AgencySlug) => boolean;
  roleLabel: string;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const DEFAULT_ROLE: Role = { kind: "agency", agencySlug: "gambetta" };

function safeRead(): Role {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROLE;
    const parsed = JSON.parse(raw) as Role;
    if (parsed?.kind === "admin") return parsed;
    if (parsed?.kind === "agency" && parsed.agencySlug) return parsed;
    return DEFAULT_ROLE;
  } catch {
    return DEFAULT_ROLE;
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRoleState(safeRead());
    setHydrated(true);
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<RoleContextValue>(() => {
    const isPietro = role.kind === "admin";
    const roleLabel =
      role.kind === "admin"
        ? "Pietro (Admin)"
        : role.agencySlug === "gambetta"
          ? "Gambetta"
          : "Federbe";
    return {
      role,
      setRole,
      isPietro,
      isAgency: (slug: AgencySlug) => role.kind === "agency" && role.agencySlug === slug,
      roleLabel,
    };
  }, [role, setRole]);

  // Empêche un flash de mauvais rôle au premier rendu côté client (mais on SSR quand même)
  if (!hydrated) {
    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole() doit être utilisé dans <RoleProvider>");
  return ctx;
}
