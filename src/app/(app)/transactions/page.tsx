'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { PeriodSelector } from '@/components/PeriodSelector';
import { TransactionCard } from '@/components/TransactionCard';
import { useTransactionsWithRules } from '@/features/transactions/hooks/useTransactionsWithRules';
import { formatBRL } from '@/lib/format';

const FILTER_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'income' as const, label: 'Income' },
  { value: 'expense' as const, label: 'Expenses' },
] as const;

function TransactionsPage() {
  const router = useRouter();
  const {
    allTransactionsForDisplay,
    totalIncome,
    totalExpenses,
    loading,
    editTransaction,
    removeTransaction,
  } = useTransactionsWithRules();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all',
  );

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const txType = (t: { type?: unknown }) =>
      String(t.type ?? '').toLowerCase().trim();
    return allTransactionsForDisplay.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.name?.toLowerCase().includes(query) ||
        transaction.category?.toLowerCase().includes(query);
      const type = txType(transaction);
      const matchesFilter =
        filterType === 'all' ||
        type === filterType ||
        (filterType === 'expense' && (type === 'expense' || type === ''));
      return matchesSearch && matchesFilter;
    });
  }, [allTransactionsForDisplay, searchQuery, filterType]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
        <h1 className="mb-4">Transações</h1>
        <div className="mb-6">
          <PeriodSelector />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-xl text-success">R$ {formatBRL(totalIncome)}</p>
          </div>
          <div className="bg-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-xl text-danger">R$ {formatBRL(totalExpenses)}</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex gap-2">
          {FILTER_OPTIONS.map(({ value, label }) => {
            const isActive = filterType === value;
            const activeClass =
              value === 'all'
                ? 'bg-primary text-primary-foreground'
                : value === 'income'
                  ? 'bg-success text-success-foreground'
                  : 'bg-danger text-danger-foreground';
            return (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? activeClass
                    : 'bg-card text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const isManual = transaction.source !== 'rule';
            return (
              <TransactionCard
                key={transaction.id}
                {...transaction}
                onEdit={
                  isManual
                    ? () => router.push(`/transactions/${transaction.id}/edit`)
                    : undefined
                }
                onDelete={
                  isManual
                    ? () => {
                        if (confirm('Excluir esta transação?')) {
                          removeTransaction(transaction.id);
                        }
                      }
                    : undefined
                }
              />
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Não há transações</p>
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => router.push('/transactions/new')} />
      <BottomNav />
    </div>
  );
}

export default TransactionsPage;
