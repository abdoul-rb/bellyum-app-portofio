import { useState } from 'react';
import { Portfolio, PortfolioFormData } from '@/types/asset';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PortfolioSelectorProps {
  portfolios: Portfolio[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (data: PortfolioFormData) => void;
  onUpdate: (data: PortfolioFormData & { id: string }) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const PortfolioSelector = ({
  portfolios,
  selectedId,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}: PortfolioSelectorProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const openCreate = () => {
    setEditingPortfolio(null);
    setName('');
    setDialogOpen(true);
  };

  const openEdit = () => {
    const p = portfolios.find((p) => p.id === selectedId);
    if (p) {
      setEditingPortfolio(p);
      setName(p.name);
      setDialogOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingPortfolio) {
      onUpdate({ id: editingPortfolio.id, name: name.trim() });
    } else {
      onAdd({ name: name.trim() });
    }
    setDialogOpen(false);
    setName('');
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedId ?? ''} onValueChange={onSelect}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Sélectionner un portefeuille" />
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={openCreate} title="Nouveau portefeuille">
          <Plus className="h-4 w-4" />
        </Button>
        {selectedId && (
          <>
            <Button variant="ghost" size="icon" onClick={openEdit} title="Renommer">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteId(selectedId)}
              title="Supprimer"
              disabled={portfolios.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingPortfolio ? 'Renommer le portefeuille' : 'Nouveau portefeuille'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="portfolio-name">Nom</Label>
              <Input
                id="portfolio-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon portefeuille"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={!name.trim() || isLoading}>
                {editingPortfolio ? 'Renommer' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce portefeuille ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tous les actifs de ce portefeuille seront supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
