'use client';
import React, { type FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { RuleCard } from '@/components/RuleCard';
import { Input, Select } from '@/components/Input';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useFixedExpenseRules } from '@/features/rules/hooks/useFixedExpenseRules';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { stripCurrencyFromAmount } from '@/lib/format';
import { FIXED_EXPENSE_CATEGORIES } from '@/lib/categories';
import { BottomNav } from '../../../../components/BottomNav';
import { useTranslation } from 'react-i18next';

type ConditionType =
  | 'always'
  | 'income_above'
  | 'day_of_month'
  | 'automatic'
  | 'custom';

/** Interpreta valor numérico da condição: aceita "3776.05", "3776,05" ou "3.776,05". */
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

const SUPPORTED_LANGS = ['pt', 'en', 'es'] as const;

function getAlwaysStrings(i18n: {
  getResourceBundle: (lng: string, ns: string) => unknown;
}): string[] {
  const strings: string[] = [];
  for (const lng of SUPPORTED_LANGS) {
    const bundle = i18n.getResourceBundle(lng, 'translation') as
      | Record<string, unknown>
      | undefined;
    const always = (bundle?.fixedExpenses as Record<string, unknown>)
      ?.rules as Record<string, unknown>;
    const val = always?.conditionAlways;
    if (typeof val === 'string' && val.trim())
      strings.push(val.trim().toLowerCase());
  }
  return [...new Set(strings)];
}

function getIncomeKeywords(i18n: {
  getResourceBundle: (lng: string, ns: string) => unknown;
}): string[] {
  const keywords: string[] = [];
  for (const lng of SUPPORTED_LANGS) {
    const bundle = i18n.getResourceBundle(lng, 'translation') as
      | Record<string, unknown>
      | undefined;
    const val = (bundle?.fixedExpenses as Record<string, unknown>)
      ?.conditionIncomeAboveContains;
    if (typeof val === 'string' && val.trim())
      keywords.push(val.trim().toLowerCase());
  }
  return [...new Set(keywords)];
}

function getDayKeywords(i18n: {
  getResourceBundle: (lng: string, ns: string) => unknown;
}): string[] {
  const keywords: string[] = [];
  for (const lng of SUPPORTED_LANGS) {
    const bundle = i18n.getResourceBundle(lng, 'translation') as
      | Record<string, unknown>
      | undefined;
    const val = (bundle?.fixedExpenses as Record<string, unknown>)
      ?.conditionDayOfMonthContains;
    if (typeof val === 'string' && val.trim())
      keywords.push(val.trim().toLowerCase());
  }
  return [...new Set(keywords)];
}

/** Reconhece o tipo da condição em qualquer idioma (pt/en/es) para exibir traduzido no card. */
function parseConditionMultilingual(
  condition: string,
  i18n: { getResourceBundle: (lng: string, ns: string) => unknown },
): {
  type: ConditionType;
  incomeMin: string;
  day: string;
  custom: string;
} {
  const c = (condition || '').trim();
  const lower = c.toLowerCase();
  if (!c) return { type: 'always', incomeMin: '', day: '', custom: '' };

  const alwaysStrings = getAlwaysStrings(i18n);
  if (alwaysStrings.some((s) => lower === s || lower.includes(s))) {
    return { type: 'always', incomeMin: '', day: '', custom: '' };
  }

  const incomeKeywords = getIncomeKeywords(i18n);
  if (incomeKeywords.some((kw) => lower.includes(kw))) {
    const num = c
      .replace(/[^\d,.]/g, '')
      .replace(',', '.')
      .replace(/\.(?=.*\.)/g, '');
    if (num)
      return { type: 'income_above', incomeMin: num, day: '', custom: '' };
  }

  const dayKeywords = getDayKeywords(i18n);
  if (dayKeywords.some((kw) => lower.includes(kw))) {
    const dayMatch = c.match(/\b(\d{1,2})\b/);
    const d = dayMatch?.[1]?.trim() ?? '';
    if (d && Number(d) >= 1 && Number(d) <= 31)
      return { type: 'day_of_month', incomeMin: '', day: d, custom: '' };
  }

  return { type: 'custom', incomeMin: '', day: '', custom: c };
}

