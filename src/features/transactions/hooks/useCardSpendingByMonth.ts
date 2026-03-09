'use client';

import { useMemo } from 'react';
import { useTransactionsWithRules } from './useTransactionsWithRules';
import { usePeriod } from '@/contexts/PeriodContext';
import {
  CARD_PAYMENT_METHODS,
  isCardPayment,
} from '@/lib/payment-methods';
import type { PaymentMethod } from '@/types/transactions';

export interface CardSummary {
  paymentMethod: PaymentMethod;
  total: number;
  transactions: Array<{
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod?: string;
    source?: 'manual' | 'rule';
  }>;
}

export function useCardSpendingByMonth() {
  const { period } = usePeriod();
  const {
    allExpenses,
    totalIncome,
    loading,
    editTransaction,
    removeTransaction,
  } = useTransactionsWithRules();

  const periodKey = `${period.year}-${String(period.month).padStart(2, '0')}`;

  const summariesByCard = useMemo(() => {
    const cardExpenses = allExpenses.filter((e) =>
      isCardPayment((e as { paymentMethod?: string }).paymentMethod),
    );

    const inPeriod = cardExpenses.filter((e) => {
      const dateStr = e.date ?? '';
      const [y, m] = dateStr.split('-');
      return `${y}-${m}` === periodKey;
    });

    const byCard: Record<string, CardSummary> = {};

    for (const method of CARD_PAYMENT_METHODS) {
      const items = inPeriod.filter(
        (e) => (e as { paymentMethod?: string }).paymentMethod === method,
      );
      const total = items.reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
      byCard[method] = {
        paymentMethod: method,
        total,
        transactions: items.map((t) => ({
          id: (t as { id?: string }).id ?? '',
          name: t.name ?? '',
          amount: Number(t.amount ?? 0),
          category: t.category ?? '',
          date: t.date ?? '',
          paymentMethod: (t as { paymentMethod?: string }).paymentMethod,
          source: (t as { source?: 'manual' | 'rule' }).source,
        })),
      };
    }

    return byCard;
  }, [allExpenses, periodKey]);

  const cards = useMemo(
    () =>
      CARD_PAYMENT_METHODS.map((m) => summariesByCard[m]).filter(
        (s) => s.total > 0,
      ),
    [summariesByCard],
  );

  return {
    cards,
    summariesByCard,
    totalIncome,
    period,
    loading,
    editTransaction,
    removeTransaction,
  };
}
