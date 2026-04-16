# Bellyum Portfolio

Application web de suivi de portefeuilles boursiers, orientée marché BRVM (Bourse Régionale des Valeurs Mobilières d'Afrique de l'Ouest).

## Stack

- **Frontend** : React 18, TypeScript, Vite
- **UI** : shadcn/ui, Tailwind CSS, Recharts
- **État serveur** : TanStack Query
- **Backend / Auth / DB** : Supabase (PostgreSQL + Auth + Edge Functions)

## Prérequis

- [Bun](https://bun.sh) (gestionnaire de paquets utilisé dans ce projet)
- Un projet Supabase avec les variables d'environnement suivantes

## Variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-public-key>
```

Ces valeurs sont disponibles dans **Supabase Dashboard → Project Settings → API**.

## Installation

```bash
# Cloner le dépôt
git clone <repo-url>
cd bellyum-portfolio

# Installer les dépendances
bun install

# Lancer le serveur de développement (port 8080)
bun run dev
```

## Commandes disponibles

```bash
bun run dev        # Serveur de développement
bun run build      # Build de production
bun run preview    # Prévisualiser le build de production
bun run lint       # Vérification ESLint
bun run test       # Lancer les tests (Vitest)
bun run test:watch # Tests en mode watch
```

## Base de données

Les migrations SQL se trouvent dans `supabase/migrations/`. Pour les appliquer sur un projet Supabase local ou distant, utiliser la CLI Supabase :

```bash
supabase db push
```

## Edge Functions

| Fonction | Description | Doc |
|----------|-------------|-----|
| `update-brvm-prices` | Scrape les cours BRVM via Firecrawl et met à jour la table `assets` | [docs/edge-function-update-brvm-prices.md](docs/edge-function-update-brvm-prices.md) |

## Déploiement

Le build statique (`bun run build`) peut être déployé sur n'importe quel hébergeur de fichiers statiques (Vercel, Netlify, Cloudflare Pages, etc.).

Penser à configurer les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` côté hébergeur.
