# CONTACTA

**Publie. Contacte. Vends.**

Marketplace de petites annonces ultra-simple : un vendeur publie, un acheteur découvre et contacte
directement (téléphone, WhatsApp, email). Pas de messagerie interne obligatoire, pas de paiement
intégré, pas de système de livraison en V1.

Stack : **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL, Auth,
Storage, RLS) · Zod · React Hook Form · Lucide React**.

---

## 1. Installation

```bash
npm install
```

Node.js 20+ recommandé.

## 2. Variables d'environnement

Copie `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

Variables à remplir :

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem |
| `SUPABASE_SERVICE_ROLE_KEY` | idem (⚠️ secret, jamais exposé au client) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (`http://localhost:3000` en local) |
| `STRIPE_*` | Laisser vide en V1 (architecture CONTACTA+ prête, non activée) |

## 3. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Une fois créé, récupère l'URL et les clés dans **Project Settings → API**, colle-les dans
   `.env.local`.
3. Installe le [Supabase CLI](https://supabase.com/docs/guides/cli) si ce n'est pas déjà fait :
   ```bash
   npm install -g supabase
   ```
4. Lie ton projet local au projet distant :
   ```bash
   supabase login
   supabase link --project-ref <ton-project-ref>
   ```

## 4. Migrations (base de données + RLS + Storage)

Toutes les migrations sont dans `supabase/migrations/`, dans l'ordre :

1. `extensions_and_types` — extensions PostgreSQL et types enum
2. `profiles` — profils utilisateurs + trigger de création automatique à l'inscription
3. `categories` — catégories et sous-catégories
4. `listings` — annonces (slug auto-généré, triggers de comptage)
5. `images_favorites_reports` — photos, favoris, signalements
6. `events_subscriptions_admin` — vues/clics, abonnements CONTACTA+, audit admin
7. `rls_policies` — **toutes les politiques de sécurité** (lecture/écriture/admin)
8. `storage` — buckets `listing-images` et `avatars` + policies

Applique-les sur ton projet Supabase :

```bash
supabase db push
```

Ou colle chaque fichier SQL dans **Supabase Dashboard → SQL Editor** et exécute-les dans l'ordre
si tu préfères ne pas utiliser le CLI.

## 5. Configuration Storage

Les migrations créent déjà les buckets `listing-images` (public, 5 Mo max, JPEG/PNG/WebP) et
`avatars` (public, 2 Mo max) avec leurs policies. Aucune action manuelle n'est nécessaire si tu as
appliqué la migration `storage`.

## 6. Créer un compte admin

Après avoir créé ton premier compte utilisateur via `/inscription`, passe-le en admin manuellement
dans Supabase (SQL Editor) :

```sql
update profiles set role = 'admin' where username = 'ton_username';
```

Tu peux ensuite accéder à `/admin`.

## 7. Données de test (seed)

`supabase/seed.sql` contient les 16 catégories et leurs sous-catégories. Pour l'appliquer :

```bash
supabase db push --include-seed
```

Ou colle son contenu dans le SQL Editor. Le fichier contient aussi un exemple commenté pour créer
des annonces fictives une fois que tu as au moins un profil de test.

## 8. Lancer en local

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## 9. Tests

```bash
npm run test
```

Couvre les validations Zod critiques (annonces, authentification) et les fonctions utilitaires
(formatage des prix, construction des liens `tel:`/`wa.me`/`mailto:`).

## 10. Build de production

```bash
npm run build
```

Le build a été vérifié : compilation réussie, 0 erreur TypeScript, 0 erreur ESLint, 25 pages
générées, tous les tests passent.

## 11. Déploiement sur Cloudflare

Deux chemins possibles selon ta tolérance au risque (ce projet utilise Server Actions, RSC et
middleware, donc un export statique classique ne convient pas) :

### Option recommandée par Cloudflare (2026) : `vinext`
Cloudflare recommande désormais **vinext**, un plugin Vite qui réimplémente l'API Next.js et
déploie en une commande sur Workers. Il est en **beta** — teste bien ton parcours de bout en bout
avant de basculer en production :

```bash
npx vinext@latest init   # choisis "Cloudflare Workers" comme cible
npm run build            # build vinext
npx @vinext/cloudflare deploy
```

### Option éprouvée : OpenNext (`@opennextjs/cloudflare`)
Plus mature, largement utilisée en production avec Next.js App Router + Server Actions :

```bash
npm install @opennextjs/cloudflare
npm install -D wrangler
npx wrangler login
```

Ajoute un `wrangler.jsonc` minimal puis :

```bash
npx opennextjs-cloudflare build
npx wrangler deploy
```

Dans les deux cas, pense à :
- déclarer toutes les variables de `.env.local` comme secrets Wrangler (`wrangler secret put ...`)
- configurer un domaine personnalisé dans Cloudflare Dashboard → Workers & Pages
- vérifier que le middleware (`src/middleware.ts`, protection des routes `/mon-compte`,
  `/mes-annonces`, `/publier`, `/favoris`, `/admin`) fonctionne bien dans l'environnement Workers

## 12. Configuration future Stripe (CONTACTA+)

L'architecture est prête (table `subscriptions`, colonnes `is_promoted` / `promotion_started_at` /
`promotion_expires_at` sur `listings`) mais **rien n'est branché**. Pour activer CONTACTA+ plus
tard :

1. Crée un produit Stripe à 5,99 €/mois.
2. Renseigne `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PRICE_ID_CONTACTA_PLUS`.
3. Ajoute une route `/api/stripe/webhook` (route handler) qui met à jour la table `subscriptions`
   et les colonnes `is_promoted` des annonces concernées.

La publication d'annonces reste gratuite quoi qu'il arrive : CONTACTA+ n'ajoute que de la
visibilité et des outils, jamais un péage sur la publication de base.

---

## Architecture du projet

```
src/
  app/            routes Next.js (pages + layouts + sitemap/robots)
  components/     ui/ layout/ listings/ search/ forms/ admin/
  lib/            supabase/ validations/ constants/ utils.ts
  types/          types TypeScript (miroir de la base + types applicatifs)
  services/       lecture de données (Server Components)
  actions/        Server Actions (écriture : auth, annonces, favoris, admin...)
  hooks/          hooks React réutilisables
supabase/
  migrations/     schéma SQL + RLS + Storage, dans l'ordre d'exécution
  seed.sql        données de développement (catégories, sous-catégories)
```

Principes suivis :
- **Aucune logique de permission côté frontend seul** : tout est revérifié par RLS Supabase et,
  pour l'admin, par une relecture du rôle en base à chaque Server Action.
- **Confidentialité par défaut** : aucune coordonnée de contact n'est publique tant que le vendeur
  ne l'active pas explicitement (`contact_*_public`).
- **SEO réel** : metadata dynamique, Open Graph par annonce, sitemap.xml généré depuis la base,
  pages indexables `/categorie/[slug]`, `/ville/[slug]`, `/categorie/[slug]/[ville]`.

## Ce qui reste à personnaliser avant un lancement public

- **Mentions légales, conditions, confidentialité** (`src/app/mentions-legales`,
  `/conditions`, `/confidentialite`) contiennent des placeholders `[À COMPLÉTER]` — à remplacer par
  tes vraies informations légales, idéalement relues par un professionnel du droit.
- L'adresse email de contact dans `/contact` est un placeholder.
- Le fichier `src/middleware.ts` utilise encore la convention historique de Next.js
  (dépréciée en 16, migration vers `proxy.ts` conseillée mais non bloquante : tout fonctionne).
