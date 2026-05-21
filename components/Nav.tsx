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
    { href: "/transit/nouveau", label: "Nouveau bon" },
  ];
  if (isPietro) {
    links.push({ href: "/admin", label: "Admin Pietro" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cream-faint bg-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold text-gold"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            G
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg text-cream">Godot &amp; Fils</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-cream-dim">
              Maison Théve Logiciel
            </span>
          </span>
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
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-gold-dim text-cream"
                    : "text-cream-dim hover:bg-cream-faint hover:text-cream"
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
