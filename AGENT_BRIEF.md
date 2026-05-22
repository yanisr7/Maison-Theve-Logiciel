# Brief Agent — Maison Théve Logiciel (Godot & Fils MVP)

## Contexte
SaaS interne multi-agences pour Godot & Fils (franchise achat-vente métaux précieux à Lille). Le brief produit complet est dans `godot_fils_brief.html` (à lire en premier).

Client : Pietro. Agences : Gambetta, Federbe (+ Valenciennes/Saint-Omer/Dunkerque à anticiper).

## Glossaire métier
- **Cambiste** — employé au comptoir d'une agence
- **Registre confié** — livre de police obligatoire (toute marchandise entrante doit y être tracée)
- **Numéro d'envoi** — ID unique auto-généré pour chaque transit, obligatoire sur la facture associée
- **Godonet** — plateforme Paris d'où arrivent les commandes client pour point relais
- **Thémis / Elite** — transporteurs externes

## Stack imposée
- **Next.js 15** App Router + TypeScript (strict)
- **Tailwind CSS v4** + **shadcn/ui** (style new-york, base neutral, primary or `#C9A84C`)
- **Thème light** (fond blanc), or `#C9A84C` conservé comme couleur de marque
- Fonts : DM Serif Display (titres) + DM Sans (corps)
- **Pas de DB, pas d'auth** — mock data JSON dans `lib/mock.ts`
- **Context React + localStorage** pour switcher de rôle (Gambetta / Federbe / Pietro)

## Structure attendue (élargie post-audit transcriptions)
```
app/
  layout.tsx              ← nav + role switcher en haut (sticky)
  page.tsx                ← redirige vers le dashboard du rôle actif
  agence/[slug]/page.tsx  ← dashboard agence (transit + colis + RDV + docs + équipe)
  transit/
    page.tsx              ← liste avec filtres par statut
    nouveau/page.tsx      ← formulaire création bon
    [id]/page.tsx         ← détail bon + actions selon rôle
  colis/                  ← NOUVEAU : point relais Paris → Lille
    page.tsx              ← liste des colis avec filtres
    [id]/page.tsx         ← détail colis + actions (Réceptionner / Remis au client)
  rdv/                    ← NOUVEAU : rendez-vous clients
    page.tsx              ← liste/agenda du jour + filtres
    [id]/page.tsx         ← détail RDV + actions (Effectué / Annuler / Reporter)
  admin/page.tsx          ← dashboard Pietro 360° (transit + colis + RDV + avis + alertes paiement)
lib/
  mock.ts                 ← agences + transits + colis + RDV + avis
  role-context.tsx
  types.ts                ← Transit, Pickup, Appointment, Review, etc.
components/
  StatusChip, TransitCard, PickupCard, AppointmentCard, RoleSwitcher, ActionButton, ...
```

## Modules à implémenter

### 1. Transit inter-agences (existant — déjà fait)
Flow 7 étapes : Création → Validation destinataire → Expédition → En transit → Réception → Facturé+Payé → Vérification Pietro.

**Statuts** :
- `pending` — En attente de validation (gris)
- `validated` — Validé par destinataire (bleu pâle)
- `in_transit` — En transit (or)
- `received` — Réceptionné (bleu)
- `paid_unverified` — Facturé + Payé non vérifié (vert clair)
- `closed` — Clôturé par Pietro (vert foncé)
- `refused` — Refusé (rouge)

### 2. Point Relais Paris → Lille (NOUVEAU)
Paris (godonet, entité externe mockée) envoie des commandes que des clients ont achetées en ligne. L'agence Lille fait office de point de retrait.

**Type `Pickup`** : `id`, `parisOrderRef` (ex: `GOD-2026-12345`), `clientName`, `clientEmail`, `clientPhone`, `description` (libre), `paymentMethod` (`virement` / `carte` / `espèces` / `autre`), `destinationAgencyId`, `transporter` (Thémis/Elite/Interne/Pietro), `status`, `createdAt`.

**Statuts Pickup** :
- `incoming` — Annoncé par Paris, pas encore arrivé (gris)
- `available` — **Disponible en boutique** (or) ← déclenche email auto client "Venez sous 48h"
- `picked_up` — Remis au client (vert foncé)

**Flow** :
1. Paris crée → arrive en `incoming` dans dashboard agence
2. Agence clique "Réceptionner" → statut `available` → toast simulant *"📧 Email envoyé à client@x.fr : Votre commande est arrivée à [agence]. Venez la récupérer sous 48h."*
3. Quand client se présente, agence clique "Remis au client" → statut `picked_up`

**Action visible UNIQUEMENT pour le rôle correspondant à l'agence destinataire (ou Pietro).**

### 3. RDV Clients (NOUVEAU)
RDV pris en ligne par les clients (raison de vente, date, email). Repris du back-office actuel.

