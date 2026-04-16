
-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolios
CREATE POLICY "Users can view their own portfolios"
ON public.portfolios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios"
ON public.portfolios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
ON public.portfolios FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
ON public.portfolios FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add portfolio_id to assets (nullable for backward compat, then we'll handle migration)
ALTER TABLE public.assets ADD COLUMN portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_assets_portfolio_id ON public.assets(portfolio_id);
