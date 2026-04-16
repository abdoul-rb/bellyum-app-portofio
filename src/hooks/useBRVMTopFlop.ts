import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';

export interface TopFlopAsset {
  ticker: string;
  name: string;
  current_price: number;
  variation: number;
}

const toTopFlopAsset = (a: Asset): TopFlopAsset => ({
  ticker: a.ticker,
  name: a.name,
  current_price: a.current_price ?? 0,
  variation: a.variation ?? 0,
});

export const useBRVMTopFlop = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['brvm-top-flop'],
    queryFn: async () => {
      const [topRes, flopRes] = await Promise.all([
        supabase
          .from('assets')
          .select('ticker, name, current_price, variation')
          .not('variation', 'is', null)
          .not('current_price', 'is', null)
          .gt('variation', 0)
          .order('variation', { ascending: false })
          .limit(5),
        supabase
          .from('assets')
          .select('ticker, name, current_price, variation')
          .not('variation', 'is', null)
          .not('current_price', 'is', null)
          .lt('variation', 0)
          .order('variation', { ascending: true })
          .limit(5),
      ]);

      if (topRes.error) throw topRes.error;
      if (flopRes.error) throw flopRes.error;

      return {
        top5: (topRes.data as unknown as Asset[]).map(toTopFlopAsset),
        flop5: (flopRes.data as unknown as Asset[]).map(toTopFlopAsset),
      };
    },
  });

  return {
    top5: data?.top5 ?? [],
    flop5: data?.flop5 ?? [],
    isLoading,
  };
};
