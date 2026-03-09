export type TransactionType = 'income' | 'expense';

/** Re-export para uso em componentes que exibem transação ou despesa fixa */
export type { CategoryType } from './categories';

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  category: string;
  date: string;
  source?: 'manual' | 'rule';
  ruleId?: string;
  createdAt?: unknown;
}

export interface FixedExpenseRule {
  id: string;
  name: string;
  condition: string;
  amount: string;
  category: string;
  amountType?: 'fixed' | 'percentage';
}
