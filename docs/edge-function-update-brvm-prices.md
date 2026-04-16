# Edge Function — `update-brvm-prices`

Synchronise les cours boursiers de la BRVM (Bourse Régionale des Valeurs Mobilières d'Afrique de l'Ouest) dans la table `assets` de Supabase.

## Déclenchement

Appelée depuis le bouton **"Actualiser les cours BRVM"** sur le Dashboard :

```ts
// src/pages/Dashboard.tsx
const { data, error } = await supabase.functions.invoke('update-brvm-prices');
```

## Fonctionnement

### 1. Scraping via Firecrawl

La fonction envoie une requête POST à l'API Firecrawl en lui demandant de charger :

```
https://www.brvm.org/fr/cours-actions/0
```

```ts
fetch("https://api.firecrawl.dev/v2/scrape", {
  method: "POST",
  body: JSON.stringify({
    url: "https://www.brvm.org/fr/cours-actions/0",
    formats: ["html"],
    waitFor: 3000,   // attend 3s pour le rendu JS
  }),
});
```

**Pourquoi Firecrawl et pas un `fetch` direct ?**
Le site BRVM présente des problèmes de certificat TLS qui bloquent les requêtes émises depuis les edge functions Deno. Firecrawl agit comme proxy et contourne ce problème.

### 2. Parsing du HTML

La fonction identifie le tableau le plus grand dans le HTML retourné (heuristique : c'est le tableau des cours). Elle parcourt chaque ligne `<tr>` et extrait les cellules dans cet ordre :

| Index | Colonne BRVM | Champ base |
|-------|-------------|------------|
| 0 | Symbole | `ticker` |
| 1 | Nom | `name` |
| 2 | Volume | `volume` |
| 3 | Cours veille | `previous_close` |
| 4 | Cours ouverture | *(ignoré)* |
| 5 | Cours clôture | `current_price` |
| 6 | Variation (%) | `variation` |

Les lignes ignorées :
- Moins de 7 cellules
- Ticker vide, égal à `"Symbole"` (en-tête), ou de plus de 10 caractères

### 3. Upsert dans la table `assets`

Pour chaque actif parsé, la fonction vérifie son existence par `ticker` :

```
ticker existe ?
  ├── OUI → UPDATE (current_price, previous_close, variation, volume, price_updated_at)
  └── NON → INSERT (+ asset_type = "action", exchange = "BRVM")
```

Elle utilise la `SUPABASE_SERVICE_ROLE_KEY` (injectée automatiquement dans toutes les edge functions) pour écrire en contournant le RLS.

### Schéma de flux

```
Utilisateur (Dashboard)
  └─► supabase.functions.invoke('update-brvm-prices')
        └─► POST https://api.firecrawl.dev/v2/scrape
              └─► GET https://www.brvm.org/fr/cours-actions/0
                    └─► HTML parsé → ~47 actifs extraits
                          └─► Upsert dans table `assets`
                                └─► refetchAssets() → UI mise à jour
```

## Réponse

```json
{
  "updated": 41,
  "created": 6,
  "total": 47,
  "errors": []
}
```

| Champ | Description |
|-------|-------------|
| `updated` | Actifs existants mis à jour |
| `created` | Nouveaux actifs insérés |
| `total` | Total d'actifs parsés depuis le site |
| `errors` | Liste des erreurs par ticker (vide si tout s'est bien passé) |

## Configuration

### Secret requis

La clé Firecrawl doit être enregistrée dans les secrets Supabase (jamais dans le code ou le `.env` committé) :

```bash
supabase secrets set FIRECRAWL_API_KEY=<votre-clé>
```

Obtenir une clé sur [firecrawl.dev](https://www.firecrawl.dev).

### Déploiement

```bash
supabase functions deploy update-brvm-prices --project-ref <project-ref>
```

## Limitations connues

- **Parsing fragile** : repose sur la structure HTML du site BRVM. Un changement de mise en page casserait le parsing.
- **Actifs BRVM uniquement** : la fonction ne gère pas d'autres bourses ou types d'actifs (ETF, crypto, obligations).
- **Pas de planification automatique** : la synchronisation est déclenchée manuellement. Pour une mise à jour automatique, il faudrait configurer un cron via Supabase (pg_cron ou un trigger externe).
