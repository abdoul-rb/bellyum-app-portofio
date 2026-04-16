import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard = ({ title, value, subtitle, trend, className }: StatCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <div className={cn(
      "bg-card rounded-lg p-4 border border-border shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
        {title}
      </p>
      <div className="flex items-center gap-2">
        <p className={cn(
          "text-xl font-bold font-mono tracking-tight",
          trend === 'up' && "text-gain",
          trend === 'down' && "text-loss",
          !trend && "text-foreground"
        )}>
          {value}
        </p>
        {trend && trend !== 'neutral' && (
          <TrendIcon className={cn(
            "h-4 w-4",
            trend === 'up' ? "text-gain" : "text-loss"
          )} />
        )}
      </div>
      {subtitle && (
        <p className={cn(
          "text-sm font-medium mt-0.5",
          trend === 'up' && "text-gain",
          trend === 'down' && "text-loss",
          !trend && "text-muted-foreground"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
