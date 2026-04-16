import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Asset } from '@/types/asset';
import { TransactionFormData } from '@/types/transaction';
import { useAssets } from '@/hooks/useAssets';
import { cn } from '@/lib/utils';

const schema = z.object({
  asset_id: z.string().min(1, "Sélectionnez un actif"),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.coerce.number().min(0.0001, 'Quantité min. 0.0001'),
  price: z.coerce.number().min(0.0001, 'Prix min. 0.0001'),
  fees: z.coerce.number().min(0, 'Les frais doivent être ≥ 0'),
  transaction_date: z.string().min(1, 'La date est requise'),
  notes: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  isLoading?: boolean;
}

export const RecordTransactionModal = ({ open, onOpenChange, onSubmit, isLoading }: Props) => {
  const { assets } = useAssets();
  const [selectedType, setSelectedType] = useState<'BUY' | 'SELL'>('BUY');

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      asset_id: '',
      type: 'BUY',
      quantity: 0,
      price: 0,
      fees: 0,
      transaction_date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        asset_id: '',
        type: 'BUY',
        quantity: 0,
        price: 0,
        fees: 0,
        transaction_date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setSelectedType('BUY');
    }
  }, [open, form]);

  // Auto-fill price when asset selected
  const watchedAssetId = form.watch('asset_id');
  useEffect(() => {
    if (watchedAssetId) {
      const asset = assets.find(a => a.id === watchedAssetId);
      if (asset?.current_price) {
        form.setValue('price', asset.current_price);
      }
    }
  }, [watchedAssetId, assets, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer une transaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type toggle */}
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(['BUY', 'SELL'] as const).map(t => (
                    <Button
                      key={t}
                      type="button"
                      variant={field.value === t ? 'default' : 'outline'}
                      className={cn(
                        field.value === t && t === 'BUY' && 'bg-gain hover:bg-gain/90 text-gain-foreground',
                        field.value === t && t === 'SELL' && 'bg-loss hover:bg-loss/90 text-loss-foreground',
                      )}
                      onClick={() => { field.onChange(t); setSelectedType(t); }}
                    >
                      {t === 'BUY' ? '🟢 Achat' : '🔴 Vente'}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            {/* Asset selector */}
            <FormField control={form.control} name="asset_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Actif</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un actif..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60">
                    {assets.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.ticker} — {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix unitaire (XOF)</FormLabel>
                  <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="fees" render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais (XOF)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="transaction_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optionnel)</FormLabel>
                <FormControl><Input placeholder="Commentaire..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
