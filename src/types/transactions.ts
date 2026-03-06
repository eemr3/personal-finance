export type TransactionType = 'income' | 'expense';

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
