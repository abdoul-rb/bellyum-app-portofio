import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Wallet, TrendingUp, Coins, BarChart3 } from 'lucide-react';

interface PortfolioSummaryProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  globalPerformance: number;
}

export const PortfolioSummary = ({
  totalInvested,
  totalCurrentValue,
  totalGainLoss,
  globalPerformance,
}: PortfolioSummaryProps) => {
  const trend = totalGainLoss > 0 ? 'up' : totalGainLoss < 0 ? 'down' : 'neutral';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        title="Total investi"
        value={formatCurrency(totalInvested)}
      />
      <StatCard
        title="Valeur actuelle"
        value={formatCurrency(totalCurrentValue)}
      />
      <StatCard
        title="Gain / Perte"
        value={formatCurrency(totalGainLoss)}
        trend={trend}
      />
      <StatCard
        title="Rendement"
        value={formatPercent(globalPerformance)}
        trend={trend}
      />
    </div>
  );
};
