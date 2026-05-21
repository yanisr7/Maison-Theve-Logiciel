# Brief Agent — Maison Théve Logiciel (Godot & Fils MVP)

## Contexte
SaaS interne multi-agences pour Godot & Fils (franchise achat-vente métaux précieux à Lille). Le brief produit complet est dans `godot_fils_brief.html` (à lire en premier).

Client : Pietro. Agences : Gambetta, Federbe, Grand Béta (+ Valenciennes futur).

## Objectif de cette ébauche
Squelette Next.js qui implémente le **flow transit complet** (Phase 1 du brief) avec mock data, pour validation design avec Pietro avant le vrai dev.

## Stack imposée
- **Next.js 15** App Router + TypeScript (strict)
- **Tailwind CSS v4**
- **shadcn/ui** pour composants de base
- **Pas de DB, pas d'auth** — mock data JSON
- **Context React** pour switcher de rôle (Gambetta / Federbe / Pietro)
- Design : reprendre la palette du brief HTML (or `#C9A84C` sur fond sombre `#0C0B09`, accent crème `#F0E8D4`, police DM Serif Display + DM Sans)

## Structure attendue
```
app/
  layout.tsx              ← nav + role switcher en haut (sticky)
  page.tsx                ← redirige vers le dashboard du rôle actif
  agence/[slug]/page.tsx  ← dashboard agence (transit + observations + équipe stub)
  transit/
    page.tsx              ← liste avec filtres par statut
    nouveau/page.tsx      ← formulaire création bon (descriptif libre, destinataire, transporteur)
    [id]/page.tsx         ← détail bon + actions selon rôle
  admin/page.tsx          ← dashboard Pietro 360° (vue consolidée, alertes paiement)
lib/
  mock.ts                 ← 3 agences + ~6 transits couvrant TOUS les statuts
  role-context.tsx
components/
  StatusChip, TransitCard, RoleSwitcher, ActionButton, ...
```

## Flow transit (7 étapes du brief)
1. **Création du bon** par Gambetta (descriptif libre, destinataire, transporteur, numéro auto-généré format `TR-2026-XXXX`)
2. **Notification Federbe** (statut "En attente de validation")
3. **Federbe accepte / refuse** (action visible UNIQUEMENT si rôle = Federbe)
4. **Gambetta expédie** (action visible UNIQUEMENT si rôle = Gambetta ET statut = "Validé")
5. **Statut "En transit"** auto
6. **Federbe réceptionne** → puis clique **"Facturé + Payé"** (numéro d'envoi obligatoirement sur la facture)
7. **Pietro vérifie virement bancaire et valide définitivement** (action visible UNIQUEMENT si rôle = Pietro)

## Statuts (chips colorés comme le brief)
- `pending` — En attente de validation (gris)
- `validated` — Validé par destinataire (bleu pâle)
- `in_transit` — En transit (or)
- `received` — Réceptionné (bleu)
- `paid_unverified` — Facturé + Payé non vérifié (vert clair)
- `closed` — Clôturé / Validé par Pietro (vert foncé)
- `refused` — Refusé (rouge)

## Règles métier critiques (à respecter dans le code)
1. **Validation obligatoire avant expédition** : impossible de marquer "Expédié" si destinataire n'a pas validé
2. **Double validation paiement** : Federbe déclare "Payé" → Pietro doit vérifier bancaire pour finaliser
3. **Numéro d'envoi** auto-généré dès la création, immuable, affiché partout
4. **Saisie libre** : pas de catalogue produits, descriptif en `<textarea>`
5. **Notifications visuelles** : badge/toast sur chaque action (mocké, pas de vrai email)

## Mock data attendue
- 3 agences : Gambetta, Federbe, Grand Béta (avec adresses fictives Lille)
- 6+ transits couvrant chaque statut (pending, validated, in_transit, received, paid_unverified, closed, refused)
- Transporteurs : Thémis, Elite, Interne, Pietro
- Exemples réalistes : "1 lingot 250g + 3 Napoléons", "5 chaînes or 18k 35g total", etc.

## Principes de code
- Server Components par défaut, Client Components seulement où nécessaire (role context, formulaires, actions)
- Pas d'over-engineering : pas de Redux, pas de tRPC, pas de tests pour cette ébauche
- Code propre et lisible, en français pour les libellés UI

## Livrable attendu
- App qui `npm run dev` sans erreur
- Toutes les pages listées ci-dessus fonctionnelles
- On peut switcher de rôle et voir les bonnes actions/données
- Le flow transit est entièrement cliquable de bout en bout
- Pas de README inventé — Yanis le fera

## Fichiers à NE PAS toucher
- `godot_fils_brief.html` (référence, à lire mais pas modifier)
- `README.md` (existant, vide)
- `AGENT_BRIEF.md` (ce fichier)
