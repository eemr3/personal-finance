import type { FixedExpenseRule, Transaction } from '@/types/transactions';
import type { Period } from '@/lib/period';
import { getPeriodRange } from '@/lib/period';

/**
 * Calcula o valor de uma regra com base no total de receitas.
 * Usa amountType quando disponível; caso contrário, infere por amount (termina com % = percentual).
 */
function calculateRuleAmount(
  amountStr: string,
  totalIncome: number,
  amountType?: 'fixed' | 'percentage',
): number {
  const trimmed = amountStr.trim();
  const numericValue =
    parseFloat(trimmed.replace('%', '').replace(/[R$\s]/g, '').replace(',', '.')) || 0;

  const isPercentage =
    amountType === 'percentage' || trimmed.endsWith('%');

  if (isPercentage) {
    return (totalIncome * numericValue) / 100;
  }

  return numericValue;
}

/**
 * Gera "transações virtuais" a partir das regras e do total de receitas do período.
 * Usado para exibir na lista sem persistir.
 * @param period - Período selecionado; a data das transações virtuais será o 1º dia do período (formato YYYY-MM-DD)
 */
export function calculateExpensesFromRules(
  rules: FixedExpenseRule[],
  totalIncome: number,
  period?: Period | null,
): Omit<Transaction, 'id' | 'createdAt'>[] {
  const dateStr = period ? getPeriodRange(period).start : new Date().toISOString().split('T')[0];

  return rules.map((rule) => ({
    type: 'expense' as const,
    name: rule.name,
    amount: calculateRuleAmount(rule.amount, totalIncome, rule.amountType),
    category: rule.category ?? '',
    date: dateStr,
    source: 'rule' as const,
    ruleId: rule.id,
  }));
}
