# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start Vite dev server
bun run build        # Production build
bun run lint         # ESLint check
bun run test         # Run tests once (Vitest)
bun run test:watch   # Run tests in watch mode

# Run a single test file
bun run test src/test/example.test.ts
```

## Architecture Overview

This is a **React + TypeScript SPA** for tracking investment portfolios on the BRVM (Bourse Régionale des Valeurs Mobilières). The stack is Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router, and Supabase.

### Auth flow

`AuthContext` (`src/contexts/AuthContext.tsx`) wraps the whole app and exposes `user`, `session`, and auth methods via Supabase. `App.tsx` guards all routes: unauthenticated users see `<AuthForm>`, authenticated users enter `<AppLayout>` with four routes: `/dashboard`, `/portfolios`, `/portfolios/:id`, `/settings`. Pages are lazy-loaded.

### Data layer

All server state goes through **TanStack Query hooks** in `src/hooks/`:

| Hook | Key data / mutations |
|---|---|
| `usePortfolios` | CRUD on `portfolios` table |
| `useHoldings(portfolioId)` | Holdings with joined `assets`, plus `recordTransaction` (BUY/SELL) and `syncHolding` (SYNC) mutations |
| `useGlobalSummary` | Cross-portfolio aggregate (all holdings for the user) |
| `useAssets` | Assets list with `lastUpdated` for price freshness display |
| `useTransactions` | Transaction log per portfolio |

Query keys: `['portfolios', userId]`, `['holdings', portfolioId]`, `['global-holdings', userId]`, `['transactions', portfolioId]`. Mutations invalidate related keys after success.

### Business logic

- **Holding metrics** are computed client-side in `calculateHoldingMetrics` (`src/types/asset.ts`): `current_value = quantity × current_price`, `gain_loss = current_value − (quantity × average_price + total_fees)`.
- **BUY** transactions update quantity, average price (VWAP), and total invested. **SELL** reduces quantity; deletes the holding if qty reaches 0. **SYNC** overwrites the holding with exact values from the form (used to manually reconcile broker positions).
- Currency is always XOF; formatting helpers are in `src/lib/format.ts`.

### Supabase integration

- Client: `src/integrations/supabase/client.ts` — reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from env.
- Types: `src/integrations/supabase/types.ts` — auto-generated, do not edit manually.
- Edge function: `supabase/functions/update-brvm-prices/index.ts` — scrapes BRVM price data via Firecrawl API and upserts into the `assets` table. Requires `FIRECRAWL_API_KEY` secret in Supabase.

### Database schema (4 tables)

- `assets` — tradeable instruments (ticker, name, exchange, asset_type, current_price, …)
- `portfolios` — user-owned portfolios
- `holdings` — current position per portfolio+asset (quantity, average_price, total_invested, total_fees, total_dividends)
- `transactions` — immutable ledger (type: `BUY | SELL | SYNC`, price, quantity, fees)

### UI conventions

- All UI primitives live in `src/components/ui/` (shadcn/ui wrappers — do not rewrite these).
- Portfolio-specific business components are in `src/components/portfolio/`.
- Toast notifications use `sonner` (`import { toast } from 'sonner'`).
- UI strings are in French.
- Asset types: `action`, `etf`, `crypto`, `obligation` (labels/colors mapped in `src/types/asset.ts`).
