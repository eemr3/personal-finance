'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePeriod } from '@/contexts/PeriodContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const MONTH_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function MonthSelector() {
  const { t } = useTranslation();
  const { period, setPeriod } = usePeriod();
  const monthName = t(`months.${period.month}`);
  const label = `${monthName} ${period.year}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          aria-label={t('monthSelector.ariaLabel')}
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 p-2 z-200 max-h-[70dvh] overflow-y-auto"
        align="start"
      >
        <div className="grid grid-cols-2 gap-1">
          {MONTH_LIST.map((monthNum) => {
            const name = t(`months.${monthNum}`);
            const isSelected = period.month === monthNum;
            return (
              <DropdownMenuItem
                key={monthNum}
                onClick={() =>
                  setPeriod({ month: monthNum, year: period.year })
                }
                className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:text-primary-foreground'
                    : ''
                }`}
              >
                {name}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
