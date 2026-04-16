import { z } from 'zod';

/**
 * Schéma pour l'enregistrement d'une transaction (achat ou vente).
 * Utilisé par RecordTransactionModal.
 */
export const transactionSchema = z.object({
  asset_id: z.string().min(1, 'Sélectionnez un actif'),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.coerce.number().min(0.0001, 'Quantité min. 0.0001'),
  price: z.coerce.number().min(0.0001, 'Prix min. 0.0001'),
  fees: z.coerce.number().min(0, 'Les frais doivent être ≥ 0'),
  transaction_date: z.string().min(1, 'La date est requise'),
  notes: z.string().optional(),
});

/**
 * Schéma pour la synchronisation d'une nouvelle position (actif inconnu).
 * Utilisé par SyncHoldingModal.
 */
export const syncHoldingSchema = z.object({
  asset_id: z.string().min(1, 'Sélectionnez un actif'),
  quantity: z.coerce.number().min(0, 'Quantité ≥ 0'),
  average_price: z.coerce.number().min(0, 'Prix ≥ 0'),
  transaction_date: z.string().min(1, 'La date est requise'),
});

/**
 * Schéma pour l'ajustement manuel d'une position existante (frais inclus).
 * Utilisé par EditHoldingModal.
 */
export const adjustHoldingSchema = z.object({
  asset_id: z.string(),
  quantity: z.coerce.number().min(0, 'Quantité ≥ 0'),
  average_price: z.coerce.number().min(0, 'PRU ≥ 0'),
  total_fees: z.coerce.number().min(0, 'Frais ≥ 0'),
  transaction_date: z.string().min(1, 'La date est requise'),
});
