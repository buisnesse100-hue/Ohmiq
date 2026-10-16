# OHMIQ — La seconde vie de la tech

Marketplace de seconde main spécialisée dans l'électronique et les appareils électriques.
Stack : Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres, Auth, Storage, RLS) · Framer Motion.

## Variables d'environnement (Netlify → Site configuration → Environment variables)
| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé publique `sb_publishable_...` |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |

La clé secrète Supabase n'est **pas** nécessaire au fonctionnement actuel de l'app : ne la mets nulle part.

## Base de données
Les migrations sont dans `supabase/migrations` (à appliquer dans l'ordre), puis `supabase/seed.sql`.
Les deux dernières (`security_hardening`, `grants_and_column_privacy`) sont indispensables : sans elles
l'API renvoie « permission denied » et les données privées (n° de série, contacts non publics) seraient lisibles.

## Devenir admin
Après inscription : `update profiles set role = 'admin' where username = 'ton_username';`

## Local
`npm install && npm run dev` — tests : `npm test`.
