import type { FixedExpenseRule, Transaction } from '@/types/transactions';
import type { Period } from '@/lib/period';
import { getPeriodRange } from '@/lib/period';
import { stripCurrencyFromAmount } from '@/lib/format';

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

function shouldApplyRule(rule: FixedExpenseRule, totalIncome: number): boolean {
  const minIncome = parseConditionMinIncome(rule.condition ?? '');
  if (minIncome == null) return true;
  return totalIncome >= minIncome;
}

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
      paymentMethod: rule.paymentMethod,
      source: 'rule' as const,
      ruleId: rule.id,
    }));
}
