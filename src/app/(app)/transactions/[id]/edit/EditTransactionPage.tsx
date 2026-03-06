'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input, TextArea, Select } from '@/components/Input';
import { ArrowLeft } from 'lucide-react';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';

const incomeCategories = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other Income' },
];

const expenseCategories = [
  { value: 'cartão_de_crédito', label: 'Cartão de Crédito' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'informática', label: 'Informática' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'saúde', label: 'Saúde' },
  { value: 'educação', label: 'Educação' },
  { value: 'entretenimento', label: 'Entretenimento' },
  { value: 'outros', label: 'Outros' },
];

interface EditTransactionPageProps {
  id: string;
}

export function EditTransactionPage({ id }: EditTransactionPageProps) {
  const router = useRouter();
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

  const categories =
    transactionType === 'income' ? incomeCategories : expenseCategories;

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-muted-foreground">Transação não encontrada.</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!confirm('Excluir esta transação?')) return;
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
          <h1>Editar Transação</h1>
          <div className="w-10" />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTransactionType('expense')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              transactionType === 'expense'
                ? 'bg-danger text-danger-foreground shadow-md'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('income')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              transactionType === 'income'
                ? 'bg-success text-success-foreground shadow-md'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            Receita
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-5">
        <Input
          label="Nome da Transação"
          placeholder="e.g., Compras de Supermercado"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />

        <div>
          <label className="text-sm text-foreground mb-2 block">Valor</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
              R$
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
          label="Categoria"
          options={categories}
          value={formData.category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />

        <Input
          type="date"
          label="Data"
          value={formData.date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, date: e.target.value })
          }
          required
        />

        <TextArea
          label="Observações (Opcional)"
          placeholder="Adicione qualquer detalhe adicional..."
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, notes: e.target.value })
          }
        />

        <div className="pt-4 space-y-3">
          <Button type="submit" fullWidth size="lg">
            Salvar alterações
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={handleDelete}
            disabled={deleting}
            className="text-danger hover:bg-danger/10"
          >
            Excluir transação
          </Button>
        </div>
      </form>
    </div>
  );
}
