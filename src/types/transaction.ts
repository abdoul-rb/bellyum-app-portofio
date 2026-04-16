export type TransactionType = 'BUY' | 'SELL' | 'SYNC';

export interface Transaction {
  id: string;
  portfolio_id: string;
  asset_id: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  transaction_date: string;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Joined
  asset?: {
    id: string;
    name: string;
    ticker: string;
    asset_type: string;
    sector: string | null;
    current_price: number | null;
  };
}

export interface TransactionFormData {
  asset_id: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  transaction_date: string;
  notes?: string;
}

export interface SyncFormData {
  asset_id: string;
  quantity: number;
  average_price: number;
  total_fees: number;
  transaction_date: string;
}
