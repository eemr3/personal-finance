'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import i18n from '@/i18n';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
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
      label: 'Claro',
      icon: <Sun size={24} />,
      description: 'Interface limpa e clara',
    },
    {
      value: 'dark',
      label: 'Escuro',
      icon: <Moon size={24} />,
      description: 'Confortável à noite',
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: <Monitor size={24} />,
      description: 'Seguir preferência do dispositivo',
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
      label: 'US Dollar',
      symbol: '$',
      description: 'USD - United States',
    },
    {
      value: 'brl',
      label: 'Brazilian Real',
      symbol: 'R$',
      description: 'BRL - Brazil',
    },
    {
      value: 'eur',
      label: 'Euro',
      symbol: '€',
      description: 'EUR - European Union',
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
    { value: 'en', label: 'English', Flag: US },
    { value: 'pt', label: 'Português', Flag: BR },
    { value: 'es', label: 'Español', Flag: ES },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/settings')}
            className="w-11 h-11 flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
            type="button"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="mb-1">Aparência</h1>
            <p className="text-muted-foreground">
              Personalize o tema e a exibição do app
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Theme Selection */}
        <div>
          <h3 className="mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Tema
          </h3>
          <Card>
            <div className="space-y-3">
              {themeOptions.map((option, index) => (
                <React.Fragment key={option.value}>
                  {index > 0 && <div className="h-px bg-border"></div>}
                  <button
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className="w-full flex items-center gap-4 p-3 -m-3 rounded-xl hover:bg-accent transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currentTheme === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h4>{option.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {currentTheme === option.value && (
                      <Check size={24} className="text-primary" />
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>

        {/* Currency Selection */}
        <div>
          <h3 className="mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Moeda
          </h3>
          <Card>
            <div className="space-y-3">
              {currencyOptions.map((option, index) => (
                <React.Fragment key={option.value}>
                  {index > 0 && <div className="h-px bg-border"></div>}
                  <button
                    type="button"
                    onClick={() => setCurrency(option.value)}
                    className="w-full flex items-center gap-4 p-3 -m-3 rounded-xl hover:bg-accent transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currency === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <DollarSign size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-baseline gap-2">
                        <h4>{option.label}</h4>
                        <span className="text-sm text-muted-foreground">
                          {option.symbol}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {currency === option.value && (
                      <Check size={24} className="text-primary" />
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>

        {/* Date Format Selection */}
        <div>
          <h3 className="mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Formato de data
          </h3>
          <Card>
            <div className="space-y-3">
              {dateFormatOptions.map((option, index) => (
                <React.Fragment key={option.value}>
                  {index > 0 && <div className="h-px bg-border"></div>}
                  <button
                    type="button"
                    onClick={() => setDateFormat(option.value)}
                    className="w-full flex items-center gap-4 p-3 -m-3 rounded-xl hover:bg-accent transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        dateFormat === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Calendar size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4>{option.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        Exemplo: {option.example}
                      </p>
                    </div>
                    {dateFormat === option.value && (
                      <Check size={24} className="text-primary" />
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>

        {/* Language Selection */}
        <div>
          <h3 className="mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Idioma
          </h3>
          <Card>
            <div className="space-y-3">
              {languageOptions.map((option, index) => (
                <React.Fragment key={option.value}>
                  {index > 0 && <div className="h-px bg-border"></div>}
                  <button
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
                    className="w-full flex items-center gap-4 p-3 -m-3 rounded-xl hover:bg-accent transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${
                        language === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10'
                      }`}
                    >
                      <span className="inline-flex w-8 h-6 shrink-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                        <option.Flag />
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <h4>{option.label}</h4>
                    </div>
                    {language === option.value && (
                      <Check size={24} className="text-primary" />
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>

        <div className="pb-6"></div>
      </div>

      <BottomNav />
    </div>
  );
}

export default AppearancePage;
