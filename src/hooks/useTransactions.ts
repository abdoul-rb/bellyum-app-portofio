import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/types/transaction';
import { toast } from 'sonner';

export const useTransactions = (portfolioId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*, asset:assets(id, name, ticker, asset_type, sector, current_price)')
        .eq('portfolio_id', portfolioId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as unknown as Transaction[];
    },
    enabled: !!user && !!portfolioId,
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Non authentifié');
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction supprimée');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  return { transactions, isLoading, deleteTransaction };
};
