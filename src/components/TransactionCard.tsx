'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionCardProps {
  id: string;
  type: 'income' | 'expense' | 'fixed';
  name: string;
  amount: number;
  category?: string | null;
  paymentMethod?: string | null;
  date: string | { toDate: () => Date };
  icon?: React.ReactNode;
  onClick?: () => void;
  source?: 'manual' | 'rule';
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionCard({
  type,
  name,
  amount,
  category,
  paymentMethod,
  date,
  icon,
  onClick,
  source,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const { formatCurrency } = useFormatCurrency();
  const { formatDate } = useFormatDate();
  const isIncome = type === 'income';
  const canEdit = source !== 'rule' && (onEdit || onDelete);
  const { t } = useTranslation();
  /** Transações de regra (despesa fixa) usam categorias de categoriesFixedExpense */
  const categoryTypeForLabel = source === 'rule' ? 'fixed' : type;

  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl bg-card border border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border ${
            isIncome
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
        {icon || (
          <CategoryIcon
            category={category ?? 'other'}
            className={isIncome ? 'text-primary' : 'text-danger'}
          />
        )}
        </div>
        <div>
          <h4 className="font-medium text-foreground text-base mb-0.5 truncate">
            {name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(date)}</span>
            {category && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span className="truncate max-w-[100px]">
                  {getCategoryLabel(category, categoryTypeForLabel, t)}
                  {paymentMethod &&
                    ` · ${t(`transactions.paymentMethods.${paymentMethod}`)}`}
                </span>
              </>
            )}
            {source === 'rule' && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>({t('settings.fixedExpenseRules.rule')})</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <span
            className={`font-bold text-[15px] flex items-center gap-1 ${
              isIncome ? 'text-primary' : 'text-foreground'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(Number(amount))}
          </span>
        </div>
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center justify-center rounded-lg"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ações"
              >
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/10">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil size={16} className="mr-2" />
                  {t('transactions.edit')}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 size={16} className="mr-2" />
                  {t('transactions.delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}
