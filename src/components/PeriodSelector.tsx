'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { usePeriod } from '@/contexts/PeriodContext';
import { MONTH_NAMES } from '@/lib/period';

export function PeriodSelector() {
  const {
    period,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
  } = usePeriod();

  return (
    <div className="flex items-center justify-between gap-2 bg-card rounded-xl px-4 py-2 border border-border">
      <button
        type="button"
        onClick={goToPreviousMonth}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={goToCurrentMonth}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg transition-colors ${
          isCurrentMonth ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
        }`}
      >
        <Calendar size={18} />
        <span className="text-sm">
          {MONTH_NAMES[period.month]} {period.year}
        </span>
      </button>

      <button
        type="button"
        onClick={goToNextMonth}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
