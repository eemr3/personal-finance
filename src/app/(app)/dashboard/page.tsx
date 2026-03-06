'use client';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FinanceSummaryCard } from '@/components/FinanceSummaryCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { TransactionCard } from '@/components/TransactionCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Coffee,
  Home,
  Car,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import Image from 'next/image';

function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <p>Usuário não autenticado</p>;
  }
  const monthlyData = [
    { month: 'Jan', amount: 4200 },
    { month: 'Feb', amount: 3800 },
    { month: 'Mar', amount: 4500 },
    { month: 'Apr', amount: 4100 },
    { month: 'May', amount: 4800 },
    { month: 'Jun', amount: 5200 },
  ];

  const categoryData = [
    { name: 'Housing', value: 1200, color: '#10b981' },
    { name: 'Food', value: 600, color: '#3b82f6' },
    { name: 'Transport', value: 400, color: '#f59e0b' },
    { name: 'Shopping', value: 350, color: '#ef4444' },
    { name: 'Other', value: 450, color: '#8b5cf6' },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'expense' as const,
      name: 'Grocery Shopping',
      amount: 125.5,
      category: 'Food',
      date: 'Today',
      icon: <ShoppingBag className="text-danger" size={24} />,
    },
    {
      id: '2',
      type: 'income' as const,
      name: 'Freelance Project',
      amount: 2500.0,
      category: 'Income',
      date: 'Yesterday',
      icon: <DollarSign className="text-success" size={24} />,
    },
    {
      id: '3',
      type: 'expense' as const,
      name: 'Coffee Shop',
      amount: 8.5,
      category: 'Food',
      date: 'Yesterday',
      icon: <Coffee className="text-danger" size={24} />,
    },
  ];

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
            Sair
          </Button>
        </div>
        <div className="mb-6">
          <p className="text-muted-foreground mb-1">Total Balance</p>
          <h1 className="text-4xl">$8,450.00</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FinanceSummaryCard
            title="Income"
            amount={12500}
            icon={<TrendingUp className="text-success" size={24} />}
            variant="income"
            subtitle="This month"
          />
          <FinanceSummaryCard
            title="Expenses"
            amount={4050}
            icon={<TrendingDown className="text-danger" size={24} />}
            variant="expense"
            subtitle="This month"
          />
        </div>
      </div>

      <div className="px-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
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
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                  }}
                  formatter={(value) => [`$${value}`, 'Spending']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
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
                      ${category.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Recent Transactions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/transactions')}
            >
              See all
            </Button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} {...transaction} />
            ))}
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={() => router.push('/transactions/new')} />
      <BottomNav />
    </div>
  );
}

export default DashboardPage;
