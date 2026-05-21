"use client";

import { useRole } from "@/lib/role-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role.kind === "admin") router.replace("/admin");
    else router.replace(`/agence/${role.agencySlug}`);
  }, [role, router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="text-cream-dim">Chargement…</p>
    </div>
  );
}
