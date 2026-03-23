'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MonthSelector } from '@/components/layout';
import { TransactionCard } from '@/features/transactions/components/TransactionCard';
import { useTransactionsWithRules } from '@/features/transactions/hooks/useTransactionsWithRules';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

const FILTER_OPTIONS = [
  { value: 'all' as const, labelKey: 'transactions.all' as const },
  { value: 'income' as const, labelKey: 'transactions.income' as const },
  { value: 'expense' as const, labelKey: 'transactions.expense' as const },
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );

  console.log('allTransactionsForDisplay', allTransactionsForDisplay);
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {t('transactions.title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('transactions.completeHistory')}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <MonthSelector />
      </div>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-white/5 p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {t('dashboard.income')}
          </p>
          <p className="text-xl font-semibold text-success">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="rounded-2xl bg-card border border-white/5 p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {t('dashboard.expense')}
          </p>
          <p className="text-xl font-semibold text-danger">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </section>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder={t('transactions.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={clsx(
            'w-full bg-secondary border border-white/5 rounded-2xl h-14 pl-12 focus:outline-none focus:border-primary/50 transition-colors',
            searchQuery ? 'pr-12' : 'pr-4',
          )}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label={t('common.clear')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex p-1 bg-secondary rounded-xl">
        {FILTER_OPTIONS.map(({ value, labelKey }) => {
          const isActive = filterType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilterType(value)}
              className={clsx(
                'flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all',
                isActive
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3 pb-24">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const isManual = transaction.source !== 'rule';
            return (
              <TransactionCard
                key={transaction.id}
                id={transaction.id}
                type={(transaction.type as 'income' | 'expense') ?? 'expense'}
                name={transaction.name ?? ''}
                amount={Number(
                  (transaction as { amount?: number }).amount ?? 0,
                )}
                category={transaction.category}
                paymentMethod={transaction.paymentMethod}
                date={transaction.date as string}
                source={transaction.source}
                onEdit={
                  isManual
                    ? () =>
                        router.push(`/transactions/edit?id=${transaction.id}`)
                    : undefined
                }
                onDelete={
                  isManual && transaction.id
                    ? () => {
                        setTransactionToDelete(transaction.id);
                        setDeleteConfirmOpen(true);
                      }
                    : undefined
                }
              />
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
            {t('transactions.noTransactionsFound')}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('common.confirmDelete')}
        description={t('transactions.deleteTransactionConfirm')}
        onConfirm={() => {
          if (transactionToDelete) {
            removeTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }
        }}
        variant="destructive"
      />
    </div>
  );
}

export default TransactionsPage;
