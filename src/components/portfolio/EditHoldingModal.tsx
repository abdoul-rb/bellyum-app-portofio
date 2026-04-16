import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HoldingWithCalculations } from '@/types/asset';
import { SyncFormData } from '@/types/transaction';
import { adjustHoldingSchema } from '@/lib/schemas';

const schema = adjustHoldingSchema;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: HoldingWithCalculations | null;
  onSubmit: (data: SyncFormData) => void;
  isLoading?: boolean;
}

export const EditHoldingModal = ({ open, onOpenChange, holding, onSubmit, isLoading }: Props) => {
  const form = useForm<SyncFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      asset_id: '',
      quantity: 0,
      average_price: 0,
      total_fees: 0,
      transaction_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open && holding) {
      form.reset({
        asset_id: holding.asset_id,
        quantity: holding.quantity,
        average_price: holding.average_price,
        total_fees: holding.total_fees,
        transaction_date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, holding, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuster la position</DialogTitle>
        </DialogHeader>

        {holding && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border mb-2">
            <span className="font-mono font-bold text-foreground">{holding.asset?.ticker}</span>
            <span className="text-sm text-muted-foreground truncate">{holding.asset?.name}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="average_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>PRU cible (XOF)</FormLabel>
                  <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="total_fees" render={({ field }) => (
              <FormItem>
                <FormLabel>Frais globaux cumulés (XOF)</FormLabel>
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
