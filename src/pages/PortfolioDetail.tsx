import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHoldings } from '@/hooks/useHoldings';
import { useTransactions } from '@/hooks/useTransactions';
import { usePortfolios } from '@/hooks/usePortfolios';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { HoldingsCardList } from '@/components/portfolio/HoldingsCardList';
import { TransactionList } from '@/components/portfolio/TransactionList';
import { RecordTransactionModal } from '@/components/portfolio/RecordTransactionModal';
import { SyncHoldingModal } from '@/components/portfolio/SyncHoldingModal';
import { EditHoldingModal } from '@/components/portfolio/EditHoldingModal';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw, Loader2, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TransactionFormData, SyncFormData } from '@/types/transaction';
import { HoldingWithCalculations } from '@/types/asset';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { portfolios } = usePortfolios();
  const portfolio = portfolios.find(p => p.id === id);
  const { holdings, isLoading: holdingsLoading, recordTransaction, syncHolding, summary } = useHoldings(id ?? null);
  const { transactions, isLoading: txLoading, deleteTransaction } = useTransactions(id ?? null);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [editHolding, setEditHolding] = useState<HoldingWithCalculations | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(isMobile ? 'cards' : 'table');

  const handleTxSubmit = (data: TransactionFormData) => {
    recordTransaction.mutate(data, { onSuccess: () => setTxModalOpen(false) });
  };

  const handleSyncSubmit = (data: SyncFormData) => {
    syncHolding.mutate(data, { onSuccess: () => setSyncModalOpen(false) });
  };

  const handleEditSubmit = (data: SyncFormData) => {
    syncHolding.mutate(data, { onSuccess: () => setEditHolding(null) });
  };

  const confirmDeleteTx = () => {
    if (deleteTxId) {
      deleteTransaction.mutate(deleteTxId);
      setDeleteTxId(null);
    }
  };

  const isLoading = holdingsLoading || txLoading;

  if (!id) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{portfolio?.name ?? 'Portefeuille'}</h1>
          {portfolio?.description && (
            <p className="text-sm text-muted-foreground mt-1">{portfolio.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSyncModalOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Synchroniser
          </Button>
          <Button onClick={() => setTxModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Transaction
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <PortfolioSummary
            totalInvested={summary.totalInvested}
            totalCurrentValue={summary.totalCurrentValue}
            totalGainLoss={summary.totalGainLoss}
            globalPerformance={summary.globalPerformance}
          />

          <Tabs defaultValue="holdings">
            <TabsList>
              <TabsTrigger value="holdings">Positions ({holdings.length})</TabsTrigger>
              <TabsTrigger value="history">Historique ({transactions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="mt-4">
              <div className="flex justify-end mb-3">
                <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                  <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setViewMode('table')}
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setViewMode('cards')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {viewMode === 'table' ? (
                <HoldingsTable holdings={holdings} onHoldingClick={setEditHolding} />
              ) : (
                <HoldingsCardList holdings={holdings} onHoldingClick={setEditHolding} />
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <TransactionList transactions={transactions} onDelete={(id) => setDeleteTxId(id)} />
            </TabsContent>
          </Tabs>
        </>
      )}

      <RecordTransactionModal
        open={txModalOpen}
        onOpenChange={setTxModalOpen}
        onSubmit={handleTxSubmit}
        isLoading={recordTransaction.isPending}
      />

      <SyncHoldingModal
        open={syncModalOpen}
        onOpenChange={setSyncModalOpen}
        onSubmit={handleSyncSubmit}
        isLoading={syncHolding.isPending}
      />

      <EditHoldingModal
        open={!!editHolding}
        onOpenChange={(open) => { if (!open) setEditHolding(null); }}
        holding={editHolding}
        onSubmit={handleEditSubmit}
        isLoading={syncHolding.isPending}
      />

      <AlertDialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette transaction ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTx} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PortfolioDetail;
