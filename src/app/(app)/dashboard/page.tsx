'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { FinanceSummaryCard } from '@/components/FinanceSummaryCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { PeriodSelector } from '@/components/PeriodSelector';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionCard } from '@/components/TransactionCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTransactionsWithRules } from '@/features/transactions/hooks/useTransactionsWithRules';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { getCategoryLabel, FIXED_EXPENSE_CATEGORIES } from '@/lib/categories';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORY_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Out',
  '11': 'Nov',
  '12': 'Dez',
};

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
  const { formatCurrency } = useFormatCurrency();
  const {
    allTransactionsForDisplay,
    allExpenses,
    totalIncome,
    totalExpenses,
    loading: transactionsLoading,
  } = useTransactionsWithRules();
  const { user, loading, logout } = useAuth();

  const monthlyData = useMemo(() => {
    const byMonth: Record<string, { receitas: number; despesas: number }> = {};
    for (const t of allExpenses) {
      const key = getMonthKey(t);
      if (key) {
        if (!byMonth[key]) byMonth[key] = { receitas: 0, despesas: 0 };
        byMonth[key].despesas += Number(t.amount ?? 0);
      }
    }
    for (const t of allTransactionsForDisplay.filter(
      (x) => String(x.type ?? '').toLowerCase() === 'income',
    )) {
      const key = getMonthKey(
        t as { date?: string; createdAt?: { toDate?: () => Date } },
      );
      if (key) {
        if (!byMonth[key]) byMonth[key] = { receitas: 0, despesas: 0 };
        byMonth[key].receitas += Number((t as { amount?: number }).amount ?? 0);
      }
    }
    const keys = Object.keys(byMonth).sort().slice(-6);
    return keys.map((key) => {
      const [, mm] = key.split('-');
      const data = byMonth[key];
      return {
        month: MONTH_LABELS[mm] ?? mm,
        receitas: data.receitas,
        despesas: data.despesas,
      };
    });
  }, [allExpenses, allTransactionsForDisplay]);

  const categoryData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    for (const t of allExpenses) {
      const cat = t.category || 'other';
      byCategory[cat] = (byCategory[cat] ?? 0) + Number(t.amount ?? 0);
    }
    const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const fixedKeys = FIXED_EXPENSE_CATEGORIES as readonly string[];
    return entries.map(([key], i) => {
      const categoryType = fixedKeys.includes(key) ? 'fixed' : 'expense';
      return {
        name: getCategoryLabel(key, categoryType, t),
        value: entries[i][1],
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      };
    });
  }, [allExpenses, t]);

  const recentTransactions = useMemo(
    () => allTransactionsForDisplay.slice(0, 5),
    [allTransactionsForDisplay],
  );

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <p>Usuário não autenticado</p>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pb-4">
        <AppHeader
          title={<>{t('dashboard.title')}</>}
          subtitle={t('dashboard.subtitle')}
        />
      </div>

      <div className="px-6 pt-2 pb-6 bg-linear-to-b from-primary/5 via-background to-background">
        <div className="hidden md:block mb-4">
          <PeriodSelector />
        </div>

        <div className="flex gap-3 mb-6 relative z-10">
          <div className="md:hidden flex items-center min-h-[44px]">
            <MonthSelector />
          </div>
          <div className="hidden md:flex flex-1 gap-2">
            <Button
              className="flex-1 py-4 bg-success text-success-foreground border border-success transition-all duration-200"
              onClick={() => router.push('/transactions/new?type=income')}
            >
              <Plus size={20} className="mr-2" />
              Adicionar receita
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-4 border-2 transition-all duration-200 hover:bg-accent/80"
              onClick={() => router.push('/transactions/new?type=expense')}
            >
              <Plus size={20} className="mr-2" />
              Adicionar despesa
            </Button>
          </div>
        </div>

        <section className="mb-6 relative z-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Saldo total
          </h2>
          <p className="text-4xl font-semibold break-keep tabular-nums">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            Este mês
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <FinanceSummaryCard
              title="Receitas"
              amount={totalIncome}
              icon={<TrendingUp className="text-success" size={24} />}
              variant="income"
              subtitle="Este mês"
            />
            <FinanceSummaryCard
              title="Despesas"
              amount={totalExpenses}
              icon={<TrendingDown className="text-danger" size={24} />}
              variant="expense"
              subtitle="Este mês"
            />
          </div>
        </section>
      </div>

      <div className="px-6 pt-2 pb-24 space-y-6">
        <Card className="border border-border rounded-xl transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Receitas e despesas mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barCategoryGap="20%" barGap={8}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    maxWidth: '200px',
                  }}
                  wrapperStyle={{ outline: 'none' }}
                  cursor={{ fill: 'var(--muted)', fillOpacity: 0.15 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length || !label) return null;
                    return (
                      <div className="shadow-md rounded-lg border border-border bg-card p-2.5">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          {label}
                        </p>
                        {payload.map((entry) => (
                          <p
                            key={entry.dataKey}
                            className="text-sm font-medium tabular-nums"
                            style={{ color: entry.color }}
                          >
                            {entry.name}:{' '}
                            {formatCurrency(Number(entry.value ?? 0))}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="receitas"
                  name="Receitas"
                  fill="#22c55e"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="despesas"
                  name="Despesas"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-xl transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="40%" height={150}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transações recentes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="transition-colors duration-200"
              onClick={() => router.push('/transactions')}
            >
              Ver todas
            </Button>
          </div>
          <div className="space-y-2">
            {recentTransactions.length === 0 && !transactionsLoading ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma transação recente.
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  {...transaction}
                  source={
                    'source' in transaction ? transaction.source : undefined
                  }
                />
              ))
            )}
          </div>
        </section>
      </div>

      <FloatingActionButton onClick={() => router.push('/transactions/new')} />
      <BottomNav />
    </div>
  );
}

export default DashboardPage;
