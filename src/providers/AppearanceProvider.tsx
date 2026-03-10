'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { getDetectedPreferences } from '@/lib/locale';

const STORAGE_KEY = 'personal-finance-appearance';

export type AppearanceCurrency = 'usd' | 'brl' | 'eur';
export type AppearanceDateFormat = 'mdy' | 'dmy' | 'ymd';
export type AppearanceLanguage = 'en' | 'pt' | 'es';

interface AppearanceState {
  currency: AppearanceCurrency;
  dateFormat: AppearanceDateFormat;
  language: AppearanceLanguage;
}

const defaultState: AppearanceState = {
  currency: 'brl',
  dateFormat: 'dmy',
  language: 'pt',
};

function loadFromStorage(): AppearanceState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppearanceState>;
    return {
      currency: parsed.currency ?? defaultState.currency,
      dateFormat: parsed.dateFormat ?? defaultState.dateFormat,
      language: parsed.language ?? defaultState.language,
    };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: AppearanceState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

interface AppearanceContextValue extends AppearanceState {
  setCurrency: (currency: AppearanceCurrency) => void;
  setDateFormat: (dateFormat: AppearanceDateFormat) => void;
  setLanguage: (language: AppearanceLanguage) => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AppearanceState>(() =>
    typeof window !== 'undefined' ? loadFromStorage() : defaultState,
  );
  const [mounted, setMounted] = useState(false);
  const initialSaveSkipped = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // No cliente, após mount: garante estado a partir do storage ou detecção (hidratação + primeira vez)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    const next = raw
      ? (() => {
          try {
            const parsed = JSON.parse(raw) as Partial<AppearanceState>;
            return {
              currency: parsed.currency ?? defaultState.currency,
              dateFormat: parsed.dateFormat ?? defaultState.dateFormat,
              language: parsed.language ?? defaultState.language,
            };
          } catch {
            return getDetectedPreferences();
          }
        })()
      : getDetectedPreferences();
    setState(next);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!initialSaveSkipped.current) {
      initialSaveSkipped.current = true;
      return;
    }
    saveToStorage(state);
  }, [mounted, state]);

  const setCurrency = useCallback((currency: AppearanceCurrency) => {
    setState((prev) => ({ ...prev, currency }));
  }, []);

  const setDateFormat = useCallback((dateFormat: AppearanceDateFormat) => {
    setState((prev) => ({ ...prev, dateFormat }));
  }, []);

  const setLanguage = useCallback((language: AppearanceLanguage) => {
    setState((prev) => ({ ...prev, language }));
  }, []);

  const value: AppearanceContextValue = {
    ...state,
    setCurrency,
    setDateFormat,
    setLanguage,
  };

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return ctx;
}
