import React from 'react';
import { Card } from './Card';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { getCategoryLabel } from '@/lib/categories';
import { useTranslation } from 'react-i18next';
import { CategoryIcon } from './CategoryIcon';

interface RuleCardProps {
  id: string;
  name: string;
  condition: string;
  amount: string;
  amountType?: 'fixed' | 'percentage';
  category?: string | null;
  formatCurrency?: (value: number) => string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RuleCard({
  name,
  condition,
  amount,
  amountType,
  category = '',
  formatCurrency,
  onEdit,
  onDelete,
}: RuleCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const { t } = useTranslation();
  const isPercentage = amountType === 'percentage' || amount.includes('%');
  const displayAmount =
    !isPercentage && formatCurrency
      ? formatCurrency(parseFloat(amount.replace(',', '.')) || 0)
      : amount.includes('%')
        ? amount
        : `${amount}%`;
  const categoryKey = (category || 'other').trim().toLowerCase();

  return (
    <Card className="relative border border-border rounded-xl hover:bg-accent/50 hover:border-border transition-all duration-200 ease-out">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary"
          aria-hidden
        >
          <CategoryIcon category={categoryKey} className="size-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground mb-1 truncate">{name}</h4>
          <p className="text-sm text-muted-foreground mb-2">{condition}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
              {displayAmount}
            </span>
            <span className="inline-block px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm">
              {getCategoryLabel(category ?? '', 'fixed', t)}
            </span>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
            type="button"
            aria-label={t('common.actions')}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[150px] z-20">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-left"
                >
                  <Edit size={18} />
                  <span>{t('common.edit')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-danger/10 text-danger rounded-lg transition-colors duration-200 text-left"
                >
                  <Trash2 size={18} />
                  <span>{t('common.delete')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
