import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/lib/role-context";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Godot & Fils — Intranet",
  description: "Outil de gestion interne Godot & Fils — transit, biens confiés, RDV, agences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <RoleProvider>
          <TooltipProvider delayDuration={200}>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="bottom-center" />
          </TooltipProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
