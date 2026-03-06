'use client';

import { useMemo } from 'react';
import { useFixedExpenseRules } from '@/features/rules/hooks/useFixedExpenseRules';
import { calculateExpensesFromRules } from '@/lib/rules';
import { useTransactions } from './useTransactions';
import { usePeriod } from '@/contexts/PeriodContext';

export function useTransactionsWithRules() {
  const {
    transactions,
    loading: transactionsLoading,
    editTransaction,
    removeTransaction,
  } = useTransactions();
  const { rules, loading: rulesLoading } = useFixedExpenseRules();
  const { period } = usePeriod();

  const normalizeType = (t: { type?: unknown }) =>
    String(t.type ?? '').toLowerCase().trim();

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => normalizeType(t) === 'income')
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  }, [transactions]);

  const projectedExpenses = useMemo(() => {
    return calculateExpensesFromRules(rules, totalIncome, period);
  }, [rules, totalIncome, period]);

  const allExpenses = useMemo(() => {
    const realExpenses = transactions.filter(
      (t) => normalizeType(t) === 'expense' || normalizeType(t) === '',
    );
    const virtualExpenses = projectedExpenses.map((exp, i) => ({
      ...exp,
      id: `rule-${exp.ruleId}-${i}`,
    }));
    return [...realExpenses, ...virtualExpenses];
  }, [transactions, projectedExpenses]);

  const totalRealExpenses = useMemo(() => {
    return transactions
      .filter(
        (t) => normalizeType(t) === 'expense' || normalizeType(t) === '',
      )
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  }, [transactions]);

  const totalProjectedExpenses = useMemo(() => {
    return projectedExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [projectedExpenses]);

  const totalExpenses = totalRealExpenses + totalProjectedExpenses;

  const allTransactionsForDisplay = useMemo(() => {
    const incomeTransactions = transactions.filter(
      (t) => normalizeType(t) === 'income',
    );
    const combined = [...incomeTransactions, ...allExpenses];
    const toSortKey = (t: (typeof combined)[0]) => {
      if (typeof t.date === 'string') return t.date;
      const ts = (t as { createdAt?: { toDate?: () => Date } }).createdAt;
      if (ts && typeof (ts as { toDate: () => Date }).toDate === 'function')
        return (ts as { toDate: () => Date }).toDate().toISOString();
      return '';
    };
    return combined.sort((a, b) =>
      toSortKey(b).localeCompare(toSortKey(a)),
    );
  }, [transactions, allExpenses]);

  return {
    transactions,
    allExpenses,
    projectedExpenses,
    allTransactionsForDisplay,
    totalIncome,
    totalRealExpenses,
    totalProjectedExpenses,
    totalExpenses,
    loading: transactionsLoading || rulesLoading,
    editTransaction,
    removeTransaction,
  };
}
