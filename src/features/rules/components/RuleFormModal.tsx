'use client';

import React, { type FormEvent, useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/AppButton';
import { Input, Select } from '@/components/ui/AppInput';
import { X } from 'lucide-react';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { stripCurrencyFromAmount } from '@/lib/format';
import { FIXED_EXPENSE_CATEGORIES } from '@/lib/categories';
import { PAYMENT_METHOD_KEYS } from '@/lib/payment-methods';
import { useTranslation } from 'react-i18next';

type ConditionType =
  | 'always'
  | 'income_above'
  | 'day_of_month'
  | 'automatic'
  | 'custom';

function parseConditionAmount(value: string): number {
  const s = (value || '').trim();
  if (!s) return Number.NaN;
  if (s.includes(',')) {
    const brazilian = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(brazilian);
  }
  return parseFloat(s);
}

function buildConditionString(
  type: ConditionType,
  incomeMin: string,
  day: string,
  custom: string,
  formatCurrency: (value: number) => string,
  t: (key: string, opts?: { [key: string]: string }) => string,
): string {
  const always = t('fixedExpenses.rules.conditionAlways');
  switch (type) {
    case 'always':
      return always;
    case 'income_above': {
      const num = parseConditionAmount(incomeMin);
      if (Number.isNaN(num) || num <= 0) return always;
      return t('fixedExpenses.rules.conditionIncomeAboveValue', {
        value: formatCurrency(num),
      });
    }
    case 'day_of_month':
      return day
        ? t('fixedExpenses.rules.conditionDayOfMonthValue', { day })
        : always;
    case 'automatic':
      return t('fixedExpenses.rules.conditionAutomatic');
    case 'custom':
      return custom.trim() || always;
    default:
      return always;
  }
}

function parseCondition(
  condition: string,
  t: (key: string) => string,
): {
  type: ConditionType;
  incomeMin: string;
  day: string;
  custom: string;
} {
  const c = (condition || '').trim();
  const lower = c.toLowerCase();
  const always = t('fixedExpenses.rules.conditionAlways').toLowerCase();
  if (!c || lower.includes(always)) {
    return { type: 'always', incomeMin: '', day: '', custom: '' };
  }
  const incomeKeyword = t(
    'fixedExpenses.conditionIncomeAboveContains',
  ).toLowerCase();
  if (lower.includes(incomeKeyword)) {
    const num = c
      .replace(/[^\d,.]/g, '')
      .replace(',', '.')
      .replace(/\.(?=.*\.)/g, '');
    if (num)
      return { type: 'income_above', incomeMin: num, day: '', custom: '' };
  }
  const dayKeyword = t(
    'fixedExpenses.conditionDayOfMonthContains',
  ).toLowerCase();
  if (lower.includes(dayKeyword)) {
    const dayMatch = c.match(/\b(\d{1,2})\b/);
    const d = dayMatch?.[1]?.trim() ?? '';
    if (d && Number(d) >= 1 && Number(d) <= 31)
      return { type: 'day_of_month', incomeMin: '', day: d, custom: '' };
  }
  return { type: 'custom', incomeMin: '', day: '', custom: c };
}

export interface RuleForEdit {
  id: string;
  name: string;
  condition: string;
  amount: string;
  amountType?: 'fixed' | 'percentage';
  category: string;
  paymentMethod?: string;
}

interface RuleFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRule: RuleForEdit | null;
  onSave: (payload: Record<string, unknown>, isEdit: boolean, id?: string) => void;
}

