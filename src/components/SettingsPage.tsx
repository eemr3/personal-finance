import { ArrowLeft, Sun, Moon, Monitor, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface SettingOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg?: string;
}

interface SettingSection {
  title: string;
  options: SettingOption[];
}

export function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState('escuro');
  const [selectedCurrency, setSelectedCurrency] = useState('brl');
  const [selectedDateFormat, setSelectedDateFormat] = useState('dd-mm-yyyy');
  const [selectedLanguage, setSelectedLanguage] = useState('pt');

  const themeOptions: SettingOption[] = [
    {
      id: 'claro',
      icon: <Sun className="w-5 h-5" />,
      title: 'Claro',
      description: 'Interface limpa e clara',
      iconBg: 'bg-teal-500/20',
    },
    {
      id: 'escuro',
      icon: <Moon className="w-5 h-5" />,
      title: 'Escuro',
      description: 'Confortável à noite',
      iconBg: 'bg-teal-500/20',
    },
    {
      id: 'sistema',
      icon: <Monitor className="w-5 h-5" />,
      title: 'Sistema',
      description: 'Seguir preferência do dispositivo',
      iconBg: 'bg-teal-500/20',
    },
  ];

  const currencyOptions: SettingOption[] = [
    {
      id: 'usd',
      icon: <span className="text-lg">$</span>,
      title: 'US Dollar $',
      description: 'USD - United States',
      iconBg: 'bg-teal-500/20',
    },
    {
      id: 'brl',
      icon: <span className="text-lg">R$</span>,
      title: 'Brazilian Real R$',
      description: 'BRL - Brazil',
      iconBg: 'bg-teal-500/20',
    },
    {
      id: 'eur',
      icon: <span className="text-lg">€</span>,
      title: 'Euro €',
      description: 'EUR - European Union',
      iconBg: 'bg-teal-500/20',
    },
  ];

  const dateFormatOptions: SettingOption[] = [
    {
      id: 'mm-dd-yyyy',
      icon: <Calendar className="w-5 h-5" />,
      title: 'MM/DD/YYYY',
      description: 'Exemplo: 03/07/2026',
      iconBg: 'bg-teal-500/20',
    },
    {
      id: 'dd-mm-yyyy',
      icon: <Calendar className="w-5 h-5" />,
      title: 'DD/MM/YYYY',
      description: 'Exemplo: 07/03/2026',
      iconBg: 'bg-teal-500/20',
    },
    {
      id: 'yyyy-mm-dd',
      icon: <Calendar className="w-5 h-5" />,
      title: 'YYYY-MM-DD',
      description: 'Exemplo: 2026-03-07',
      iconBg: 'bg-teal-500/20',
    },
  ];

  const languageOptions: SettingOption[] = [
    {
      id: 'en',
      icon: <span className="text-2xl">🇺🇸</span>,
      title: 'English',
      description: '',
    },
    {
      id: 'pt',
      icon: <span className="text-2xl">🇧🇷</span>,
      title: 'Português',
      description: '',
    },
    {
      id: 'es',
      icon: <span className="text-2xl">🇪🇸</span>,
      title: 'Español',
      description: '',
    },
  ];

  const renderOption = (
    option: SettingOption,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <button
      key={option.id}
      onClick={onSelect}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all group ${
        isSelected
          ? 'bg-teal-500/10 border border-teal-500/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full ${
          option.iconBg || 'bg-transparent'
        } text-teal-400`}
      >
        {option.icon}
      </div>
      <div className="flex-1 text-left">
        <div className="text-white font-medium">{option.title}</div>
        {option.description && (
          <div className="text-sm text-teal-200/60 mt-0.5">
            {option.description}
          </div>
        )}
      </div>
      {isSelected && (
        <svg
          className="w-5 h-5 text-teal-400 flex-shrink-0"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-teal-300" />
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Aparência</h1>
          <p className="text-teal-200/70">
            Personalize o tema e a exibição do app
          </p>
        </div>

        {/* Theme Section */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-teal-300/70 uppercase tracking-wider mb-4 px-2">
            Tema
          </h2>
          <div className="space-y-2">
            {themeOptions.map((option) =>
              renderOption(option, selectedTheme === option.id, () =>
                setSelectedTheme(option.id)
              )
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-teal-700/30 mb-10" />

        {/* Currency Section */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-teal-300/70 uppercase tracking-wider mb-4 px-2">
            Moeda
          </h2>
          <div className="space-y-2">
            {currencyOptions.map((option) =>
              renderOption(option, selectedCurrency === option.id, () =>
                setSelectedCurrency(option.id)
              )
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-teal-700/30 mb-10" />

        {/* Date Format Section */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-teal-300/70 uppercase tracking-wider mb-4 px-2">
            Formato de Data
          </h2>
          <div className="space-y-2">
            {dateFormatOptions.map((option) =>
              renderOption(option, selectedDateFormat === option.id, () =>
                setSelectedDateFormat(option.id)
              )
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-teal-700/30 mb-10" />

        {/* Language Section */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-teal-300/70 uppercase tracking-wider mb-4 px-2">
            Idioma
          </h2>
          <div className="space-y-2">
            {languageOptions.map((option) =>
              renderOption(option, selectedLanguage === option.id, () =>
                setSelectedLanguage(option.id)
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
