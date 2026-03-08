'use client';

import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';

import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useFormatDate } from '@/hooks/useFormatDate';
import { formatCategoryLabel } from '@/lib/categories';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface TransactionCardProps {
  id: string;
  type: 'income' | 'expense';
  name: string;
  amount: number;
  category?: string | null;
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
  const amountColor = isIncome ? 'text-success' : 'text-danger';
  const canEdit = source !== 'rule' && (onEdit || onDelete);
  const { t } = useTranslation();

  return (
    <div
      className="bg-card rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-success/10' : 'bg-danger/10'}`}
      >
        {icon ||
          (isIncome ? (
            <ArrowDownRight className="text-success" size={24} />
          ) : (
            <ArrowUpRight className="text-danger" size={24} />
          ))}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="truncate">{name}</h4>
        <p className="text-sm text-muted-foreground">
          {formatCategoryLabel(category ?? '')}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right min-w-[100px]">
          <p className={`font-medium ${amountColor}`}>
            {isIncome ? '+' : '-'} {formatCurrency(Number(amount))}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
          {source === 'rule' && (
            <span className="text-xs text-muted-foreground">
              ({t('settings.fixedExpenseRules.rule')})
            </span>
          )}
        </div>
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ações"
              >
                <MoreVertical size={24} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil size={16} className="mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-danger"
                >
                  <Trash2 size={16} className="mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="w-10 h-10 shrink-0" aria-hidden />
        )}
      </div>
    </div>
  );
}
