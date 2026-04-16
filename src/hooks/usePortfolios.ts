import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio, PortfolioFormData } from '@/types/asset';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePortfolios = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ['portfolios', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Portfolio[];
    },
    enabled: !!user,
  });

  const addPortfolio = useMutation({
    mutationFn: async (formData: PortfolioFormData) => {
      if (!user) throw new Error('Non authentifié');
      const { data, error } = await supabase
        .from('portfolios')
        .insert([{ ...formData, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data as Portfolio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portefeuille créé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const updatePortfolio = useMutation({
    mutationFn: async ({ id, ...formData }: PortfolioFormData & { id: string }) => {
      if (!user) throw new Error('Non authentifié');
      const { data, error } = await supabase
        .from('portfolios')
        .update(formData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data as Portfolio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portefeuille mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const deletePortfolio = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Non authentifié');
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Portefeuille supprimé');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  return { portfolios, isLoading, addPortfolio, updatePortfolio, deletePortfolio };
};
