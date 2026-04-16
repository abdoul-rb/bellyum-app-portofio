import { useAuth } from '@/contexts/AuthContext';
import { usePortfolios } from '@/hooks/usePortfolios';
import { Portfolio, PortfolioFormData } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Portfolios = () => {
  const { portfolios, isLoading, addPortfolio, deletePortfolio } = usePortfolios();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addPortfolio.mutate({ name: name.trim(), description: description.trim() || undefined }, {
      onSuccess: () => {
        setDialogOpen(false);
        setName('');
        setDescription('');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Portefeuilles</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un portefeuille
        </Button>
      </div>

      {portfolios.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">Aucun portefeuille</h3>
          <p className="text-sm text-muted-foreground mb-4">Créez votre premier portefeuille pour commencer</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un portefeuille
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {portfolios.map(p => (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/portfolios/${p.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{p.name}</CardTitle>
                {p.description && <CardDescription>{p.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Créé le {new Date(p.created_at).toLocaleDateString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nouveau portefeuille</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="pf-name">Nom *</Label>
              <Input id="pf-name" value={name} onChange={e => setName(e.target.value)} placeholder="Mon portefeuille BRVM" maxLength={255} autoFocus />
            </div>
            <div>
              <Label htmlFor="pf-desc">Description</Label>
              <Textarea id="pf-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optionnel..." maxLength={1000} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" className="flex-1" disabled={!name.trim() || addPortfolio.isPending}>Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Portfolios;