export function RuleFormModal({
  open,
  onClose,
  editingRule,
  onSave,
}: RuleFormModalProps) {
  const { t } = useTranslation();
  const { currencyInputConfig, formatCurrency } = useFormatCurrency();

  const categoryOptions = useMemo(
    () =>
      FIXED_EXPENSE_CATEGORIES.map((key) => ({
        value: key,
        label: t(`transactions.categoriesFixedExpense.${key}`),
      })),
    [t],
  );

  const conditionTypeOptions = useMemo(
    () => [
      { value: 'always', label: t('fixedExpenses.rules.conditionAlways') },
      { value: 'income_above', label: t('fixedExpenses.rules.conditionIncomeAbove') },
      { value: 'day_of_month', label: t('fixedExpenses.rules.conditionDayOfMonth') },
      { value: 'automatic', label: t('fixedExpenses.rules.conditionAutomatic') },
      { value: 'custom', label: t('fixedExpenses.rules.conditionCustom') },
    ],
    [t],
  );

  const [formData, setFormData] = useState({
    name: '',
    conditionType: 'always' as ConditionType,
    conditionIncomeMin: '',
    conditionDay: '',
    conditionCustom: '',
    amountType: 'fixed',
    amount: '',
    category: '',
    paymentMethod: '',
  });

  useEffect(() => {
    if (open) {
      if (editingRule) {
        const isPercentage =
          editingRule.amountType === 'percentage' ||
          editingRule.amount.includes('%');
        const raw = (editingRule.category ?? '').trim();
        const categoryValue = (
          FIXED_EXPENSE_CATEGORIES as readonly string[]
        ).includes(raw)
          ? raw
          : categoryOptions[0]?.value ?? '';
        const parsed = parseCondition(editingRule.condition ?? '', t);
        setFormData({
          name: editingRule.name,
          conditionType: parsed.type,
          conditionIncomeMin: parsed.incomeMin,
          conditionDay: parsed.day,
          conditionCustom: parsed.custom,
          amountType: isPercentage ? 'percentage' : 'fixed',
          amount: stripCurrencyFromAmount(editingRule.amount),
          category: categoryValue,
          paymentMethod: editingRule.paymentMethod ?? '',
        });
      } else {
        setFormData({
          name: '',
          conditionType: 'always',
          conditionIncomeMin: '',
          conditionDay: '',
          conditionCustom: '',
          amountType: 'fixed',
          amount: '',
          category: categoryOptions[0]?.value ?? '',
          paymentMethod: '',
        });
      }
    }
  }, [open, editingRule, t, categoryOptions]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const condition = buildConditionString(
      formData.conditionType,
      formData.conditionIncomeMin,
      formData.conditionDay,
      formData.conditionCustom,
      formatCurrency,
      t,
    );

    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      condition,
      amountType: formData.amountType,
      amount: formData.amount.trim(),
      category: (formData.category || categoryOptions[0]?.value).trim(),
    };
    if (formData.paymentMethod) {
      payload.paymentMethod = formData.paymentMethod;
    }
    onSave(payload, !!editingRule, editingRule?.id);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-background w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            {editingRule
              ? t('fixedExpenses.rules.editRule')
              : t('fixedExpenses.rules.newRule')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
            type="button"
            aria-label={t('common.close')}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Input
              label={t('fixedExpenses.rules.ruleName')}
              placeholder={t('fixedExpenses.rules.ruleNamePlaceholder')}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              {t('fixedExpenses.rules.condition')}
            </label>
            <Select
              options={conditionTypeOptions}
              value={formData.conditionType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  conditionType: e.target.value as ConditionType,
                })
              }
            />
            {formData.conditionType === 'income_above' && (
              <div className="mt-3 relative">
                {currencyInputConfig.prefix ? (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencyInputConfig.prefix}
                  </span>
                ) : null}
                {currencyInputConfig.suffix ? (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencyInputConfig.suffix}
                  </span>
                ) : null}
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0"
                  value={formData.conditionIncomeMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conditionIncomeMin: e.target.value,
                    })
                  }
                  className={`w-full mt-2 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${currencyInputConfig.inputPlClass} ${currencyInputConfig.inputPrClass}`}
                />
              </div>
            )}
            {formData.conditionType === 'day_of_month' && (
              <div className="mt-3">
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder={t('fixedExpenses.rules.conditionDayPlaceholder')}
                  value={formData.conditionDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conditionDay: e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 2),
                    })
                  }
                  className="w-full mt-2 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            {formData.conditionType === 'custom' && (
              <input
                type="text"
                placeholder={t(
                  'fixedExpenses.rules.conditionCustomPlaceholder',
                  { value: formatCurrency(5000) },
                )}
                value={formData.conditionCustom}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conditionCustom: e.target.value,
                  })
                }
                className="w-full mt-3 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              {t('fixedExpenses.rules.amountType')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, amountType: 'fixed' })
                }
                className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ease-out ${
                  formData.amountType === 'fixed'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border hover:bg-accent/80 text-muted-foreground'
                }`}
              >
                {t('fixedExpenses.rules.fixedAmount')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, amountType: 'percentage' })
                }
                className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ease-out ${
                  formData.amountType === 'percentage'
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border hover:bg-accent/80 text-muted-foreground'
                }`}
              >
                {t('fixedExpenses.rules.percentageAmount')}
              </button>
            </div>

            <div className="relative mt-3">
              {formData.amountType === 'fixed' ? (
                <>
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
                </>
              ) : (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                  %
                </span>
              )}
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={`w-full py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  formData.amountType === 'fixed'
                    ? `${currencyInputConfig.inputPlClass} ${currencyInputConfig.inputPrClass}`
                    : 'pl-10 pr-4'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <Select
              label={t('fixedExpenses.rules.category')}
              options={categoryOptions}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Select
              label={t('fixedExpenses.rules.paymentMethod')}
              options={[
                {
                  value: '',
                  label: t('transactions.paymentMethodPlaceholder'),
                },
                ...PAYMENT_METHOD_KEYS.map((key) => ({
                  value: key,
                  label: t(`transactions.paymentMethods.${key}`),
                })),
              ]}
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button type="submit" fullWidth size="lg">
              {editingRule
                ? t('fixedExpenses.rules.saveChanges')
                : t('fixedExpenses.rules.addRule')}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
