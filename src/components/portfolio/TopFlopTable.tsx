import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatPercent } from '@/lib/format';
import { useBRVMTopFlop, TopFlopAsset } from '@/hooks/useBRVMTopFlop';

interface TablePanelProps {
  title: string;
  rows: TopFlopAsset[];
  variant: 'top' | 'flop';
}

const TablePanel = ({ title, rows, variant }: TablePanelProps) => {
  const isTop = variant === 'top';

  return (
    <div className="rounded-xl overflow-hidden border border-border flex-1 min-w-0">
      {/* Header */}
      <div className="bg-[#1a2340] px-4 py-3 grid grid-cols-3">
        <span className={`font-bold text-sm ${isTop ? 'text-amber-400' : 'text-amber-400'}`}>
          {title}
        </span>
        <span className="text-white font-semibold text-sm text-center">Cours</span>
        <span className="text-white font-semibold text-sm text-right">Variation</span>
      </div>

      {/* Rows */}
      {rows.map((asset, i) => (
        <div
          key={asset.ticker}
          className={`grid grid-cols-3 px-4 py-3 items-center ${
            i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
          }`}
        >
          <span className="font-semibold text-sm text-slate-700">{asset.ticker}</span>
          <span className="text-sm font-semibold text-slate-800 text-center">
            {formatCurrency(asset.current_price).replace(' XOF', '')}
          </span>
          <div className="flex items-center justify-end gap-1">
            <span
              className={`text-sm font-bold ${
                isTop ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {formatPercent(asset.variation)}
            </span>
            {isTop ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonPanel = () => (
  <div className="rounded-xl overflow-hidden border border-border flex-1 min-w-0">
    <div className="bg-[#1a2340] px-4 py-3 h-11" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className={`px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
        <Skeleton className="h-4 w-full" />
      </div>
    ))}
  </div>
);

export const TopFlopTable = () => {
  const { top5, flop5, isLoading } = useBRVMTopFlop();

  if (isLoading) {
    return (
      <div className="flex gap-4 flex-col sm:flex-row">
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (top5.length === 0 && flop5.length === 0) return null;

  return (
    <div className="flex gap-4 flex-col sm:flex-row">
      <TablePanel title="TOP 5" rows={top5} variant="top" />
      <TablePanel title="FLOP 5" rows={flop5} variant="flop" />
    </div>
  );
};
