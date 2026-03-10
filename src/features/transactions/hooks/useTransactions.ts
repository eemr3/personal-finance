'use client';

import { useEffect, useState } from 'react';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/features/transactions/services/transactions.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePeriod } from '@/providers/PeriodProvider';

export function useTransactions() {
  const { user } = useAuth();
  const { period } = usePeriod();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchTransactions() {
    if (!user?.uid) {
      setTransactions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getTransactions(user.uid, period);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }

  async function addTransaction(data: Record<string, unknown>) {
    if (!user?.uid) return;
    const id = await createTransaction(data, user.uid);
    setTransactions((prev) => [{ id, ...data, userId: user.uid }, ...prev]);
  }

  async function editTransaction(
    id: string,
    data: Record<string, unknown>,
  ) {
    await updateTransaction(id, data);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t)),
    );
  }

  async function removeTransaction(id: string) {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    fetchTransactions();
  }, [user?.uid, period.month, period.year]);

  return {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    removeTransaction,
    fetchTransactions,
  };
}
