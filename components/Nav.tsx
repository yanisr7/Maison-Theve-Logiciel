"use client";

import Link from "next/link";
import { useRole } from "@/lib/role-context";
import { RoleSwitcher } from "./RoleSwitcher";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Nav() {
  const { role, isPietro } = useRole();
  const pathname = usePathname() ?? "";

  const agencyHref =
    role.kind === "agency" ? `/agence/${role.agencySlug}` : "/admin";

  const links: { href: string; label: string }[] = [
    { href: agencyHref, label: isPietro ? "Vue 360°" : "Mon agence" },
    { href: "/transit", label: "Transit" },
    { href: "/colis", label: "Bien confié" },
    { href: "/rdv", label: "RDV" },
    { href: "/transit/nouveau", label: "Nouveau bon" },
  ];
  if (isPietro) {
    links.push({ href: "/admin", label: "Admin Pietro" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)] font-serif text-lg"
          >
            G
          </span>
          <span className="font-serif text-lg text-foreground">Godot &amp; Fils</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <RoleSwitcher />
      </div>
    </header>
  );
}
