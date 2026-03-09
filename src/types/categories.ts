/**
 * Tipos de categoria por contexto (receita, despesa, despesa fixa).
 * As chaves devem corresponder às chaves em messages.*.json:
 * - transactions.categoriesIncome
 * - transactions.categoriesExpense
 * - transactions.categoriesFixedExpense
 */

export type CategoryType = 'income' | 'expense' | 'fixed';

/** Chaves de categorias de receita (transactions.categoriesIncome) */
export const INCOME_CATEGORY_KEYS = [
  'salary',
  'freelance',
  'investment',
  'business',
  'other',
] as const;
export type IncomeCategoryKey = (typeof INCOME_CATEGORY_KEYS)[number];

/** Chaves de categorias de despesa (transactions.categoriesExpense) */
export const EXPENSE_CATEGORY_KEYS = [
  'credit_card',
  'supermarket',
  'food',
  'computer',
  'transport',
  'health',
  'education',
  'entertainment',
  'home_cleaning',
  'other',
] as const;
export type ExpenseCategoryKey = (typeof EXPENSE_CATEGORY_KEYS)[number];

/** Chaves de categorias de despesa fixa (transactions.categoriesFixedExpense) */
export const FIXED_EXPENSE_CATEGORY_KEYS = [
  'education',
  'religious',
  'taxes',
  'subscriptions',
  'utilities',
  'insurance',
  'debt',
  'savings',
  'other',
] as const;
export type FixedExpenseCategoryKey =
  (typeof FIXED_EXPENSE_CATEGORY_KEYS)[number];

/** Todas as chaves de categoria, por tipo */
export type CategoryKey =
  | IncomeCategoryKey
  | ExpenseCategoryKey
  | FixedExpenseCategoryKey;

/** Opção para selects (value = chave, label = traduzido na UI) */
export interface CategoryOption {
  value: string;
  label: string;
}
