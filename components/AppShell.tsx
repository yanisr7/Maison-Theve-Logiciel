"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/lib/role-context";
import { Sidebar } from "./Sidebar";

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 bg-muted/30">
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
