/**
 * Formas de pagamento: constantes e helpers.
 */

import type { PaymentMethod } from '@/types/transactions';

export const PAYMENT_METHOD_KEYS: PaymentMethod[] = [
  'credit_personal',
  'credit_business',
  'debit',
  'pix',
  'cash',
];

export const CARD_PAYMENT_METHODS: PaymentMethod[] = [
  'credit_personal',
  'credit_business',
];

export function isCardPayment(method?: string | null): method is PaymentMethod {
  return method === 'credit_personal' || method === 'credit_business';
}
