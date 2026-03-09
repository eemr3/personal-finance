'use client';

import { type FormEvent, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input, TextArea, Select } from '@/components/Input';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { getCategoryLabel } from '@/lib/categories';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import type { CategoryOption } from '@/types/categories';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EditTransactionPageProps {
  id: string;
}

export function EditTransactionPage({ id }: EditTransactionPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { currencyInputConfig } = useFormatCurrency();
  const { transactions, editTransaction, removeTransaction } = useTransactions();
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'expense',
  );
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    date: '',
    notes: '',
  });
  const [deleting, setDeleting] = useState(false);

  const transaction = transactions.find((t) => t.id === id);

  useEffect(() => {
    if (transaction) {
      setTransactionType((transaction.type as 'income' | 'expense') || 'expense');
      setFormData({
        name: transaction.name || '',
        amount: String(transaction.amount ?? ''),
        category: transaction.category || '',
        date:
          typeof transaction.date === 'string'
            ? transaction.date
            : new Date().toISOString().split('T')[0],
        notes: (transaction as { notes?: string }).notes || '',
      });
    }
  }, [transaction]);

  const categories: CategoryOption[] = useMemo(() => {
    const type = transactionType;
    const base =
      type === 'income'
        ? INCOME_CATEGORIES.map((key) => ({
            value: key,
            label: t(`transactions.categoriesIncome.${key}`),
          }))
        : EXPENSE_CATEGORIES.map((key) => ({
            value: key,
            label: t(`transactions.categoriesExpense.${key}`),
          }));
    const current = formData.category?.trim();
    if (current && !base.some((o) => o.value === current)) {
      return [
        {
          value: current,
          label: getCategoryLabel(current, type, t),
        },
        ...base,
      ];
    }
    return base;
  }, [transactionType, formData.category, t]);

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-muted-foreground">
          {t('transactions.noTransactionsFound')}
        </p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const date =
      formData.date || new Date().toISOString().split('T')[0];
    await editTransaction(id, {
      ...formData,
      date,
      type: transactionType,
    });
    router.push('/transactions');
  };

  const handleDelete = async () => {
    if (!confirm(t('transactions.deleteTransactionConfirm'))) return;
    setDeleting(true);
    await removeTransaction(id);
    router.push('/transactions');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1>{t('transactions.edit')}</h1>
          <div className="w-10" />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTransactionType('expense')}
            className={`flex-1 py-3 rounded-xl border transition-all duration-200 ease-out ${
              transactionType === 'expense'
                ? 'bg-danger text-danger-foreground border-danger shadow-sm'
                : 'bg-card border-border text-foreground hover:bg-accent/80'
            }`}
          >
            {t('transactions.expense')}
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('income')}
            className={`flex-1 py-3 rounded-xl border transition-all duration-200 ease-out ${
              transactionType === 'income'
                ? 'bg-success text-success-foreground border-success shadow-sm'
                : 'bg-card border-border text-foreground hover:bg-accent/80'
            }`}
          >
            {t('transactions.income')}
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-6 pt-2 pb-24 space-y-6 bg-linear-to-b from-primary/5 via-background to-background"
      >
        <div>
          <Input
            label={t('transactions.name')}
            placeholder={
              transactionType === 'expense'
                ? t('transactions.namePlaceholderExpense')
                : t('transactions.namePlaceholderIncome')
            }
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            {t('transactions.amount')}
          </label>
          <div className="relative">
            {currencyInputConfig.prefix ? (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                {currencyInputConfig.prefix}
              </span>
            ) : null}
            {currencyInputConfig.suffix ? (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                {currencyInputConfig.suffix}
              </span>
            ) : null}
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className={`w-full py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-2xl ${currencyInputConfig.inputPlClass} ${currencyInputConfig.inputPrClass}`}
              required
            />
          </div>
        </div>

        <div>
          <Select
            label={t('transactions.category')}
            options={categories}
            value={formData.category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Input
            type="date"
            label={t('transactions.date')}
            value={formData.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, date: e.target.value })
            }
            required
          />
        </div>

        <div>
          <TextArea
            label={t('transactions.notes')}
            placeholder={
              transactionType === 'expense'
                ? t('transactions.notesPlaceholderExpense')
                : t('transactions.notesPlaceholderIncome')
            }
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" fullWidth size="lg">
            {t('common.save')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => router.back()}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={handleDelete}
            disabled={deleting}
            className="text-danger hover:bg-danger/10"
          >
            {t('transactions.delete')}
          </Button>
        </div>
      </form>
    </div>
  );
}
