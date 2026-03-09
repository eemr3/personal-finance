export type TransactionType = 'income' | 'expense';

/** Formas de pagamento para despesas */
export type PaymentMethod =
  | 'credit_personal'
  | 'credit_business'
  | 'debit'
  | 'pix'
  | 'cash';

/** Re-export para uso em componentes que exibem transação ou despesa fixa */
export type { CategoryType } from './categories';

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: PaymentMethod;
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
  paymentMethod?: PaymentMethod;
}
