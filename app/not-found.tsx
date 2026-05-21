import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
        404
      </p>
      <h1 className="mt-2 font-serif text-4xl text-foreground">
        Page introuvable
      </h1>
      <p className="mt-2 text-muted-foreground">
        Ce que vous cherchez n&apos;existe pas (encore).
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
