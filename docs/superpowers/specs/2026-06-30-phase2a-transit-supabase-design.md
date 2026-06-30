# Phase 2a — Transit sur Supabase (design)

Date : 2026-06-30
Statut : validé (Yanis), en cours d'implémentation

## Objectif

Faire passer le module **Transit** des fausses données (`lib/mock.ts`, effacées à chaque
rechargement) à une **vraie base de données Supabase** : un bon créé ou modifié est
enregistré durablement et visible par tous, après rechargement.

C'est la 1ère étape de la Phase 2 (« rendre l'appli vraie »).

## Périmètre

DANS le périmètre :
- Table `transits` dans Supabase (Postgres).
- Chargement des transits de démo actuels dans la table (seed).
- Page `/transit` (liste), `/transit/[id]` (détail + actions de statut),
  `/transit/nouveau` (création) branchées sur Supabase en **lecture ET écriture**.
- Client Supabase + clés dans `.env.local` (jamais commité).

HORS périmètre (étapes suivantes) :
- Connexion / comptes par personne → 2b (le sélecteur de rôle actuel reste pour tester).
- Les autres modules (bien confié, RDV, docs, équipe, observations, cas de figure)
  restent sur `lib/mock.ts` pour l'instant — ils continuent de fonctionner.
- Les agences restent des données statiques en dur (`lib/mock.ts`), elles bougent peu.
- Vrais emails, chat IA, facturation auto → 2c / 2d.

## Architecture

- **Lecture** : les pages transit deviennent des Server Components qui appellent une
  couche d'accès `lib/transits-db.ts` (fonctions async) → Supabase → rendu.
- **Écriture** : Server Actions (créer un bon, changer un statut, refuser) qui écrivent
  dans Supabase puis `revalidatePath('/transit')`.
- **Client Supabase** : `lib/supabase.ts` (clé publishable/anon, lecture/écriture, RLS).
- Le type `Transit` (lib/types.ts) reste la forme métier ; la couche db mappe
  colonnes snake_case ↔ champs camelCase.

## Modèle de données (table `transits`)

| Colonne | Type | Notes |
|---|---|---|
| id | uuid (pk, défaut gen_random_uuid) | |
| reference | text unique | TR-2026-XXXX |
| from_agency | text | slug agence émettrice |
| to_agency | text | slug agence destinataire |
| transporter | text | |
| description | text | |
| amount | integer | euros |
| status | text | pending/validated/in_transit/received/paid_unverified/closed/refused |
| created_by | text null | nom du cambiste |
| invoice_number | text null | |
| refusal_reason | text null | |
| events | jsonb | historique [{date,label,by}] — stocké en colonne (simplicité) |
| created_at | timestamptz défaut now() | |

Décision : l'historique (`events`) est stocké en **JSONB** dans la ligne plutôt qu'une
table séparée — suffisant ici, évite des jointures, conserve la forme actuelle du type.

## Sécurité

- Clés appli dans `.env.local` (gitignored). Clé **publishable/anon** côté appli.
- RLS : à cette étape (sans auth), policies permissives (lecture/écriture ouvertes) OU
  RLS désactivé temporairement. ⚠️ À durcir en **2b** quand l'auth arrive (policies par
  agence + super-admin Pietro). Noté comme dette assumée, signalée par l'advisor Supabase.

## Test de validation (bout en bout)

1. Aller sur `/transit/nouveau`, créer un bon.
2. Le bon apparaît dans `/transit`.
3. Rafraîchir la page (F5) → le bon est **toujours là**.
4. Changer un statut sur `/transit/[id]` → persiste après rechargement.

## Étapes suivantes (rappel roadmap)

2b Connexion par personne · 2c autres modules sur Supabase · 2d emails + facturation auto.
