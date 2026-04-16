import { HoldingWithCalculations } from '@/types/asset';
import { AssetTypeBadge } from '@/components/ui/asset-type-badge';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react';

interface Props {
  holdings: HoldingWithCalculations[];
  onHoldingClick?: (holding: HoldingWithCalculations) => void;
}

const isStale = (priceUpdatedAt: string | null | undefined) => {
  if (!priceUpdatedAt) return true;
  const diff = Date.now() - new Date(priceUpdatedAt).getTime();
  return diff > 24 * 60 * 60 * 1000;
};

export const HoldingsCardList = ({ holdings, onHoldingClick }: Props) => {
  if (holdings.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-foreground mb-1">Aucune position</h3>
        <p className="text-sm text-muted-foreground">
          Enregistrez votre première transaction pour voir vos positions
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {holdings.map((h) => {
        const isGain = h.gain_loss >= 0;
        const stale = isStale(h.asset?.price_updated_at);
        const hasPrice = h.asset?.current_price != null;

        return (
          <div
            key={h.id}
            className={cn(
              "bg-card rounded-lg border border-border p-4 space-y-3",
              onHoldingClick && "cursor-pointer hover:bg-accent/30 transition-colors"
            )}
            onClick={() => onHoldingClick?.(h)}
          >
            {/* Header: Ticker + Badge + Gain */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-base">
                    {h.asset?.ticker ?? '—'}
                  </span>
                  <AssetTypeBadge type={h.asset?.asset_type ?? 'action'} />
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {h.asset?.name ?? 'Actif inconnu'}
                </p>
                {h.asset?.sector && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {h.asset.sector}
                  </p>
                )}
              </div>
              <div className={cn("text-right shrink-0", isGain ? "text-gain" : "text-loss")}>
                <div className="flex items-center justify-end gap-1 font-mono font-bold text-sm">
                  {isGain ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {formatCurrency(h.gain_loss)}
                </div>
                <span className="text-xs font-mono font-semibold">
                  {formatPercent(h.gain_pct)}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantité</span>
                <span className="font-mono">{formatNumber(h.quantity, 4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix moy.</span>
                <span className="font-mono">{formatCurrency(h.average_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix actuel</span>
                <span className={cn("font-mono", stale && hasPrice && "text-crypto")}>
                  {!hasPrice ? '—' : (
                    <span className="flex items-center gap-1">
                      {stale && <AlertTriangle className="h-3 w-3" />}
                      {formatCurrency(h.asset!.current_price!)}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valorisation</span>
                <span className="font-mono font-medium">{formatCurrency(h.current_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais</span>
                <span className="font-mono">{formatCurrency(h.total_fees)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
