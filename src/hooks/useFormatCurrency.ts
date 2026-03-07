'use client';

import {
  formatCurrency as formatCurrencyLib,
  getCurrencySymbol,
  type FormatCurrencyCode,
} from '@/lib/format';
import { useAppearance } from '@/contexts/AppearanceContext';

/**
 * Hook que retorna formatação de moeda e símbolo conforme a preferência do usuário (Aparência).
 */
export function useFormatCurrency() {
  const { currency } = useAppearance();
  const code = currency as FormatCurrencyCode;

  return {
    currency: code,
    currencySymbol: getCurrencySymbol(code),
    formatCurrency: (value: number) => formatCurrencyLib(value, code),
  };
}
