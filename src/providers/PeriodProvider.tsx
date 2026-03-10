'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { type Period, getCurrentPeriod } from '@/lib/period';

export type { Period } from '@/lib/period';
export { getPeriodRange, MONTH_NAMES } from '@/lib/period';

interface PeriodContextValue {
  period: Period;
  setPeriod: (period: Period) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  isCurrentMonth: boolean;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriodState] = useState<Period>(getCurrentPeriod);

  const setPeriod = useCallback((p: Period) => {
    setPeriodState(p);
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setPeriodState((prev) => {
      if (prev.month === 1) {
        return { month: 12, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setPeriodState((prev) => {
      if (prev.month === 12) {
        return { month: 1, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setPeriodState(getCurrentPeriod());
  }, []);

  const current = getCurrentPeriod();
  const isCurrentMonth =
    period.month === current.month && period.year === current.year;

  return (
    <PeriodContext.Provider
      value={{
        period,
        setPeriod,
        goToPreviousMonth,
        goToNextMonth,
        goToCurrentMonth,
        isCurrentMonth,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) {
    throw new Error('usePeriod must be used within PeriodProvider');
  }
  return ctx;
}
