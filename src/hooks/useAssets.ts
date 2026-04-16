import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';

export const useAssets = () => {
  const { data: assets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('ticker', { ascending: true });

      if (error) throw error;
      return data as unknown as Asset[];
    },
  });

  const lastUpdated = assets.reduce<string | null>((latest, a) => {
    if (!a.price_updated_at) return latest;
    if (!latest) return a.price_updated_at;
    return a.price_updated_at > latest ? a.price_updated_at : latest;
  }, null);

  return { assets, isLoading, error, refetch, lastUpdated };
};
