import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from '@/messages/pt.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
};

const STORAGE_KEY = 'personal-finance-appearance';
function getInitialLanguage(): string {
  if (typeof window === 'undefined') return 'pt';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'pt';
    const parsed = JSON.parse(raw) as { language?: string };
    const lang = parsed.language;
    if (lang === 'en' || lang === 'es' || lang === 'pt') return lang;
    return 'pt';
  } catch {
    return 'pt';
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: typeof window !== 'undefined' ? getInitialLanguage() : 'pt',
  fallbackLng: 'pt',
  supportedLngs: ['pt', 'en', 'es'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
