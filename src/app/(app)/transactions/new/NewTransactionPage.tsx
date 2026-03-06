'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input, TextArea, Select } from '@/components/Input';
import { ArrowLeft } from 'lucide-react';

export function NewTransactionPage() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'expense',
  );
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const incomeCategories = [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investment' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other Income' },
  ];

  const expenseCategories = [
    { value: 'housing', label: 'Housing' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Healthcare' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'subscription', label: 'Subscriptions' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other Expenses' },
  ];

  const categories =
    transactionType === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving transaction:', { type: transactionType, ...formData });
    // In real app, would save to database
    router.push('/transactions');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1>New Transaction</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setTransactionType('expense')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              transactionType === 'expense'
                ? 'bg-danger text-danger-foreground shadow-md'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setTransactionType('income')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              transactionType === 'income'
                ? 'bg-success text-success-foreground shadow-md'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-5">
        <Input
          label="Transaction Name"
          placeholder="e.g., Grocery Shopping"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />

        <div>
          <label className="text-sm text-foreground mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
              $
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-2xl"
              required
            />
          </div>
        </div>

        <Select
          label="Category"
          options={categories}
          value={formData.category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />

        <Input
          type="date"
          label="Date"
          value={formData.date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, date: e.target.value })
          }
          required
        />

        <TextArea
          label="Notes (Optional)"
          placeholder="Add any additional details..."
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, notes: e.target.value })
          }
        />

        <div className="pt-4 space-y-3">
          <Button type="submit" fullWidth size="lg">
            Save Transaction
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
