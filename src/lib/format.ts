export type FormatCurrencyCode = 'usd' | 'brl' | 'eur';

const CURRENCY_CONFIG: Record<
  FormatCurrencyCode,
  { locale: string; currency: string; symbol: string }
> = {
  brl: { locale: 'pt-BR', currency: 'BRL', symbol: 'R$' },
  usd: { locale: 'en-US', currency: 'USD', symbol: '$' },
  eur: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
};

/** Padrão internacional: BRL "R$ 100", USD "$100", EUR "100 €" */
export type CurrencyInputConfig = {
  position: 'prefix' | 'suffix';
  prefix: string;
  suffix: string;
  /** Classe de padding-left do input quando prefixo (ex.: pl-8 para $ colado, pl-12 para R$ com espaço). */
  inputPlClass: string;
  /** Classe de padding-right do input quando sufixo. */
  inputPrClass: string;
};

/**
 * Retorna o símbolo da moeda (ex: "R$", "$", "€").
 */
export function getCurrencySymbol(currency: FormatCurrencyCode): string {
  return CURRENCY_CONFIG[currency].symbol;
}

/**
 * Configuração para exibir moeda em inputs (símbolo + espaçamento conforme idioma).
 * BRL: prefixo "R$ " (espaço após) → pl-12. USD: prefixo "$" (sem espaço) → pl-8. EUR: sufixo " €".
 */
export function getCurrencyInputConfig(
  currency: FormatCurrencyCode,
): CurrencyInputConfig {
  switch (currency) {
    case 'brl':
      return {
        position: 'prefix',
        prefix: 'R$ ',
        suffix: '',
        inputPlClass: 'pl-12',
        inputPrClass: 'pr-4',
      };
    case 'usd':
      return {
        position: 'prefix',
        prefix: '$',
        suffix: '',
        inputPlClass: 'pl-8',
        inputPrClass: 'pr-4',
      };
    case 'eur':
      return {
        position: 'suffix',
        prefix: '',
        suffix: ' €',
        inputPlClass: 'pl-4',
        inputPrClass: 'pr-10',
      };
    default:
      return {
        position: 'prefix',
        prefix: 'R$ ',
        suffix: '',
        inputPlClass: 'pl-12',
        inputPrClass: 'pr-4',
      };
  }
}

/**
 * Remove símbolos de moeda e % de uma string de valor (ex.: "R$ 1.234,56" → "1234.56", "10%" → "10").
 * Aceita formato pt-BR (1.234,56) e en-US (1,234.56).
 */
export function stripCurrencyFromAmount(amountStr: string): string {
  let s = amountStr.replace(/%/g, '').replace(/[R$\s€]/g, '').replace(/\s+/g, '').trim();
  if (!s) return '';
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    s = s.replace(',', '.');
  } else if (hasDot) {
    s = s.replace(/\.(?=.*\.)/g, '');
  }
  return s;
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
