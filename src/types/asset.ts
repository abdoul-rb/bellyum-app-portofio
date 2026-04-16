export type AssetType = 'action' | 'etf' | 'crypto' | 'obligation';

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  sector: string | null;
  current_price: number | null;
  previous_close: number | null;
  variation: number | null;
  volume: number | null;
  price_updated_at: string | null;
  asset_type: string;
  exchange: string;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioFormData {
  name: string;
  description?: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  asset_id: string;
  quantity: number;
  average_price: number;
  total_invested: number;
  total_fees: number;
  total_dividends: number;
  created_at: string;
  updated_at: string;
  // Joined data
  asset?: Asset;
}

export interface HoldingWithCalculations extends Holding {
  current_value: number;
  gain_loss: number;
  gain_pct: number;
}

export const calculateHoldingMetrics = (holding: Holding): HoldingWithCalculations => {
  const currentPrice = holding.asset?.current_price ?? 0;
  const current_value = holding.quantity * currentPrice;
  const costBasis = holding.quantity * holding.average_price + holding.total_fees;
  const gain_loss = current_value - costBasis;
  const gain_pct = costBasis > 0 ? (gain_loss / costBasis) * 100 : 0;

  return {
    ...holding,
    current_value,
    gain_loss,
    gain_pct,
  };
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  action: 'Action',
  etf: 'ETF',
  crypto: 'Crypto',
  obligation: 'Obligation',
};

export const ASSET_TYPE_COLORS: Record<string, string> = {
  action: 'action',
  etf: 'etf',
  crypto: 'crypto',
  obligation: 'obligation',
};
