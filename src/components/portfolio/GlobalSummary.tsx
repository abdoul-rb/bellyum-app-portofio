import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency, formatPercent } from '@/lib/format';
import { useGlobalSummary } from '@/hooks/useGlobalSummary';
import { Loader2 } from 'lucide-react';

export const GlobalSummary = () => {
  const { totalInvested, totalFees, totalCurrentValue, totalGainLoss, globalPerformance, positionCount, isLoading } = useGlobalSummary();
  const trend = totalGainLoss > 0 ? 'up' : totalGainLoss < 0 ? 'down' : 'neutral' as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard title="Total investi" value={formatCurrency(totalInvested)} />
      <StatCard title="Total frais" value={formatCurrency(totalFees)} />
      <StatCard title="Positions actives" value={String(positionCount)} />
      <StatCard title="Gain / Perte" value={formatCurrency(totalGainLoss)} trend={trend} />
    </div>
  );
};
