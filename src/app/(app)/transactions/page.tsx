'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionCard } from '@/components/TransactionCard';
import { useTransactionsWithRules } from '@/features/transactions/hooks/useTransactionsWithRules';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

const FILTER_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'income' as const, label: 'Income' },
  { value: 'expense' as const, label: 'Expenses' },
] as const;

function TransactionsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { formatCurrency } = useFormatCurrency();
  const {
    allTransactionsForDisplay,
    totalIncome,
    totalExpenses,
    loading,
    removeTransaction,
  } = useTransactionsWithRules();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all',
  );

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const txType = (t: { type?: unknown }) =>
      String(t.type ?? '')
        .toLowerCase()
        .trim();
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
      <div className="px-4 pb-4">
        <AppHeader
          title={t('transactions.title')}
          subtitle={t('transactions.subtitle')}
        />
      </div>

      <div className="px-6 pt-2 pb-24 bg-linear-to-b from-primary/5 via-background to-background min-h-[50vh]">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <MonthSelector />
        </div>

        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            Resumo
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-all duration-200">
              <p className="text-sm text-muted-foreground mb-1">
                Total receitas
              </p>
              <p className="text-xl font-medium text-success">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-all duration-200">
              <p className="text-sm text-muted-foreground mb-1">
                Total despesas
              </p>
              <p className="text-xl font-medium text-danger">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </section>

        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
          />
        </div>

        <div className="flex gap-2 mb-6">
          {FILTER_OPTIONS.map(({ value, label }) => {
            const isActive = filterType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilterType(value)}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ease-out ${
                  isActive
                    ? value === 'all'
                      ? 'bg-primary/10 border-primary/40 text-foreground font-medium'
                      : value === 'income'
                        ? 'bg-success/10 border-success/40 text-success font-medium'
                        : 'bg-danger/10 border-danger/40 text-danger font-medium'
                    : 'bg-card border-border text-muted-foreground hover:bg-accent/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            Transações
          </h2>
          <div className="space-y-2">
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
          <div className="rounded-xl border border-border border-dashed bg-card/50 px-6 py-12 text-center">
            <p className="text-muted-foreground">Não há transações</p>
          </div>
        )}
          </div>
        </section>
      </div>

      <FloatingActionButton onClick={() => router.push('/transactions/new')} />
      <BottomNav />
    </div>
  );
}

export default TransactionsPage;
