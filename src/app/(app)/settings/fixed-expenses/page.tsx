'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { RuleCard } from '@/components/RuleCard';
import { Input, Select } from '@/components/Input';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useFixedExpenseRules } from '@/features/rules/hooks/useFixedExpenseRules';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { BottomNav } from '../../../../components/BottomNav';

type ConditionType = 'always' | 'income_above' | 'day_of_month' | 'custom';

const CONDITION_TYPE_OPTIONS: { value: ConditionType; label: string }[] = [
  { value: 'always', label: 'Sempre aplicar' },
  { value: 'income_above', label: 'Quando receita for maior que' },
  { value: 'day_of_month', label: 'Todo mês no dia' },
  { value: 'custom', label: 'Outra (descreva)' },
];

function buildConditionString(
  type: ConditionType,
  incomeMin: string,
  day: string,
  custom: string,
  currencySymbol = 'R$',
): string {
  switch (type) {
    case 'always':
      return 'Sempre aplicar';
    case 'income_above': {
      const normalized = incomeMin.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(normalized);
      if (Number.isNaN(num) || num <= 0) return 'Sempre aplicar';
      return `Se receita > ${currencySymbol} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    case 'day_of_month':
      return day ? `Mensalmente no dia ${day}` : 'Sempre aplicar';
    case 'custom':
      return custom.trim() || 'Sempre aplicar';
    default:
      return 'Sempre aplicar';
  }
}

function parseCondition(condition: string): {
  type: ConditionType;
  incomeMin: string;
  day: string;
  custom: string;
} {
  const c = (condition || '').trim();
  const lower = c.toLowerCase();
  if (!c || lower.includes('sempre aplicar')) {
    return { type: 'always', incomeMin: '', day: '', custom: '' };
  }
  // "if income > 3200", "receita > 3000", "Se receita > R$ 3.000"
  if (lower.includes('income') || lower.includes('receita')) {
    const num = c
      .replace(/[^\d,.]/g, '')
      .replace(',', '.')
      .replace(/\.(?=.*\.)/g, '');
    if (num)
      return { type: 'income_above', incomeMin: num, day: '', custom: '' };
  }
  const dayMatch = c.match(
    /dia\s*(\d{1,2})|(\d{1,2})\s*do\s*mês|mensalmente\s*no\s*dia\s*(\d{1,2})|day\s*(\d{1,2})/i,
  );
  if (dayMatch) {
    const d = (
      dayMatch[1] ||
      dayMatch[2] ||
      dayMatch[3] ||
      dayMatch[4] ||
      ''
    ).trim();
    if (d) return { type: 'day_of_month', incomeMin: '', day: d, custom: '' };
  }
  return { type: 'custom', incomeMin: '', day: '', custom: c };
}

interface Rule {
  id: string;
  name: string;
  condition: string;
  amount: string;
  category: string;
}

function FixedExpensesPage() {
  const router = useRouter();
  const { currencySymbol } = useFormatCurrency();
  const { rules, loading, fetchRules, addRule, updateRule, deleteRule } =
    useFixedExpenseRules();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  // const [rules, setRules] = useState<Rule[]>([
  //   {
  //     id: '2',
  //     name: 'Tithe',
  //     condition: 'Always apply',
  //     amount: '10%',
  //     category: 'Religious',
  //   },
  //   {
  //     id: '3',
  //     name: 'DAS Tax',
  //     condition: 'Monthly on day 20',
  //     amount: '$450',
  //     category: 'Taxes',
  //   },
  //   {
  //     id: '4',
  //     name: 'Cursor AI Subscription',
  //     condition: 'Monthly on day 1',
  //     amount: '$20',
  //     category: 'Subscriptions',
  //   },
  // ]);

  const [formData, setFormData] = useState({
    name: '',
    conditionType: 'always' as ConditionType,
    conditionIncomeMin: '',
    conditionDay: '',
    conditionCustom: '',
    amountType: 'fixed',
    amount: '',
    category: '',
  });

  const categoryOptions = [
    { value: 'educação', label: 'Educação' },
    { value: 'religious', label: 'Religioso' },
    { value: 'taxes', label: 'Impostos' },
    { value: 'subscriptions', label: 'Assinaturas' },
    { value: 'utilities', label: 'Utilidades' },
    { value: 'insurance', label: 'Seguros' },
    { value: 'debt', label: 'Dívidas' },
    { value: 'savings', label: 'Economia' },
    { value: 'other', label: 'Outros' },
  ];

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      conditionType: 'always',
      conditionIncomeMin: '',
      conditionDay: '',
      conditionCustom: '',
      amountType: 'fixed',
      amount: '',
      category: categoryOptions[0].value,
    });
    setShowModal(true);
  };

  const handleEditRule = (rule: Rule & { amountType?: string }) => {
    setEditingRule(rule);
    const isPercentage =
      rule.amountType === 'percentage' || rule.amount.includes('%');
    const raw = (rule.category ?? '').toLowerCase().trim();
    const categoryValue =
      raw === 'education' ? 'educação' : raw || categoryOptions[0].value;
    const parsed = parseCondition(rule.condition ?? '');
    setFormData({
      name: rule.name,
      conditionType: parsed.type,
      conditionIncomeMin: parsed.incomeMin,
      conditionDay: parsed.day,
      conditionCustom: parsed.custom,
      amountType: isPercentage ? 'percentage' : 'fixed',
      amount: rule.amount.replace('$', '').replace('%', ''),
      category: categoryValue,
    });
    setShowModal(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteRule(ruleId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const condition = buildConditionString(
      formData.conditionType,
      formData.conditionIncomeMin,
      formData.conditionDay,
      formData.conditionCustom,
      currencySymbol,
    );
    const payload = {
      name: formData.name.trim(),
      condition,
      amountType: formData.amountType,
      amount: formData.amount.trim(),
      category: (formData.category || categoryOptions[0].value).trim(),
    };
    if (editingRule) {
      updateRule(editingRule.id, payload);
    } else {
      addRule({
        ...payload,
        createdAt: new Date(),
      });
    }
    fetchRules();
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1>Regras de despesas fixas</h1>
          </div>
        </div>
        <p className="text-muted-foreground ml-14">
          Regras automáticas para despesas recorrentes
        </p>
      </div>

      <div className="px-6 space-y-3">
        {rules.length > 0 ? (
          rules.map((rule) => (
            <RuleCard
              key={rule.id}
              id={rule.id}
              name={rule.name}
              condition={rule.condition}
              amount={rule.amount}
              category={rule.category ?? ''}
              onEdit={() => handleEditRule(rule)}
              onDelete={() => handleDeleteRule(rule.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma regra configurada ainda
            </p>
            <Button onClick={handleAddRule}>Criar primeira regra</Button>
          </div>
        )}

        {rules.length > 0 && (
          <div className="pt-4">
            <Button
              fullWidth
              onClick={handleAddRule}
              variant="outline"
              className="border-dashed"
            >
              <Plus size={20} className="mr-2" />
              Nova regra
            </Button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-background w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2>{editingRule ? 'Editar regra' : 'Nova regra'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <Input
                label="Nome da regra"
                placeholder="ex.: Pagamento Trybe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div>
                <label className="text-sm text-foreground mb-2 block">
                  Condição
                </label>
                <Select
                  options={CONDITION_TYPE_OPTIONS}
                  value={formData.conditionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conditionType: e.target.value as ConditionType,
                    })
                  }
                />
                {formData.conditionType === 'income_above' && (
                  <div className="mt-3 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="0"
                      value={formData.conditionIncomeMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditionIncomeMin: e.target.value,
                        })
                      }
                      className="w-full mt-2 pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                {formData.conditionType === 'day_of_month' && (
                  <div className="mt-3">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="1 a 31"
                      value={formData.conditionDay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditionDay: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 2),
                        })
                      }
                      className="w-full mt-2 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                {formData.conditionType === 'custom' && (
                  <input
                    type="text"
                    placeholder={`Ex.: Se receita > ${currencySymbol} 5.000 e mês ímpar`}
                    value={formData.conditionCustom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditionCustom: e.target.value,
                      })
                    }
                    className="w-full mt-3 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>

              <div>
                <label className="text-sm text-foreground mb-2 block">
                  Tipo de valor
                </label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, amountType: 'fixed' })
                    }
                    className={`flex-1 py-3 rounded-xl transition-all ${
                      formData.amountType === 'fixed'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    Valor fixo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, amountType: 'percentage' })
                    }
                    className={`flex-1 py-3 rounded-xl transition-all ${
                      formData.amountType === 'percentage'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    Percentual
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                    {formData.amountType === 'fixed' ? currencySymbol : '%'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
              </div>

              <Select
                label="Categoria"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />

              <div className="pt-4 space-y-3">
                <Button type="submit" fullWidth size="lg">
                  {editingRule ? 'Salvar alterações' : 'Adicionar regra'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

export default FixedExpensesPage;
