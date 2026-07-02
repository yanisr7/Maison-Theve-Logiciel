"use client";

import { useRole } from "@/lib/role-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { role, status } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "anon") {
      router.replace("/login");
      return;
    }
    // Connecté → dashboard du contexte effectif.
    if (role.kind === "admin") router.replace("/admin");
    else router.replace(`/agence/${role.agencySlug}`);
  }, [role, status, router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Chargement…</p>
    </div>
  );
}
