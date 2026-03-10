'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Bell, Wallet } from 'lucide-react';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MonthlySummaryAccordion } from '@/components/MonthlySummaryAccordion';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionCard } from '@/components/TransactionCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTransactionsWithRules } from '@/features/transactions/hooks/useTransactionsWithRules';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { usePeriod } from '@/contexts/PeriodContext';
import { getCategoryLabel } from '@/lib/categories';

import type { AiMonthInsight } from '@/lib/ai/gemini';

const AI_INSIGHT_STORAGE_KEY = 'pf_ai_insight';

function getMonthKey(t: {
  date?: string;
  createdAt?: { toDate?: () => Date };
}): string {
  if (typeof t.date === 'string') {
    const ddmmyyyy = t.date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}`;
    const iso = t.date.match(/^(\d{4})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}`;
  }
  const ts = t.createdAt as { toDate?: () => Date } | undefined;
  if (ts?.toDate) {
    const d = ts.toDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return '';
}

function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { period, goToCurrentMonth, isCurrentMonth } = usePeriod();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );
  const [aiInsight, setAiInsight] = useState<AiMonthInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { formatCurrency, currency } = useFormatCurrency();
  const { user, loading } = useAuth();
  const {
    allTransactionsForDisplay,
    totalIncome,
    totalExpenses,
    loading: transactionsLoading,
    removeTransaction,
  } = useTransactionsWithRules();

  const cacheKey = `${AI_INSIGHT_STORAGE_KEY}_${period.year}_${period.month}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw || typeof raw !== 'string') {
        setAiInsight(null);
        return;
      }
      if (!raw.trim().startsWith('{')) {
        setAiInsight(null);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (
        parsed &&
        typeof parsed === 'object' &&
        'resumo' in parsed &&
        typeof (parsed as AiMonthInsight).resumo === 'string'
      ) {
        setAiInsight(parsed as AiMonthInsight);
      } else {
        setAiInsight(null);
      }
    } catch {
      setAiInsight(null);
    }
  }, [cacheKey]);

  const balance = totalIncome - totalExpenses;
  const currencyCode = (currency as string).toUpperCase();

  const topCategories = useMemo(() => {
    if (!totalExpenses) return [];
    const totals: Record<
      string,
      { key: string; label: string; amount: number }
    > = {};

    for (const tx of allTransactionsForDisplay) {
      const amt = Number((tx as { amount?: number }).amount ?? 0);
      if (!amt) continue;

      const type = String((tx as { type?: string }).type ?? '')
        .toLocaleLowerCase()
        .trim();

      if (type !== 'expense' && type !== '') continue;

      const cat = (tx as { category?: string }).category;
      if (!cat) continue;

      if (!totals[cat]) {
        totals[cat] = {
          key: cat,
          label: getCategoryLabel(cat, 'expense', t),
          amount: 0,
        };
      }
      totals[cat].amount += amt;
    }

    const entries = Object.values(totals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    if (entries.length === 0) return [];

    return entries.map((e) => ({
      key: e.key,
      label: e.label,
      amount: e.amount,
      percent: (e.amount / totalExpenses) * 100,
    }));
  }, [allTransactionsForDisplay, totalExpenses, t]);

  const chartData = useMemo(() => {
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const byDay: Record<string, number> = {};
    let running = 0;
    const sorted = [...allTransactionsForDisplay].sort(
      (a, b) =>
        new Date(
          (a.date as string)?.includes?.('/')
            ? (a.date as string).split('/').reverse().join('-')
            : (a.date as string) ?? 0,
        ).getTime() -
        new Date(
          (b.date as string)?.includes?.('/')
            ? (b.date as string).split('/').reverse().join('-')
            : (b.date as string) ?? 0,
        ).getTime(),
    );
    for (const tx of sorted) {
      const amt = Number((tx as { amount?: number }).amount ?? 0);
      const type = String((tx as { type?: string }).type ?? '').toLowerCase();
      running = round2(running + (type === 'income' ? amt : -amt));
      const d = (tx as { date?: string }).date;
      if (d) {
        const key =
          typeof d === 'string' && d.includes('/')
            ? d.split('/').reverse().join('-')
            : d;
        byDay[key] = running;
      }
    }
    const keys = Object.keys(byDay).sort().slice(-7);
    if (keys.length === 0) {
      return [
        { date: '1', balance: round2(balance * 0.4) },
        { date: '2', balance: round2(balance * 0.6) },
        { date: '3', balance: round2(balance * 0.5) },
        { date: '4', balance: round2(balance * 0.8) },
        { date: '5', balance: round2(balance * 0.7) },
        { date: '6', balance: round2(balance * 0.9) },
        { date: '7', balance: round2(balance) },
      ];
    }
    return keys.map((k) => ({
      date: k.slice(-2),
      balance: round2(byDay[k] ?? balance),
    }));
  }, [allTransactionsForDisplay, balance]);

  const recentTransactions = useMemo(
    () =>
      [...allTransactionsForDisplay]
        .sort((a, b) => {
          const da = (a as { date?: string }).date ?? '';
          const db = (b as { date?: string }).date ?? '';
          const parse = (d: string) => {
            if (d.includes('/')) {
              const [dd, mm, yyyy] = d.split('/');
              return new Date(
                Number(yyyy),
                Number(mm) - 1,
                Number(dd),
              ).getTime();
            }
            return new Date(d).getTime();
          };
          return parse(db) - parse(da);
        })
        .slice(0, 5),
    [allTransactionsForDisplay],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Usuário não autenticado</p>
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  const handleGenerateAiInsight = async (forceRefresh = false) => {
    if (aiLoading) return;
    setAiError(null);
    setAiLoading(true);
    if (forceRefresh) setAiInsight(null);

    try {
      const lang =
        (t as { i18n?: { language?: string } }).i18n?.language ?? 'pt';
      const locale = lang.startsWith('en')
        ? 'en'
        : lang.startsWith('es')
        ? 'es'
        : 'pt';

      const monthLabel = new Date(
        period.year,
        period.month - 1,
        1,
      ).toLocaleDateString(
        locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR',
        { month: 'long', year: 'numeric' },
      );

      const round2 = (n: number) => Math.round(n * 100) / 100;
      const payload = {
        monthLabel,
        currency: currencyCode,
        totalIncome: round2(totalIncome),
        totalExpenses: round2(totalExpenses),
        balance: round2(balance),
        topCategories: topCategories.map((c) => ({
          ...c,
          amount: round2(c.amount),
          percent: round2(c.percent),
        })),
        locale,
      };

      const response = await fetch('/api/ai/month-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.text();
        let errMsg = 'Erro ao gerar análise';
        try {
          const errJson = JSON.parse(errBody) as { error?: string };
          if (errJson?.error) errMsg = errJson.error;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      const data = (await response.json()) as { insight?: AiMonthInsight };
      const insight = data.insight;
      if (!insight || typeof insight.resumo !== 'string') {
        throw new Error('Resposta inválida da API');
      }
      setAiInsight(insight);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(insight));
      } catch {
        // ignore storage errors
      }
    } catch (error) {
      console.error(error);
      setAiError(
        error instanceof Error ? error.message : t('dashboard.aiError'),
      );
    } finally {
      setAiLoading(false);
    }
  };

  const monthName = useMemo(() => {
    const lang =
      (t as { i18n?: { language?: string } }).i18n?.language ?? 'pt';
    const localeStr = lang.startsWith('en')
      ? 'en-US'
      : lang.startsWith('es')
        ? 'es-ES'
        : 'pt-BR';
    return new Date(period.year, period.month - 1, 1).toLocaleDateString(
      localeStr,
      { month: 'long' },
    );
  }, [period.year, period.month, t]);

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-tr from-primary/80 to-primary/20 p-[2px]">
            <div className="w-full h-full rounded-full bg-card overflow-hidden">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary-foreground font-semibold">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t('dashboard.goodMorning')},
            </p>
            <h1 className="text-lg font-bold text-foreground">{displayName}</h1>
          </div>
        </div>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative hover:bg-secondary/80 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </header>

      {/* Month selector: one line, doesn't compete with balance card */}
      <section className="flex items-center justify-between gap-2">
        <MonthSelector />
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={goToCurrentMonth}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t('dashboard.goToCurrentMonth')}
          </button>
        )}
      </section>

      {/* Balance Card */}
      <section className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-[3rem]" />
        <div className="relative p-8 rounded-[2rem] bg-linear-to-br from-card to-card/50 border border-white/10 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />

          <div className="relative z-10 flex items-center justify-between mb-8">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" /> {t('dashboard.totalBalance')}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {currencyCode}
            </span>
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl font-extrabold text-foreground tracking-tight mb-2">
              {transactionsLoading ? '...' : formatCurrency(balance)}
            </h2>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.income')}
                </p>
                <p className="font-semibold text-sm">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.expense')}
                </p>
                <p className="font-semibold text-sm">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => router.push('/transactions/new?type=income')}
          className="p-4 rounded-2xl bg-secondary border border-white/5 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-6 h-6 text-primary" />
          </div>
          <span className="font-medium text-sm">{t('dashboard.receive')}</span>
        </button>
        <button
          type="button"
          onClick={() => router.push('/transactions/new?type=expense')}
          className="p-4 rounded-2xl bg-secondary border border-white/5 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownRight className="w-6 h-6 text-destructive" />
          </div>
          <span className="font-medium text-sm">{t('dashboard.send')}</span>
        </button>
      </section>

      {/* Chart */}
      <section className="h-40 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="colorBalanceDashboard"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.3}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: 'none',
                borderRadius: '12px',
              }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value) => formatCurrency(Number(value ?? 0))}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBalanceDashboard)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
      {/* AI Monthly Insight */}
      <section className="space-y-3" aria-live="polite">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleGenerateAiInsight(!!aiInsight)}
            disabled={aiLoading || transactionsLoading}
            className="flex-1 rounded-2xl border border-primary/40 bg-primary/10 text-primary px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            {aiLoading
              ? t('dashboard.aiGenerating')
              : aiInsight
              ? t('dashboard.aiGenerateAgain')
              : t('dashboard.aiGenerate')}
          </button>
        </div>
        {aiError && <p className="text-xs text-destructive">{aiError}</p>}
        {aiLoading && (
          <div className="p-4 rounded-2xl bg-card border border-white/10 space-y-3 animate-pulse">
            <div className="h-4 w-2/3 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-1/2 rounded bg-white/10" />
          </div>
        )}
        {!aiLoading && (
          <MonthlySummaryAccordion
            monthName={monthName}
            currentYear={period.year}
            monthlyIncome={totalIncome}
            monthlyExpense={totalExpenses}
            monthlyBalance={balance}
            currency={currency}
            resumo={aiInsight?.resumo}
            maiorGasto={aiInsight?.maiorGasto}
            dica={aiInsight?.dica}
            labelMonthSummary={t('dashboard.aiMonthSummary')}
            labelBiggestExpense={t('dashboard.aiBiggestExpense')}
            labelTip={t('dashboard.aiTip')}
            defaultOpen={!!aiInsight}
          />
        )}
      </section>
      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{t('dashboard.recent')}</h3>
          <button
            type="button"
            onClick={() => router.push('/transactions')}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('dashboard.viewAll')}
          </button>
        </div>

        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                id={tx.id}
                type={(tx.type as 'income' | 'expense') ?? 'expense'}
                name={tx.name ?? ''}
                amount={Number((tx as { amount?: number }).amount ?? 0)}
                category={tx.category}
                paymentMethod={tx.paymentMethod}
                date={tx.date as string}
                source={'source' in tx ? tx.source : undefined}
                onEdit={
                  tx.source !== 'rule'
                    ? () => router.push(`/transactions/edit?id=${tx.id}`)
                    : undefined
                }
                onDelete={
                  tx.source !== 'rule' && tx.id
                    ? () => {
                        setTransactionToDelete(tx.id);
                        setDeleteConfirmOpen(true);
                      }
                    : undefined
                }
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
              {t('dashboard.noRecentTransactions')}
            </div>
          )}
        </div>
      </section>

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

export default DashboardPage;
