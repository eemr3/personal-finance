'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { TransactionCard } from '@/components/TransactionCard';
import { Input } from '@/components/Input';

import {
  Search,
  Filter,
  ShoppingBag,
  Coffee,
  Home,
  Car,
  DollarSign,
  Briefcase,
} from 'lucide-react';

function TransactionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all',
  );

  const allTransactions = [
    {
      id: '1',
      type: 'income' as const,
      name: 'Freelance Project',
      amount: 2500.0,
      category: 'Income',
      date: 'Mar 6, 2026',
      icon: <Briefcase className="text-success" size={24} />,
    },
    {
      id: '2',
      type: 'expense' as const,
      name: 'Grocery Shopping',
      amount: 125.5,
      category: 'Food',
      date: 'Mar 6, 2026',
      icon: <ShoppingBag className="text-danger" size={24} />,
    },
    {
      id: '3',
      type: 'expense' as const,
      name: 'Coffee Shop',
      amount: 8.5,
      category: 'Food',
      date: 'Mar 5, 2026',
      icon: <Coffee className="text-danger" size={24} />,
    },
    {
      id: '4',
      type: 'expense' as const,
      name: 'Rent Payment',
      amount: 1200.0,
      category: 'Housing',
      date: 'Mar 1, 2026',
      icon: <Home className="text-danger" size={24} />,
    },
    {
      id: '5',
      type: 'income' as const,
      name: 'Salary',
      amount: 5000.0,
      category: 'Income',
      date: 'Mar 1, 2026',
      icon: <DollarSign className="text-success" size={24} />,
    },
    {
      id: '6',
      type: 'expense' as const,
      name: 'Gas Station',
      amount: 45.0,
      category: 'Transport',
      date: 'Feb 28, 2026',
      icon: <Car className="text-danger" size={24} />,
    },
    {
      id: '7',
      type: 'expense' as const,
      name: 'Restaurant',
      amount: 65.0,
      category: 'Food',
      date: 'Feb 27, 2026',
      icon: <Coffee className="text-danger" size={24} />,
    },
    {
      id: '8',
      type: 'income' as const,
      name: 'Consulting',
      amount: 1500.0,
      category: 'Income',
      date: 'Feb 25, 2026',
      icon: <Briefcase className="text-success" size={24} />,
    },
  ];

  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
        <h1 className="mb-6">Transactions</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-xl text-success">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-xl text-danger">${totalExpenses.toFixed(2)}</p>
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
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'income'
                ? 'bg-success text-success-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'expense'
                ? 'bg-danger text-danger-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            Expenses
          </button>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              {...transaction}
              onClick={() => console.log('View transaction', transaction.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => router.push('/transactions/new')} />
      <BottomNav />
    </div>
  );
}

export default TransactionsPage;
