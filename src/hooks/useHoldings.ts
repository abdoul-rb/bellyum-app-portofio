import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Holding, HoldingWithCalculations, calculateHoldingMetrics } from '@/types/asset';
import { TransactionFormData, SyncFormData } from '@/types/transaction';
import { toast } from 'sonner';

export const useHoldings = (portfolioId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['holdings', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      const { data, error } = await supabase
        .from('holdings')
        .select('*, asset:assets(*)')
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return (data as unknown as Holding[]).map(calculateHoldingMetrics);
    },
    enabled: !!user && !!portfolioId,
  });

  const recordTransaction = useMutation({
    mutationFn: async (formData: TransactionFormData) => {
      if (!user || !portfolioId) throw new Error('Non authentifié');

      // 1. Insert transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          portfolio_id: portfolioId,
          asset_id: formData.asset_id,
          type: formData.type,
          quantity: formData.quantity,
          price: formData.price,
          fees: formData.fees,
          transaction_date: formData.transaction_date,
          notes: formData.notes || null,
          user_id: user.id,
        }]);

      if (txError) throw txError;

      // 2. Update holding
      const { data: existing } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .eq('asset_id', formData.asset_id)
        .maybeSingle();

      if (formData.type === 'BUY') {
        const oldQty = existing?.quantity ?? 0;
        const oldInvested = existing?.total_invested ?? 0;
        const oldFees = existing?.total_fees ?? 0;

        const newQty = oldQty + formData.quantity;
        const newInvested = oldInvested + (formData.quantity * formData.price);
        const newAvgPrice = newQty > 0 ? newInvested / newQty : 0;
        const newFees = oldFees + formData.fees;

        if (existing) {
          const { error } = await supabase
            .from('holdings')
            .update({
              quantity: newQty,
              average_price: newAvgPrice,
              total_invested: newInvested,
              total_fees: newFees,
            })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('holdings')
            .insert([{
              portfolio_id: portfolioId,
              asset_id: formData.asset_id,
              quantity: formData.quantity,
              average_price: formData.price,
              total_invested: formData.quantity * formData.price,
              total_fees: formData.fees,
            }]);
          if (error) throw error;
        }
      } else if (formData.type === 'SELL') {
        if (!existing) throw new Error('Aucune position à vendre');
        const newQty = existing.quantity - formData.quantity;
        if (newQty <= 0) {
          const { error } = await supabase
            .from('holdings')
            .delete()
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('holdings')
            .update({ quantity: newQty, total_invested: newQty * existing.average_price })
            .eq('id', existing.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction enregistrée');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const syncHolding = useMutation({
    mutationFn: async (formData: SyncFormData) => {
      if (!user || !portfolioId) throw new Error('Non authentifié');

      const fees = formData.total_fees ?? 0;

      // Insert SYNC transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          portfolio_id: portfolioId,
          asset_id: formData.asset_id,
          type: 'SYNC' as const,
          quantity: formData.quantity,
          price: formData.average_price,
          fees,
          transaction_date: formData.transaction_date,
          user_id: user.id,
        }]);
      if (txError) throw txError;

      if (formData.quantity <= 0) {
        await supabase
          .from('holdings')
          .delete()
          .eq('portfolio_id', portfolioId)
          .eq('asset_id', formData.asset_id);
      } else {
        const { data: existing } = await supabase
          .from('holdings')
          .select('id')
          .eq('portfolio_id', portfolioId)
          .eq('asset_id', formData.asset_id)
          .maybeSingle();

        const holdingData = {
          quantity: formData.quantity,
          average_price: formData.average_price,
          total_invested: formData.quantity * formData.average_price,
          total_fees: fees,
        };

        if (existing) {
          const { error } = await supabase.from('holdings').update(holdingData).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('holdings').insert([{
            portfolio_id: portfolioId,
            asset_id: formData.asset_id,
            ...holdingData,
          }]);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Position synchronisée');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const summary = {
    totalInvested: holdings.reduce((s, h) => s + h.total_invested, 0),
    totalFees: holdings.reduce((s, h) => s + h.total_fees, 0),
    totalCurrentValue: holdings.reduce((s, h) => s + (h as HoldingWithCalculations).current_value, 0),
    positionCount: holdings.length,
    get totalGainLoss() { return this.totalCurrentValue - this.totalInvested - this.totalFees; },
    get globalPerformance() {
      const base = this.totalInvested + this.totalFees;
      return base > 0 ? (this.totalGainLoss / base) * 100 : 0;
    },
  };

  return {
    holdings: holdings as HoldingWithCalculations[],
    isLoading,
    recordTransaction,
    syncHolding,
    summary,
  };
};
