'use client';

import { I18nextProvider } from 'react-i18next';
import { useEffect } from 'react';
import i18n from '@/i18n';
import { useAppearance } from '@/providers/AppearanceProvider';

/**
 * Sincroniza o idioma do i18n com a preferência do usuário (Aparência).
 * Deve ser usado dentro de AppearanceProvider.
 */
function I18nLanguageSync({ children }: { children: React.ReactNode }) {
  const { language } = useAppearance();

  useEffect(() => {
    i18n.changeLanguage(language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es' : 'en';
    }
  }, [language]);

  return <>{children}</>;
}

/**
 * Provider do react-i18next + sincronização com o idioma escolhido em Aparência.
 * Envolver a app dentro de AppearanceProvider antes deste provider.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <I18nLanguageSync>{children}</I18nLanguageSync>
    </I18nextProvider>
  );
}
