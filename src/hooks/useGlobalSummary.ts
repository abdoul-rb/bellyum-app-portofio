import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Holding } from '@/types/asset';
import { calculateHoldingMetrics, calculatePortfolioSummary } from '@/lib/calculations';

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

  return {
    ...calculatePortfolioSummary(allHoldings),
    isLoading,
  };
};
