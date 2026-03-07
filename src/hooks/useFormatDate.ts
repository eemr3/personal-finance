'use client';

import { formatDate as formatDateLib, type FormatDateFormat } from '@/lib/format';
import { useAppearance } from '@/contexts/AppearanceContext';

type DateValue = string | Date | { toDate: () => Date } | null | undefined;

/**
 * Hook que retorna formatação de data conforme a preferência do usuário (Aparência).
 * mdy = MM/DD/YYYY, dmy = DD/MM/YYYY, ymd = YYYY-MM-DD.
 */
export function useFormatDate() {
  const { dateFormat } = useAppearance();
  const format = dateFormat as FormatDateFormat;

  return {
    dateFormat: format,
    formatDate: (value: DateValue) => formatDateLib(value, format),
  };
}
