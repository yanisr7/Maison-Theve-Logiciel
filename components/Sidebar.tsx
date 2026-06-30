"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/lib/role-context";
import { AGENCIES, agencyBySlug } from "@/lib/mock";
import { getAllProposals, getProposalsByAgency } from "@/lib/proposals-db";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Truck,
  Package,
  CalendarClock,
  Plus,
  LogOut,
  Building2,
  Globe,
  ChevronsUpDown,
  Check,
  FileText,
  Users,
  ClipboardList,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
};

export function Sidebar() {
  const { role, isPietro, isAdminAccount, viewAs, setViewAs, roleLabel, signOut } =
    useRole();
  const pathname = usePathname() ?? "";
  const router = useRouter();

  // Nombre de propositions « nouvelles » (non traitées) → badge rouge.
  const [newProposals, setNewProposals] = useState(0);
  const proposalScope =
    role.kind === "agency" ? role.agencySlug : isPietro ? "__all__" : null;
  useEffect(() => {
    let active = true;
    const fetchCount = async () => {
      try {
        const data =
          proposalScope === "__all__"
            ? await getAllProposals()
            : proposalScope
              ? await getProposalsByAgency(proposalScope)
              : [];
        if (active) setNewProposals(data.filter((p) => p.status === "new").length);
      } catch {
        if (active) setNewProposals(0);
      }
    };
    fetchCount();
    return () => {
      active = false;
    };
  }, [proposalScope]);

  const agencyHref =
    role.kind === "agency" ? `/agence/${role.agencySlug}` : "/admin";

  const mainItems: NavItem[] = [
    // Dashboard = contexte effectif : Vue 360° (/admin) si « Toutes les agences »,
    // sinon le dashboard de l'agence affichée (/agence/[slug]).
    { href: agencyHref, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { href: "/transit", label: "Transit", icon: Truck },
    { href: "/colis", label: "Bien confié", icon: Package },
    { href: "/rdv", label: "RDV", icon: CalendarClock },
    {
      href: "/propositions",
      label: "Améliorations",
      icon: Lightbulb,
      badge: newProposals,
    },
  ];
  // Sous-pages d'agence : visibles quand un contexte agence est actif
  // (compte agence, ou admin ayant sélectionné une agence via le dropdown).
  const agencySlug = role.kind === "agency" ? role.agencySlug : null;
  const agencyItems: NavItem[] = agencySlug
    ? [
        {
          href: `/agence/${agencySlug}/documents`,
          label: "Documents légaux",
          icon: FileText,
        },
        {
          href: `/agence/${agencySlug}/equipe`,
          label: "Équipe",
          icon: Users,
        },
        {
          href: `/agence/${agencySlug}/observations`,
          label: "Observations",
          icon: ClipboardList,
        },
        {
          href: `/agence/${agencySlug}/cas-de-figure`,
          label: "Cas de figure",
          icon: ShieldAlert,
        },
      ]
    : [];

  const actionItems: NavItem[] = [
    { href: "/transit/nouveau", label: "Nouveau bon", icon: Plus },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact || href === "/"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const renderItem = (l: NavItem) => {
    const active = isActive(l.href, l.exact);
    const Icon = l.icon;
    return (
      <Link
        key={l.href}
        href={l.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-[var(--gold)] text-white shadow-sm"
            : "text-muted-foreground hover:bg-[var(--gold)]/10 hover:text-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1">{l.label}</span>
        {l.badge && l.badge > 0 ? (
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
              active ? "bg-white text-red-600" : "bg-red-500 text-white"
            )}
          >
            {l.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  // Contexte admin : "Toutes les agences" (Vue 360°) ou une agence visualisée.
  const selectAll = () => {
    setViewAs(null);
    router.push("/admin");
  };
  const selectAgency = (slug: typeof AGENCIES[number]["slug"]) => {
    setViewAs(slug);
    router.push(`/agence/${slug}`);
  };
  const currentContextLabel = viewAs
    ? agencyBySlug(viewAs).name
    : "Toutes les agences";

  const initials =
    roleLabel
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-[var(--sidebar)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gold)] font-bold text-white"
        >
          G
        </span>
        <span className="text-lg font-bold tracking-tight text-foreground">
          Godot &amp; Fils
        </span>
      </div>

      {/* Sélecteur d'agence — admin uniquement */}
      {isAdminAccount && (
        <div className="px-3 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-[var(--gold)]"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)]/12 text-[var(--gold)]">
                  {viewAs ? (
                    <Building2 className="size-4" />
                  ) : (
                    <Globe className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {currentContextLabel}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {viewAs ? "Agence visualisée" : "Vue consolidée"}
                  </span>
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[232px] max-h-[70vh] overflow-y-auto"
            >
              <DropdownMenuLabel>Contexte</DropdownMenuLabel>
              <DropdownMenuItem onClick={selectAll} className="gap-2">
                <Globe className="size-4 text-[var(--gold)]" />
                <span className="flex-1">Toutes les agences</span>
                {!viewAs && <Check className="size-4 text-[var(--gold)]" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground">
                Agences
              </DropdownMenuLabel>
              {AGENCIES.map((a) => (
                <DropdownMenuItem
                  key={a.slug}
                  onClick={() => selectAgency(a.slug)}
                  className="gap-2"
                >
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{a.name}</span>
                  {viewAs === a.slug && (
                    <Check className="size-4 text-[var(--gold)]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            Pilotage
          </p>
          {mainItems.map(renderItem)}
        </div>
        {agencyItems.length > 0 && (
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              Agence
            </p>
            {agencyItems.map(renderItem)}
          </div>
        )}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            Actions
          </p>
          {actionItems.map(renderItem)}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15 text-sm font-semibold text-[var(--gold)]">
            {initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-foreground">
              {roleLabel}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {isAdminAccount ? "Administrateur" : "Agence"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            title="Déconnexion"
            aria-label="Déconnexion"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--gold)]/10 hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
