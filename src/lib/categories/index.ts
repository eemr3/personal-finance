/**
 * Categorias e labels para transações e regras de despesa fixa.
 */

import type { CategoryType } from '@/types/categories';
import {
  EXPENSE_CATEGORY_KEYS,
  FIXED_EXPENSE_CATEGORY_KEYS,
  INCOME_CATEGORY_KEYS,
} from '@/types/categories';

export const EXPENSE_CATEGORIES = EXPENSE_CATEGORY_KEYS;
export const INCOME_CATEGORIES = INCOME_CATEGORY_KEYS;
export const FIXED_EXPENSE_CATEGORIES = FIXED_EXPENSE_CATEGORY_KEYS;

const I18N_KEYS: Record<CategoryType, string> = {
  income: 'transactions.categoriesIncome',
  expense: 'transactions.categoriesExpense',
  fixed: 'transactions.categoriesFixedExpense',
};

export function getCategoryLabel(
  category: string,
  type: CategoryType,
  t: (key: string) => string,
): string {
  const prefix = I18N_KEYS[type];
  if (!prefix || !category?.trim()) return category?.trim() || '';
  const normalized = category.trim().toLowerCase();
  const key = `${prefix}.${normalized}`;
  const label = t(key);
  return label === key ? category.trim() : label;
}