**Type `Appointment`** : `id`, `clientName`, `clientEmail`, `clientPhone`, `reason` (texte libre — "Vente bijoux", "Estimation lingot", etc.), `agencyId`, `scheduledAt` (datetime), `status`, `rescheduledAt?`.

**Statuts** :
- `scheduled` — À venir (or)
- `done` — Effectué (vert) ← déclenche email satisfaction auto
- `cancelled` — Annulé (gris)
- `rescheduled` — Reporté (bleu) — avec nouvelle date

**Actions selon rôle** :
- Agence : "Effectué" / "Annuler" / "Reporter" (visible si rôle = agence concernée ou Pietro)
- Quand "Effectué" → toast simulant *"📧 Email satisfaction envoyé à client@x.fr"*

**Affichage** :
- Page `/rdv` : agenda du jour + à venir (filtrable par agence pour Pietro)
- Dashboard agence : section "RDV du jour" avec compteurs

### 4. Avis clients (NOUVEAU)
Canal unique pour les retours clients (post-livraison point relais OU post-RDV).

**Type `Review`** : `id`, `clientName`, `source` (`pickup` / `appointment`), `sourceId`, `rating` (1-5), `comment` (texte libre), `createdAt`, `agencyId`.

**Affichage** :
- Section dans dashboard agence (5 derniers avis)
- Section dans dashboard Pietro (vue globale + filtre par agence)
- Pas de formulaire création (les avis arrivent par email IRL, mais mockés)

### 5. Dashboard Pietro 360° (à enrichir)
Vue consolidée actuelle (transit + alertes paiement) + nouvelles sections :
- **Compteur colis en attente** par agence
- **RDV du jour** par agence
- **Derniers avis clients** (réseau global)
- Tout cliquable pour aller au détail

### 6. Dashboard agence (à enrichir)
Ajouter au dashboard actuel :
- Section "Colis point relais" (compteur + 3 derniers)
- Section "RDV du jour" (compteur + liste)
- Section "Avis clients" (3 derniers)

## Règles métier critiques (à respecter dans le code)
1. **Validation obligatoire avant expédition** transit : impossible "Expédié" si destinataire n'a pas validé
2. **Double validation paiement** transit : agence déclare "Payé" → Pietro vérifie pour finaliser
3. **Numéro d'envoi** transit auto-généré, immuable, affiché partout
4. **Saisie libre** : pas de catalogue produits — `<textarea>` pour descriptifs
5. **Notifications visuelles** : toast (sonner) sur chaque action
6. **"Facturé + Payé" en UNE action** (jamais facturer sans payer immédiatement)
7. **Point relais : email auto client** à la réception (toast mocké)
8. **RDV "Effectué" : email satisfaction auto** (toast mocké)
9. **Cloisonnement agences strict** : une agence ne voit que ses propres données ; Pietro voit tout
10. **Pietro peut être lui-même transporteur** dans la liste des organismes

## Mock data attendue
- 2 agences : Gambetta, Federbe (adresses fictives Lille)
- 7+ transits couvrant chaque statut (déjà fait)
- **6+ colis point relais** couvrant tous les statuts (`incoming`, `available`, `picked_up`) répartis sur les agences
- **8+ RDV** couvrant tous les statuts (`scheduled`, `done`, `cancelled`, `rescheduled`) à différentes dates (passées + futures)
- **5+ avis clients** mixtes (sources `pickup` et `appointment`, ratings variés)
- Transporteurs : Thémis, Elite, Interne, Pietro
- Exemples réalistes : "1 lingot 250g + 3 Napoléons", "5 chaînes or 18k 35g total", "Estimation collection pièces hérités", etc.

## Principes UX
- **Desktop-first** (Pietro voit mal, n'aime pas mobile pour le travail)
- **Thème light pur** (fond blanc), or `#C9A84C` réservé aux CTA / accents / badges actifs
- DM Serif Display pour les titres de page (signature premium)
- Libellés UI en français

## Principes de code
- Server Components par défaut, Client seulement où nécessaire (role context, formulaires, actions)
- Pas d'over-engineering : pas de Redux/tRPC/tests pour cette ébauche
- Code propre et lisible

## Livrable attendu
- App qui `npm run dev` et `npm run build` sans erreur
- Toutes les pages listées fonctionnelles
- On peut switcher de rôle et voir les bonnes actions/données pour chaque module (transit + colis + RDV + avis)
- Tous les flows cliquables de bout en bout
- Pas de README inventé

## Fichiers à NE PAS toucher
- `README.md` (existant)
- `AGENT_BRIEF.md` (ce fichier)
- `.git/`, `.claude/`, `.claude-flow/`, `.mcp.json`, `.swarm/`
- `transcription 1_pdf.pdf`, `Transcription 2_pdf.pdf`

## Fichiers à MODIFIER (pour le brief produit)
- `godot_fils_brief.html` — à enrichir avec les nouveaux modules (sections Point Relais, RDV, Avis). C'est le doc qu'on envoie à Pietro pour validation.
