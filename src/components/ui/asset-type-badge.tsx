import { cn } from '@/lib/utils';
import { TrendingUp, Layers, Bitcoin, Landmark } from 'lucide-react';

interface AssetTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

const config: Record<string, { icon: typeof TrendingUp; bg: string; text: string; label: string }> = {
  action: { icon: TrendingUp, bg: 'bg-action/15', text: 'text-action', label: 'Action' },
  etf: { icon: Layers, bg: 'bg-etf/15', text: 'text-etf', label: 'ETF' },
  crypto: { icon: Bitcoin, bg: 'bg-crypto/15', text: 'text-crypto', label: 'Crypto' },
  obligation: { icon: Landmark, bg: 'bg-obligation/15', text: 'text-obligation', label: 'Obligation' },
};

export const AssetTypeBadge = ({ type, size = 'sm' }: AssetTypeBadgeProps) => {
  const cfg = config[type] || config['action'];
  const { icon: Icon, bg, text, label } = cfg;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium",
      bg, text,
      size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {label}
    </span>
  );
};
