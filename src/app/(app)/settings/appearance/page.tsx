'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { BottomNav } from '@/components/BottomNav';
import {
  useAppearance,
  type AppearanceCurrency,
  type AppearanceDateFormat,
  type AppearanceLanguage,
} from '@/contexts/AppearanceContext';
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  DollarSign,
  Calendar,
  Check,
} from 'lucide-react';
import US from 'country-flag-icons/react/3x2/US';
import ES from 'country-flag-icons/react/3x2/ES';
import BR from 'country-flag-icons/react/3x2/BR';

type Theme = 'light' | 'dark' | 'system';

function AppearancePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const {
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    language,
    setLanguage,
  } = useAppearance();

  const currentTheme = (theme ?? 'dark') as Theme;

  const themeOptions: {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      value: 'light',
      label: t('settings.appearance.themeLight'),
      icon: <Sun size={24} />,
      description: t('settings.appearance.themeLightDesc'),
    },
    {
      value: 'dark',
      label: t('settings.appearance.themeDark'),
      icon: <Moon size={24} />,
      description: t('settings.appearance.themeDarkDesc'),
    },
    {
      value: 'system',
      label: t('settings.appearance.themeSystem'),
      icon: <Monitor size={24} />,
      description: t('settings.appearance.themeSystemDesc'),
    },
  ];

  const currencyOptions: {
    value: AppearanceCurrency;
    label: string;
    symbol: string;
    description: string;
  }[] = [
    {
      value: 'usd',
      label: t('settings.appearance.currencyUsd'),
      symbol: '$',
      description: t('settings.appearance.currencyUsdDesc'),
    },
    {
      value: 'brl',
      label: t('settings.appearance.currencyBrl'),
      symbol: 'R$',
      description: t('settings.appearance.currencyBrlDesc'),
    },
    {
      value: 'eur',
      label: t('settings.appearance.currencyEur'),
      symbol: '€',
      description: t('settings.appearance.currencyEurDesc'),
    },
  ];

  const dateFormatOptions: {
    value: AppearanceDateFormat;
    label: string;
    example: string;
  }[] = [
    { value: 'mdy', label: 'MM/DD/YYYY', example: '03/07/2026' },
    { value: 'dmy', label: 'DD/MM/YYYY', example: '07/03/2026' },
    { value: 'ymd', label: 'YYYY-MM-DD', example: '2026-03-07' },
  ];

  const languageOptions: {
    value: AppearanceLanguage;
    label: string;
    Flag: React.ComponentType<{ className?: string }>;
  }[] = [
    { value: 'en', label: t('settings.appearance.languageEn'), Flag: US },
    { value: 'pt', label: t('settings.appearance.languagePt'), Flag: BR },
    { value: 'es', label: t('settings.appearance.languageEs'), Flag: ES },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/settings')}
            className="w-11 h-11 flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
            type="button"
            aria-label={t('common.back')}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="mb-1">{t('settings.appearance.title')}</h1>
            <p className="text-muted-foreground">
              {t('settings.appearance.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-2 pb-24 bg-linear-to-b from-primary/5 via-background to-background min-h-[60vh]">
        {/* Theme Selection */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            {t('settings.appearance.theme')}
          </h2>
          <div className="space-y-2">
            {themeOptions.map((option) => {
              const isSelected = currentTheme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all duration-200 ease-out ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-sm'
                      : 'bg-card border-border hover:bg-accent/80 hover:border-border'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check
                      size={22}
                      className="text-primary shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-border/60 mb-10" aria-hidden />

        {/* Currency Selection */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            {t('settings.appearance.currency')}
          </h2>
          <div className="space-y-2">
            {currencyOptions.map((option) => {
              const isSelected = currency === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCurrency(option.value)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all duration-200 ease-out ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-sm'
                      : 'bg-card border-border hover:bg-accent/80 hover:border-border'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <DollarSign size={24} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-medium text-foreground">
                        {option.label}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {option.symbol}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check
                      size={22}
                      className="text-primary shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-border/60 mb-10" aria-hidden />

        {/* Date Format Selection */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            {t('settings.appearance.dateFormat')}
          </h2>
          <div className="space-y-2">
            {dateFormatOptions.map((option) => {
              const isSelected = dateFormat === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDateFormat(option.value)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all duration-200 ease-out ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-sm'
                      : 'bg-card border-border hover:bg-accent/80 hover:border-border'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Calendar size={24} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-medium text-foreground">
                      {option.label}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t('settings.appearance.dateFormatExample')} {option.example}
                    </p>
                  </div>
                  {isSelected && (
                    <Check
                      size={22}
                      className="text-primary shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-border/60 mb-10" aria-hidden />

        {/* Language Selection */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            {t('settings.appearance.language')}
          </h2>
          <div className="space-y-2">
            {languageOptions.map((option) => {
              const isSelected = language === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const lang = option.value;
                    setLanguage(lang);
                    i18n.changeLanguage(lang);
                    if (typeof document !== 'undefined') {
                      document.documentElement.lang =
                        lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en';
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all duration-200 ease-out ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-sm'
                      : 'bg-card border-border hover:bg-accent/80 hover:border-border'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full overflow-hidden shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10'
                    }`}
                  >
                    <span className="inline-flex w-8 h-6 [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                      <option.Flag />
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-medium text-foreground">
                      {option.label}
                    </h4>
                  </div>
                  {isSelected && (
                    <Check
                      size={22}
                      className="text-primary shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}

export default AppearancePage;
