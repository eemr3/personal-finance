'use client';

import { Calendar } from 'lucide-react';
import { usePeriod } from '@/contexts/PeriodContext';
import { MONTH_NAMES } from '@/lib/period';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PeriodSelector } from './PeriodSelector';

/**
 * Seletor de mês em formato pill (ícone + nome do mês).
 * Usado no mobile no lugar da barra completa; ao clicar abre o seletor completo.
 */
export function PeriodSelectorPill() {
  const { period } = usePeriod();
  const monthLabel = MONTH_NAMES[period.month] ?? '';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          aria-label="Selecionar mês"
        >
          <Calendar size={18} className="text-muted-foreground" />
          <span>{monthLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="w-(--radix-popover-trigger-width) min-w-[280px] p-2 z-300 bg-popover shadow-xl border border-border"
      >
        <PeriodSelector />
      </PopoverContent>
    </Popover>
  );
}
