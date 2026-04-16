import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Holding, calculateHoldingMetrics } from '@/types/asset';

export const useGlobalSummary = () => {
  const { user } = useAuth();

  const { data: allHoldings = [], isLoading } = useQuery({
    queryKey: ['global-holdings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('holdings')
        .select('*, asset:assets(*)');
      if (error) throw error;
      return (data as unknown as Holding[]).map(calculateHoldingMetrics);
    },
    enabled: !!user,
  });

  const totalInvested = allHoldings.reduce((s, h) => s + h.total_invested, 0);
  const totalFees = allHoldings.reduce((s, h) => s + h.total_fees, 0);
  const totalCurrentValue = allHoldings.reduce((s, h) => s + h.current_value, 0);
  const totalGainLoss = totalCurrentValue - totalInvested - totalFees;
  const base = totalInvested + totalFees;
  const globalPerformance = base > 0 ? (totalGainLoss / base) * 100 : 0;

  return {
    totalInvested,
    totalFees,
    totalCurrentValue,
    totalGainLoss,
    globalPerformance,
    positionCount: allHoldings.length,
    isLoading,
  };
};
