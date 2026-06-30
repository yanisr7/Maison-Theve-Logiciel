"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/lib/role-context";
import { Nav } from "./Nav";

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      {children}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { status } = useRole();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (status === "anon" && !isLogin) router.replace("/login");
    if (status === "authed" && isLogin) router.replace("/");
  }, [status, isLogin, router]);

  // Page de connexion : pas de Nav, rendue telle quelle.
  if (isLogin) return <>{children}</>;

  if (status === "loading") return <FullScreen>Chargement…</FullScreen>;
  if (status === "anon") return <FullScreen>Redirection…</FullScreen>;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </>
  );
}
