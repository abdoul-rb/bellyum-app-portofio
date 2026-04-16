import { useState } from 'react';
import { usePortfolios } from '@/hooks/usePortfolios';
import { useGlobalSummary } from '@/hooks/useGlobalSummary';
import { useHoldings } from '@/hooks/useHoldings';
import { useAssets } from '@/hooks/useAssets';
import { GlobalSummary } from '@/components/portfolio/GlobalSummary';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { portfolios, isLoading: pfLoading } = usePortfolios();
  const { positionCount, isLoading: summaryLoading } = useGlobalSummary();
  const { lastUpdated, refetch: refetchAssets } = useAssets();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);

  const handleSyncBRVM = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-brvm-prices');
      if (error) throw error;
      toast.success(`${data.updated} actifs mis à jour, ${data.created} nouveaux`);
      refetchAssets();
    } catch (err: any) {
      toast.error('Erreur de synchronisation: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Jamais';
    const diff = Date.now() - new Date(lastUpdated).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `il y a ${Math.floor(diff / 60000)} min`;
    if (hours < 24) return `il y a ${hours}h`;
    return new Date(lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (pfLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <div className="flex flex-col items-end gap-1">
          <Button variant="outline" size="sm" onClick={handleSyncBRVM} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Actualiser les cours BRVM
          </Button>
          <span className="text-xs text-muted-foreground">
            Dernière mise à jour : {formatLastUpdated()}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <GlobalSummary />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Portefeuilles" value={String(portfolios.length)} />
        <StatCard title="Positions" value={String(positionCount)} />
      </div>

      {/* Portfolio list with holdings */}
      {portfolios.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">Aucun portefeuille</h3>
          <p className="text-sm text-muted-foreground mb-4">Commencez par créer un portefeuille</p>
          <Button onClick={() => navigate('/portfolios')}>Créer un portefeuille</Button>
        </Card>
      ) : (
        portfolios.map(pf => (
          <PortfolioPreview key={pf.id} portfolioId={pf.id} portfolioName={pf.name} />
        ))
      )}
    </div>
  );
};

const PortfolioPreview = ({ portfolioId, portfolioName }: { portfolioId: string; portfolioName: string }) => {
  const { holdings, isLoading } = useHoldings(portfolioId);
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{portfolioName}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/portfolios/${portfolioId}`)}>
          Voir détails →
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : holdings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucune position</p>
        ) : (
          <HoldingsTable holdings={holdings} />
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;
