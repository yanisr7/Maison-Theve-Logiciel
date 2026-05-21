import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-gold">404</p>
      <h1 className="mt-2 font-serif text-4xl text-cream">Page introuvable</h1>
      <p className="mt-2 text-cream-dim">
        Ce que vous cherchez n&apos;existe pas (encore).
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-gold px-4 py-2 text-sm font-medium text-[var(--dark)] hover:bg-[var(--gold-light)]"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
