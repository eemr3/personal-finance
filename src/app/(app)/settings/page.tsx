'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Globe,
  Moon,
  MoreVertical,
  Pencil,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFixedExpenseRules } from '@/features/rules/hooks/useFixedExpenseRules';
import { useAppearance } from '@/providers/AppearanceProvider';
import { useTheme } from 'next-themes';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { getCategoryLabel } from '@/lib/categories';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RuleFormModal, type RuleForEdit } from '@/features/rules/components/RuleFormModal';
import type {
  AppearanceCurrency,
  AppearanceLanguage,
} from '@/providers/AppearanceProvider';
import Image from 'next/image';

const CURRENCY_OPTIONS: { value: AppearanceCurrency; label: string }[] = [
  { value: 'brl', label: 'BRL (R$)' },
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
];

const LANGUAGE_OPTIONS: { value: AppearanceLanguage; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

function SettingsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { currency, language, setCurrency, setLanguage } = useAppearance();
  const {
    rules,
    loading: rulesLoading,
    addRule,
    updateRule,
    deleteRule,
    fetchRules,
  } = useFixedExpenseRules();
  const { formatCurrency } = useFormatCurrency();

  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleForEdit | null>(null);
  const [deleteRuleConfirmOpen, setDeleteRuleConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const currentTheme = (theme ?? 'dark') as string;

  const handleRuleSave = (
    payload: Record<string, unknown>,
    isEdit: boolean,
    id?: string,
  ) => {
    if (isEdit && id) {
      updateRule(id, payload);
    } else {
      addRule({ ...payload, createdAt: new Date() });
    }
    fetchRules();
    setRuleModalOpen(false);
    setEditingRule(null);
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setRuleModalOpen(true);
  };

  const handleEditRule = (rule: RuleForEdit) => {
    setEditingRule(rule);
    setRuleModalOpen(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteRuleConfirmOpen(true);
  };

  if (rulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {t('bottomNav.settings')}
        </h1>
      </header>

      {/* Profile Summary */}
      <section className="flex items-center gap-4 p-4 rounded-3xl bg-secondary border border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-primary to-primary/50 flex items-center justify-center text-primary-foreground shadow-lg">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Profile Picture"
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold">
            {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
        </div>
      </section>

      {/* Preferences - Dropdowns */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-2">
          {t('settings.preferences')}
        </h3>

        <div className="bg-card rounded-3xl border border-white/5 overflow-hidden">
          {/* Currency */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-base font-medium">{t('settings.currency')}</Label>
            </div>
            <Select
              value={currency}
              onValueChange={(v) => setCurrency(v as AppearanceCurrency)}
            >
              <SelectTrigger className="w-28 bg-transparent border-none focus:ring-0 h-auto py-0 min-h-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-white/10">
                {CURRENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-base font-medium">{t('settings.language')}</Label>
            </div>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as AppearanceLanguage)}
            >
              <SelectTrigger className="w-32 bg-transparent border-none focus:ring-0 h-auto py-0 min-h-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-white/10">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-base font-medium">{t('settings.theme')}</Label>
            </div>
            <Select value={currentTheme} onValueChange={(v) => setTheme(v)}>
              <SelectTrigger className="w-28 bg-transparent border-none focus:ring-0 h-auto py-0 min-h-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-white/10">
                {THEME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Automations & Rules */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pl-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t('settings.automationsAndRules')}
          </h3>
          <button
            type="button"
            onClick={handleAddRule}
            className="text-primary text-sm font-medium hover:underline"
          >
            {t('settings.addNew')}
          </button>
        </div>

        <div className="bg-card rounded-3xl border border-white/5 overflow-hidden">
          {rules.length > 0 ? (
            rules.map((rule, idx) => (
              <div
                key={rule.id}
                className={`p-4 flex items-center justify-between ${
                  idx !== rules.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div>
                  <h4 className="font-medium">{rule.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">
                    {rule.amountType === 'percentage' ? 'Percentage' : 'Fixed'} •{' '}
                    {getCategoryLabel(rule.category, 'fixed', t)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm">
                    {rule.amountType === 'percentage'
                      ? `${rule.amount}%`
                      : formatCurrency(
                          parseFloat(String(rule.amount).replace(',', '.')) || 0,
                        )}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-white/10">
                      <DropdownMenuItem
                        onClick={() => handleEditRule(rule as RuleForEdit)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {t('settings.noActiveRules')}
            </div>
          )}
        </div>
      </section>

      {/* Security & Privacy - placeholder, sem navegação */}
      <section className="space-y-4">
        <div className="bg-card rounded-3xl border border-white/5 overflow-hidden">
          <div className="w-full p-4 flex items-center justify-between opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-base font-medium cursor-not-allowed">
                {t('settings.securityAndPrivacy')}
              </Label>
            </div>
            <span className="text-xs text-muted-foreground">
              {t('settings.comingSoon')}
            </span>
          </div>
        </div>
      </section>

      {/* Log out */}
      <section>
        <button
          type="button"
          onClick={() => logout()}
          className="w-full p-4 rounded-3xl bg-card border border-white/5 flex items-center justify-between hover:bg-danger/10 hover:border-danger/30 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
              <span className="text-danger font-semibold">!</span>
            </div>
            <Label className="text-base font-medium text-danger cursor-pointer">
              {t('header.logout')}
            </Label>
          </div>
        </button>
      </section>

      <RuleFormModal
        open={ruleModalOpen}
        onClose={() => {
          setRuleModalOpen(false);
          setEditingRule(null);
        }}
        editingRule={editingRule}
        onSave={handleRuleSave}
      />

      <ConfirmDialog
        open={deleteRuleConfirmOpen}
        onOpenChange={setDeleteRuleConfirmOpen}
        title={t('common.confirmDelete')}
        description={t('settings.deleteRuleConfirm')}
        onConfirm={() => {
          if (ruleToDelete) {
            deleteRule(ruleToDelete);
            setRuleToDelete(null);
          }
        }}
        variant="destructive"
      />
    </div>
  );
}

export default SettingsPage;