/** Retorna a condição no idioma atual para exibição no card. */
function getTranslatedCondition(
  condition: string,
  i18n: { getResourceBundle: (lng: string, ns: string) => unknown },
  t: (key: string, opts?: { [key: string]: string }) => string,
  formatCurrency: (value: number) => string,
): string {
  const parsed = parseConditionMultilingual(condition, i18n);
  return buildConditionString(
    parsed.type,
    parsed.incomeMin,
    parsed.day,
    parsed.custom,
    formatCurrency,
    t,
  );
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

interface Rule {
  id: string;
  name: string;
  condition: string;
  amount: string;
  amountType?: 'fixed' | 'percentage';
  category: string;
}

function FixedExpensesPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { currencyInputConfig, formatCurrency } = useFormatCurrency();
  const { rules, loading, fetchRules, addRule, updateRule, deleteRule } =
    useFixedExpenseRules();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    conditionType: 'always' as ConditionType,
    conditionIncomeMin: '',
    conditionDay: '',
    conditionCustom: '',
    amountType: 'fixed',
    amount: '',
    category: '',
  });

  const categoryOptions = FIXED_EXPENSE_CATEGORIES.map((key) => ({
    value: key,
    label: t(`transactions.categoriesFixedExpense.${key}`),
  }));

  const conditionTypeOptions = useMemo(
    () => [
      {
        value: 'always' as const,
        label: t('fixedExpenses.rules.conditionAlways'),
      },
      {
        value: 'income_above' as const,
        label: t('fixedExpenses.rules.conditionIncomeAbove'),
      },
      {
        value: 'day_of_month' as const,
        label: t('fixedExpenses.rules.conditionDayOfMonth'),
      },
      {
        value: 'automatic' as const,
        label: t('fixedExpenses.rules.conditionAutomatic'),
      },
      {
        value: 'custom' as const,
        label: t('fixedExpenses.rules.conditionCustom'),
      },
    ],
    [t],
  );

  const handleAddRule = () => {
    setEditingRule(null);

    setFormData({
      name: '',
      conditionType: 'always',
      conditionIncomeMin: '',
      conditionDay: '',
      conditionCustom: '',
      amountType: 'fixed',
      amount: '',
      category: categoryOptions[0].value,
    });
    setShowModal(true);
  };

  const handleEditRule = (rule: Rule & { amountType?: string }) => {
    setEditingRule(rule);
    const isPercentage =
      rule.amountType === 'percentage' || rule.amount.includes('%');
    const raw = (rule.category ?? '').trim();
    const categoryValue = (
      FIXED_EXPENSE_CATEGORIES as readonly string[]
    ).includes(raw)
      ? raw
      : categoryOptions[0].value;
    const parsed = parseCondition(rule.condition ?? '', t);
    setFormData({
      name: rule.name,
      conditionType: parsed.type,
      conditionIncomeMin: parsed.incomeMin,
      conditionDay: parsed.day,
      conditionCustom: parsed.custom,
      amountType: isPercentage ? 'percentage' : 'fixed',
      amount: stripCurrencyFromAmount(rule.amount),
      category: categoryValue,
    });
    setShowModal(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteRule(ruleId);
  };

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

    const payload = {
      name: formData.name.trim(),
      condition,
      amountType: formData.amountType,
      amount: formData.amount.trim(),
      category: (formData.category || categoryOptions[0].value).trim(),
    };
    if (editingRule) {
      updateRule(editingRule.id, payload);
    } else {
      addRule({
        ...payload,
        createdAt: new Date(),
      });
    }
    fetchRules();
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1>{t('fixedExpenses.rules.title')}</h1>
          </div>
        </div>
        <p className="text-muted-foreground ml-14">
          {t('fixedExpenses.rules.description')}
        </p>
      </div>

      <div className="px-6 pt-2 pb-24 bg-linear-to-b from-primary/5 via-background to-background min-h-[50vh]">
        {rules.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
              {`${t('fixedExpenses.rules.title')} (${rules.length})`}
            </h2>
            <div className="space-y-2">
              {rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  id={rule.id}
                  name={rule.name}
                  condition={getTranslatedCondition(
                    rule.condition ?? '',
                    i18n,
                    t,
                    formatCurrency,
                  )}
                  amount={rule.amount}
                  amountType={rule.amountType}
                  category={rule.category ?? ''}
                  formatCurrency={formatCurrency}
                  onEdit={() => handleEditRule(rule)}
                  onDelete={() => handleDeleteRule(rule.id)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-10">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
              {t('fixedExpenses.rules.title')}
            </h2>
            <div className="rounded-xl border border-border border-dashed bg-card/50 px-6 py-12 text-center">
              <p className="text-muted-foreground mb-5">
                {t('fixedExpenses.rules.noRulesConfigured')}
              </p>
              <Button onClick={handleAddRule}>
                {t('fixedExpenses.rules.createFirstRule')}
              </Button>
            </div>
          </section>
        )}

        {rules.length > 0 && (
          <div className="h-px bg-border/60 mb-6" aria-hidden />
        )}
        {rules.length > 0 && (
          <button
            type="button"
            onClick={handleAddRule}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-dashed border-border bg-card hover:bg-accent/80 hover:border-primary/30 transition-all duration-200 ease-out text-foreground"
          >
            <Plus size={20} />
            {t('fixedExpenses.rules.addRule')}
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-background w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {editingRule
                  ? t('fixedExpenses.rules.editRule')
                  : t('fixedExpenses.rules.newRule')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
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
                      placeholder={t(
                        'fixedExpenses.rules.conditionDayPlaceholder',
                      )}
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
                      {
                        value: formatCurrency(5000),
                      },
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

                <div className="relative">
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

              <div className="pt-2 space-y-3">
                <Button type="submit" fullWidth size="lg">
                  {editingRule
                    ? t('fixedExpenses.rules.saveChanges')
                    : t('fixedExpenses.rules.addRule')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

export default FixedExpensesPage;
