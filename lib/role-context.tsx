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
  // `role` est le rôle EFFECTIF : pour un admin qui « voit en tant que » une
  // agence, il vaut { kind: "agency", ... }.
  role: Role;
  email: string | null;
  isPietro: boolean;
  isAgency: (slug: AgencySlug) => boolean;
  roleLabel: string;
  signOut: () => Promise<void>;
  // Compte réellement administrateur (indépendant du « voir en tant que »).
  isAdminAccount: boolean;
  // Agence visualisée par l'admin (null = « Toutes les agences » / Vue 360°).
  viewAs: AgencySlug | null;
  setViewAs: (slug: AgencySlug | null) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const VIEWAS_KEY = "mtl.viewAs";

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
  const [viewAs, setViewAsState] = useState<AgencySlug | null>(null);

  // Restaure le contexte « voir en tant que » (admin) depuis le navigateur.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEWAS_KEY);
      if (raw) setViewAsState(raw as AgencySlug);
    } catch {
      // ignore
    }
  }, []);

  const setViewAs = useCallback((slug: AgencySlug | null) => {
    setViewAsState(slug);
    try {
      if (slug) window.localStorage.setItem(VIEWAS_KEY, slug);
      else window.localStorage.removeItem(VIEWAS_KEY);
    } catch {
      // ignore
    }
  }, []);

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
    setViewAs(null);
    setStatus("anon");
  }, [setViewAs]);

  const value = useMemo<RoleContextValue>(() => {
    const isAdminAccount = role?.kind === "admin";
    // Rôle effectif : un admin qui « voit en tant que » une agence se comporte
    // comme cette agence dans toute l'appli.
    const effectiveRole: Role | null =
      role == null
        ? null
        : isAdminAccount && viewAs
          ? { kind: "agency", agencySlug: viewAs }
          : role;
    const isPietro = effectiveRole?.kind === "admin";
    const roleLabel = fullName ?? (isAdminAccount ? "Pietro (Admin)" : "");
    return {
      status,
      role: effectiveRole ?? FALLBACK_ROLE,
      email,
      isPietro,
      isAgency: (slug: AgencySlug) =>
        effectiveRole?.kind === "agency" && effectiveRole.agencySlug === slug,
      roleLabel,
      signOut,
      isAdminAccount: !!isAdminAccount,
      viewAs,
      setViewAs,
    };
  }, [role, email, fullName, status, signOut, viewAs, setViewAs]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole() doit être utilisé dans <RoleProvider>");
  return ctx;
}
