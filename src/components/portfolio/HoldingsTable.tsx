import { HoldingWithCalculations } from '@/types/asset';
import { AssetTypeBadge } from '@/components/ui/asset-type-badge';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Props {
  holdings: HoldingWithCalculations[];
  onHoldingClick?: (holding: HoldingWithCalculations) => void;
}

const isStale = (priceUpdatedAt: string | null | undefined) => {
  if (!priceUpdatedAt) return true;
  const diff = Date.now() - new Date(priceUpdatedAt).getTime();
  return diff > 24 * 60 * 60 * 1000;
};

export const HoldingsTable = ({ holdings, onHoldingClick }: Props) => {
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
    <div className="bg-card rounded-lg border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Actif</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Prix moyen</TableHead>
            <TableHead className="text-right">Prix actuel</TableHead>
            <TableHead className="text-right">Frais</TableHead>
            <TableHead className="text-right">Valorisation</TableHead>
            <TableHead className="text-right">Gain / Perte</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((h) => {
            const isGain = h.gain_loss >= 0;
            const stale = isStale(h.asset?.price_updated_at);
            const hasPrice = h.asset?.current_price != null;

            return (
              <TableRow
                key={h.id}
                className={cn("hover:bg-accent/30", onHoldingClick && "cursor-pointer")}
                onClick={() => onHoldingClick?.(h)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">
                          {h.asset?.ticker ?? '—'}
                        </span>
                        <AssetTypeBadge type={h.asset?.asset_type ?? 'action'} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {h.asset?.name ?? 'Actif inconnu'}
                      </p>
                      {h.asset?.sector && (
                        <p className="text-xs text-muted-foreground/70">
                          {h.asset.sector}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(h.quantity, 4)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(h.average_price)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <div className="flex items-center justify-end gap-1">
                    {!hasPrice ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <>
                        {stale && <AlertTriangle className="h-3 w-3 text-crypto" />}
                        <span className={stale ? 'text-crypto' : ''}>
                          {formatCurrency(h.asset!.current_price!)}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(h.total_fees)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCurrency(h.current_value)}
                </TableCell>
                <TableCell className={cn("text-right font-mono font-bold", isGain ? "text-gain" : "text-loss")}>
                  <div className="flex items-center justify-end gap-1">
                    {isGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{formatCurrency(h.gain_loss)}</span>
                  </div>
                  <span className="text-xs">{formatPercent(h.gain_pct)}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
