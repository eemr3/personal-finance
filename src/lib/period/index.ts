export interface Period {
  month: number;
  year: number;
}

export function getCurrentPeriod(): Period {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function toDateString(period: Period, day: number): string {
  const m = String(period.month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${period.year}-${m}-${d}`;
}

export function getPeriodRange(period: Period): { start: string; end: string } {
  const lastDay = new Date(period.year, period.month, 0).getDate();
  return {
    start: toDateString(period, 1),
    end: toDateString(period, lastDay),
  };
}

/**
 * Verifica se uma transação está dentro do período.
 */
function parseDateLocal(dateStr: string): Date {
  const ymd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }
  return new Date(dateStr);
}

export function isTransactionInPeriod(
  t: { date?: string; createdAt?: { toDate?: () => Date } },
  period: Period,
): boolean {
  const { start, end } = getPeriodRange(period);
  const startDate = parseDateLocal(start);
  const endDate = parseDateLocal(end);
  endDate.setHours(23, 59, 59, 999);

  let date: Date | null = null;

  if (typeof t.date === 'string' && t.date.trim()) {
    const ddmmyyyy = t.date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      date = new Date(
        Number(ddmmyyyy[3]),
        Number(ddmmyyyy[2]) - 1,
        Number(ddmmyyyy[1]),
      );
    } else {
      date = parseDateLocal(t.date);
    }
  }

  const ts = t.createdAt as { toDate?: () => Date } | undefined;
  if ((!date || Number.isNaN(date.getTime())) && ts?.toDate) {
    date = ts.toDate();
  }

  if (!date || Number.isNaN(date.getTime())) return false;
  return date >= startDate && date <= endDate;
}

export const MONTH_NAMES: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
};
