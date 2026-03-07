export type FormatCurrencyCode = 'usd' | 'brl' | 'eur';

const CURRENCY_CONFIG: Record<
  FormatCurrencyCode,
  { locale: string; currency: string; symbol: string }
> = {
  brl: { locale: 'pt-BR', currency: 'BRL', symbol: 'R$' },
  usd: { locale: 'en-US', currency: 'USD', symbol: '$' },
  eur: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
};

/**
 * Retorna o símbolo da moeda (ex: "R$", "$", "€").
 */
export function getCurrencySymbol(currency: FormatCurrencyCode): string {
  return CURRENCY_CONFIG[currency].symbol;
}

/**
 * Formata um valor numérico como moeda conforme o código (BRL, USD, EUR).
 * @returns String formatada com símbolo, ex: "R$ 1.234,56" ou "$1,234.56"
 */
export function formatCurrency(
  value: number,
  currency: FormatCurrencyCode,
  options?: Intl.NumberFormatOptions,
): string {
  const { locale, currency: currencyCode } = CURRENCY_CONFIG[currency];
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currency: currencyCode,
    style: 'currency',
    ...options,
  });
  return formatted;
}

/**
 * Formata um valor numérico como moeda em Real brasileiro (BRL).
 * @param value - Valor a ser formatado
 * @param options - Opções adicionais de formatação (Intl.NumberFormat)
 * @returns String formatada, ex: "1.234,56"
 */
export function formatBRL(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
}

export type FormatDateFormat = 'mdy' | 'dmy' | 'ymd';

/**
 * Formata data para exibição conforme o formato escolhido.
 * Aceita string ISO (YYYY-MM-DD), string dd/mm/yyyy, Date, ou Timestamp do Firestore.
 * @param dateFormat - mdy (MM/DD/YYYY), dmy (DD/MM/YYYY), ymd (YYYY-MM-DD). Omitido = dmy.
 */
export function formatDate(
  value: string | Date | { toDate: () => Date } | null | undefined,
  dateFormat: FormatDateFormat = 'dmy',
): string {
  if (value == null) return '—';
  let date: Date;
  if (typeof value === 'string') {
    const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      date = new Date(
        Number(ddmmyyyy[3]),
        Number(ddmmyyyy[2]) - 1,
        Number(ddmmyyyy[1]),
      );
    } else {
      date = new Date(value);
    }
  } else if (value instanceof Date) {
    date = value;
  } else if (
    value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    date = (value as { toDate: () => Date }).toDate();
  } else {
    return String(value);
  }
  if (Number.isNaN(date.getTime())) return String(value);

  if (dateFormat === 'ymd') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (dateFormat === 'mdy') {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
