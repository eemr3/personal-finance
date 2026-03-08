'use client';

import {
  formatCurrency as formatCurrencyLib,
  getCurrencyInputConfig,
  getCurrencySymbol,
  type FormatCurrencyCode,
} from '@/lib/format';
import { useAppearance } from '@/contexts/AppearanceContext';

/**
 * Hook que retorna formatação de moeda e símbolo conforme a preferência do usuário (Aparência).
 * Inclui currencyInputConfig para posicionar símbolo em inputs (prefix/suffix + espaçamento).
 */
export function useFormatCurrency() {
  const { currency } = useAppearance();
  const code = currency as FormatCurrencyCode;

  return {
    currency: code,
    currencySymbol: getCurrencySymbol(code),
    currencyInputConfig: getCurrencyInputConfig(code),
    formatCurrency: (value: number) => formatCurrencyLib(value, code),
  };
}
