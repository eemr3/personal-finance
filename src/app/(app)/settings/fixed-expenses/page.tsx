'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { RuleCard } from '@/components/RuleCard';
import { Input, Select, TextArea } from '@/components/Input';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useFixedExpenseRules } from '@/features/rules/hooks/useFixedExpenseRules';

interface Rule {
  id: string;
  name: string;
  condition: string;
  amount: string;
  category: string;
}

function FixedExpensesPage() {
  const router = useRouter();
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
    condition: '',
    amountType: 'fixed',
    amount: '',
    category: '',
  });

  const categoryOptions = [
    { value: 'education', label: 'Education' },
    { value: 'religious', label: 'Religious' },
    { value: 'taxes', label: 'Taxes' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'debt', label: 'Debt Payment' },
    { value: 'savings', label: 'Savings' },
    { value: 'other', label: 'Other' },
  ];

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      condition: '',
      amountType: 'fixed',
      amount: '',
      category: '',
    });
    setShowModal(true);
  };

  const handleEditRule = (rule: Rule & { amountType?: string }) => {
    setEditingRule(rule);
    const isPercentage =
      rule.amountType === 'percentage' || rule.amount.includes('%');
    setFormData({
      name: rule.name,
      condition: rule.condition,
      amountType: isPercentage ? 'percentage' : 'fixed',
      amount: rule.amount.replace('$', '').replace('%', ''),
      category: rule.category.toLowerCase(),
    });
    setShowModal(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteRule(ruleId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      updateRule(editingRule.id, formData);
    } else {
      addRule({
        ...formData,
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
            <h1>Fixed Expense Rules</h1>
          </div>
        </div>
        <p className="text-muted-foreground ml-14">
          Automatic rules for recurring expenses
        </p>
      </div>

      <div className="px-6 space-y-3">
        {rules.length > 0 ? (
          rules.map((rule) => (
            <RuleCard
              key={rule.id}
              {...rule}
              onEdit={() => handleEditRule(rule)}
              onDelete={() => handleDeleteRule(rule.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No rules configured yet
            </p>
            <Button onClick={handleAddRule}>Add Your First Rule</Button>
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
              Add New Rule
            </Button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-background w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2>{editingRule ? 'Edit Rule' : 'New Rule'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <Input
                label="Rule Name"
                placeholder="e.g., Trybe Payment"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <TextArea
                label="Condition"
                placeholder="e.g., If income > $3,000 or Monthly on day 15"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                required
              />

              <div>
                <label className="text-sm text-foreground mb-2 block">
                  Amount Type
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
                    Fixed Amount
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
                    Percentage
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                    {formData.amountType === 'fixed' ? '$' : '%'}
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
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />

              <div className="pt-4 space-y-3">
                <Button type="submit" fullWidth size="lg">
                  {editingRule ? 'Save Changes' : 'Add Rule'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FixedExpensesPage;
