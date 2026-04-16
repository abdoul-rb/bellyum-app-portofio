import type { Holding, HoldingWithCalculations } from '@/types/asset';

/**
 * Calcule les métriques de performance d'une position (valeur actuelle, gain/perte).
 * Source unique de vérité pour ces calculs dans toute l'application.
 */
export const calculateHoldingMetrics = (holding: Holding): HoldingWithCalculations => {
  const currentPrice = holding.asset?.current_price ?? 0;
  const current_value = holding.quantity * currentPrice;
  const costBasis = holding.quantity * holding.average_price + holding.total_fees;
  const gain_loss = current_value - costBasis;
  const gain_pct = costBasis > 0 ? (gain_loss / costBasis) * 100 : 0;

  return { ...holding, current_value, gain_loss, gain_pct };
};

export interface PortfolioSummary {
  totalInvested: number;
  totalFees: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  /** Performance nette en % : (valeur_actuelle - investi - frais) / (investi + frais) */
  globalPerformance: number;
  positionCount: number;
}

/**
 * Agrège un tableau de positions calculées en métriques de portefeuille.
 * Utilisé par useHoldings (par portefeuille) et useGlobalSummary (tous portefeuilles).
 */
export const calculatePortfolioSummary = (holdings: HoldingWithCalculations[]): PortfolioSummary => {
  const totalInvested = holdings.reduce((s, h) => s + h.total_invested, 0);
  const totalFees = holdings.reduce((s, h) => s + h.total_fees, 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalGainLoss = totalCurrentValue - totalInvested - totalFees;
  const base = totalInvested + totalFees;

  return {
    totalInvested,
    totalFees,
    totalCurrentValue,
    totalGainLoss,
    globalPerformance: base > 0 ? (totalGainLoss / base) * 100 : 0,
    positionCount: holdings.length,
  };
};
