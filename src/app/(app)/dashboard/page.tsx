'use client';

import { useMemo } from 'react';
import Image from 'next/image';
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
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { FinanceSummaryCard } from '@/components/FinanceSummaryCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { PeriodSelector } from '@/components/PeriodSelector';
import { TransactionCard } from '@/components/TransactionCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTransactionsWithRules } from '@/features/transactions/hooks/useTransactionsWithRules';
import { formatBRL } from '@/lib/format';
import { LogOut, TrendingDown, TrendingUp } from 'lucide-react';

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
      const cat = t.category || 'Outros';
      byCategory[cat] = (byCategory[cat] ?? 0) + Number(t.amount ?? 0);
    }
    const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    return entries.map(([name], i) => ({
      name,
      value: entries[i][1],
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [allExpenses]);

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
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image
              src={user?.photoURL || '/avatar.png'}
              alt={user?.displayName || 'User'}
              width={44}
              height={44}
              className="rounded-full border"
            />

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Bem-vindo</span>

              <h2 className="font-semibold text-lg leading-none">
                {user?.displayName}
              </h2>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={24} />
          </Button>
        </div>
        <div className="mb-4">
          <PeriodSelector />
        </div>
        <div className="mb-6">
          <p className="text-muted-foreground mb-1">Saldo total</p>
          <h1 className="text-4xl">
            R$ {formatBRL(totalIncome - totalExpenses)}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="px-6 space-y-6">
        <Card>
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
                  tickFormatter={(value) => `R$ ${formatBRL(value)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                  }}
                  formatter={(value, name) => [
                    `R$ ${formatBRL(Number(value))}`,
                    name === 'receitas' ? 'Receitas' : 'Despesas',
                  ]}
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

        <Card>
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
                      R$ {formatBRL(category.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Transações recentes</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/transactions')}
            >
              Ver todas
            </Button>
          </div>
          <div className="space-y-3">
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
        </div>
      </div>

      <FloatingActionButton onClick={() => router.push('/transactions/new')} />
      <BottomNav />
    </div>
  );
}

export default DashboardPage;
