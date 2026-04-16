
-- Drop existing tables that will be recreated
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;

-- Recreate assets as a shared catalog (no user_id)
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ticker text NOT NULL,
  sector text,
  current_price numeric(15,4),
  previous_close numeric(15,4),
  variation numeric(8,4),
  volume bigint,
  price_updated_at timestamp with time zone,
  asset_type text NOT NULL DEFAULT 'action',
  exchange text NOT NULL DEFAULT 'BRVM',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_assets_ticker ON public.assets (ticker);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read assets
CREATE POLICY "Authenticated users can view assets"
  ON public.assets FOR SELECT TO authenticated
  USING (true);

-- Only service role can insert/update (edge function)
-- No INSERT/UPDATE/DELETE policies for anon/authenticated = blocked by default

-- Create holdings table
CREATE TABLE public.holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  quantity numeric(15,4) NOT NULL DEFAULT 0,
  average_price numeric(15,4) NOT NULL DEFAULT 0,
  total_invested numeric(15,4) NOT NULL DEFAULT 0,
  total_fees numeric(15,4) NOT NULL DEFAULT 0,
  total_dividends numeric(15,4) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (portfolio_id, asset_id)
);

ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own holdings"
  ON public.holdings FOR SELECT TO authenticated
  USING (portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own holdings"
  ON public.holdings FOR INSERT TO authenticated
  WITH CHECK (portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own holdings"
  ON public.holdings FOR UPDATE TO authenticated
  USING (portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own holdings"
  ON public.holdings FOR DELETE TO authenticated
  USING (portfolio_id IN (SELECT id FROM public.portfolios WHERE user_id = auth.uid()));

-- Recreate transactions with asset_id FK
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('BUY', 'SELL', 'SYNC')),
  quantity numeric(15,4) NOT NULL,
  price numeric(15,4) NOT NULL,
  fees numeric(15,4) NOT NULL DEFAULT 0,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_transactions_portfolio ON public.transactions (portfolio_id);
CREATE INDEX idx_transactions_asset ON public.transactions (asset_id);
CREATE INDEX idx_holdings_portfolio ON public.holdings (portfolio_id);
CREATE INDEX idx_holdings_asset ON public.holdings (asset_id);

-- Triggers for updated_at
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
  BEFORE UPDATE ON public.holdings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
