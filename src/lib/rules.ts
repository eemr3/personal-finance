import type { FixedExpenseRule, Transaction } from '@/types/transactions';
import type { Period } from '@/lib/period';
import { getPeriodRange } from '@/lib/period';
import { stripCurrencyFromAmount } from '@/lib/format';

/**
 * Extrai o valor mínimo de receita da condição (ex.: "Se receita > R$ 3.776,05" -> 3776.05).
 * Retorna null se a regra for "sempre aplicar" ou não tiver condição de receita.
 */
export function parseConditionMinIncome(condition: string): number | null {
  const c = (condition || '').trim().toLowerCase();
  if (!c || c.includes('sempre aplicar')) return null;
  if (!c.includes('receita') && !c.includes('income')) return null;

  const raw = c.replace(/[^\d,.]/g, '');
  if (!raw) return null;

  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? null : value;
}

/**
 * Verifica se a regra deve ser aplicada dado o total de receitas do período.
 */
function shouldApplyRule(rule: FixedExpenseRule, totalIncome: number): boolean {
  const minIncome = parseConditionMinIncome(rule.condition ?? '');
  if (minIncome == null) return true;
  return totalIncome >= minIncome;
}

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
    parseFloat(stripCurrencyFromAmount(trimmed)) || 0;

  const isPercentage =
    amountType === 'percentage' || trimmed.endsWith('%');

  if (isPercentage) {
    return (totalIncome * numericValue) / 100;
  }

  return numericValue;
}

/**
 * Gera "transações virtuais" a partir das regras e do total de receitas do período.
 * Só inclui regras cuja condição for satisfeita (ex.: "receita > X" só aplica se totalIncome >= X).
 * @param period - Período selecionado; a data das transações virtuais será o 1º dia do período (formato YYYY-MM-DD)
 */
export function calculateExpensesFromRules(
  rules: FixedExpenseRule[],
  totalIncome: number,
  period?: Period | null,
): Omit<Transaction, 'id' | 'createdAt'>[] {
  const dateStr = period ? getPeriodRange(period).start : new Date().toISOString().split('T')[0];

  return rules
    .filter((rule) => shouldApplyRule(rule, totalIncome))
    .map((rule) => ({
      type: 'expense' as const,
      name: rule.name,
      amount: calculateRuleAmount(rule.amount, totalIncome, rule.amountType),
      category: rule.category ?? '',
      date: dateStr,
      source: 'rule' as const,
      ruleId: rule.id,
    }));
}
