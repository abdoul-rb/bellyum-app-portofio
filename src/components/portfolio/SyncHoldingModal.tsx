import { useEffect } from 'react';
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
import { SyncFormData } from '@/types/transaction';
import { useAssets } from '@/hooks/useAssets';

const schema = z.object({
  asset_id: z.string().min(1, "Sélectionnez un actif"),
  quantity: z.coerce.number().min(0, 'Quantité ≥ 0'),
  average_price: z.coerce.number().min(0, 'Prix ≥ 0'),
  transaction_date: z.string().min(1, 'La date est requise'),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SyncFormData) => void;
  isLoading?: boolean;
}

export const SyncHoldingModal = ({ open, onOpenChange, onSubmit, isLoading }: Props) => {
  const { assets } = useAssets();

  const form = useForm<SyncFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      asset_id: '',
      quantity: 0,
      average_price: 0,
      transaction_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        asset_id: '',
        quantity: 0,
        average_price: 0,
        transaction_date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Synchroniser une position</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="asset_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Actif</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un actif..." /></SelectTrigger>
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
                  <FormLabel>Quantité actuelle</FormLabel>
                  <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="average_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix moyen (XOF)</FormLabel>
                  <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="transaction_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                Synchroniser
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
