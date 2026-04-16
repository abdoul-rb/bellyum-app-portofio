import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { AssetTypeBadge } from '@/components/ui/asset-type-badge';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowDownCircle, ArrowUpCircle, RefreshCw, History, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, onDelete }: Props) => {
  const [assetFilter, setAssetFilter] = useState<string>('all');

  const assetNames = useMemo(() => {
    const names = [...new Set(transactions.map(tx => tx.asset?.ticker ?? tx.asset_id))];
    return names.sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    if (assetFilter === 'all') return transactions;
    return transactions.filter(tx => (tx.asset?.ticker ?? tx.asset_id) === assetFilter);
  }, [transactions, assetFilter]);

  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-foreground mb-1">Aucune transaction</h3>
        <p className="text-sm text-muted-foreground">
          Enregistrez votre premier achat ou vente
        </p>
      </div>
    );
  }

  const typeIcon = (type: string) => {
    if (type === 'BUY') return <ArrowDownCircle className="h-5 w-5" />;
    if (type === 'SELL') return <ArrowUpCircle className="h-5 w-5" />;
    return <RefreshCw className="h-5 w-5" />;
  };

  const typeColor = (type: string) => {
    if (type === 'BUY') return 'bg-gain/10 text-gain';
    if (type === 'SELL') return 'bg-loss/10 text-loss';
    return 'bg-primary/10 text-primary';
  };

  const typeLabel = (type: string) => {
    if (type === 'BUY') return 'Achat';
    if (type === 'SELL') return 'Vente';
    return 'Synchronisation';
  };

  return (
    <div className="space-y-3">
      {assetNames.length > 1 && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Filtrer par actif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les actifs</SelectItem>
              {assetNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((tx) => {
          const total = tx.quantity * tx.price + tx.fees;
          return (
            <div key={tx.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3 animate-fade-in">
              <div className={cn("flex items-center justify-center h-9 w-9 rounded-full shrink-0", typeColor(tx.type))}>
                {typeIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">
                    {tx.asset?.ticker ?? '—'}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {tx.asset?.name}
                  </span>
                  {tx.asset?.asset_type && <AssetTypeBadge type={tx.asset.asset_type} />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {typeLabel(tx.type)} · {formatNumber(tx.quantity, 4)} × {formatCurrency(tx.price)}
                  {tx.fees > 0 && ` + ${formatCurrency(tx.fees)} frais`}
                  {' · '}
                  {new Date(tx.transaction_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("font-mono font-bold text-sm",
                  tx.type === 'BUY' ? "text-foreground" : tx.type === 'SELL' ? "text-gain" : "text-primary"
                )}>
                  {tx.type === 'BUY' ? '-' : tx.type === 'SELL' ? '+' : '='}{formatCurrency(total)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => onDelete(tx.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
