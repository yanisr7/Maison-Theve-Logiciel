"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AgencySlug, Role } from "./types";
import { AGENCIES } from "./mock";
import { supabase } from "./supabase";

type AuthStatus = "loading" | "authed" | "anon";

type RoleContextValue = {
  status: AuthStatus;
  // Non-null pour les consommateurs : les pages ne sont rendues qu'une fois
  // authentifié (cf. AppShell), donc `role` y est toujours réel.
  role: Role;
  email: string | null;
  isPietro: boolean;
  isAgency: (slug: AgencySlug) => boolean;
  roleLabel: string;
  signOut: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue | null>(null);

// Fallback technique utilisé uniquement avant chargement du profil (jamais rendu
// car AppShell affiche un écran de chargement / redirige vers /login).
const FALLBACK_ROLE: Role = { kind: "agency", agencySlug: "gambetta" };

function roleFromProfile(p: {
  role: string;
  agency_slug: string | null;
}): Role {
  if (p.role === "admin") return { kind: "admin" };
  return { kind: "agency", agencySlug: (p.agency_slug ?? "gambetta") as AgencySlug };
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string, userEmail: string | null) => {
    const { data } = await supabase
      .from("profiles")
      .select("role, agency_slug, full_name")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      setRole(roleFromProfile(data));
      setFullName(data.full_name);
      setEmail(userEmail);
      setStatus("authed");
    } else {
      // Compte sans profil → traité comme non connecté
      setRole(null);
      setStatus("anon");
    }
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const session = data.session;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? null);
      } else {
        setStatus("anon");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        setStatus("loading");
        loadProfile(session.user.id, session.user.email ?? null);
      } else {
        setRole(null);
        setEmail(null);
        setFullName(null);
        setStatus("anon");
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
    setEmail(null);
    setFullName(null);
    setStatus("anon");
  }, []);

  const value = useMemo<RoleContextValue>(() => {
    const isPietro = role?.kind === "admin";
    const roleLabel =
      role == null
        ? ""
        : role.kind === "admin"
          ? fullName ?? "Pietro (Admin)"
          : fullName ??
            AGENCIES.find((a) => a.slug === role.agencySlug)?.name ??
            role.agencySlug;
    return {
      status,
      role: role ?? FALLBACK_ROLE,
      email,
      isPietro,
      isAgency: (slug: AgencySlug) =>
        role?.kind === "agency" && role.agencySlug === slug,
      roleLabel,
      signOut,
    };
  }, [role, email, fullName, status, signOut]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole() doit être utilisé dans <RoleProvider>");
  return ctx;
}
