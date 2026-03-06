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

/**
 * Formata data para exibição em pt-BR.
 * Aceita string ISO (YYYY-MM-DD), string dd/mm/yyyy, Date, ou Timestamp do Firestore.
 */
export function formatDate(
  value: string | Date | { toDate: () => Date } | null | undefined,
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
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
