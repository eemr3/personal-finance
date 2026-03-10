/**
 * Detecta preferências de idioma, moeda e formato de data a partir do navegador.
 * Usado na primeira vez no app (quando não há dados salvos no localStorage).
 */

export type DetectedLanguage = 'en' | 'pt' | 'es';
export type DetectedCurrency = 'usd' | 'brl' | 'eur';
export type DetectedDateFormat = 'mdy' | 'dmy' | 'ymd';

export interface DetectedPreferences {
  language: DetectedLanguage;
  currency: DetectedCurrency;
  dateFormat: DetectedDateFormat;
}

function getBrowserLocale(): string {
  if (typeof navigator === 'undefined') return 'en';
  const lang =
    navigator.languages?.[0] ?? navigator.language ?? (navigator as { userLanguage?: string }).userLanguage ?? 'en';
  return typeof lang === 'string' ? lang : 'en';
}

export function detectLanguage(): DetectedLanguage {
  const locale = getBrowserLocale().toLowerCase();
  if (locale.startsWith('pt')) return 'pt';
  if (locale.startsWith('es')) return 'es';
  return 'en';
}

export function detectCurrency(): DetectedCurrency {
  const locale = getBrowserLocale().toLowerCase();
  if (locale.startsWith('pt')) return 'brl';
  if (locale.startsWith('en')) return 'usd';
  if (locale.startsWith('es')) return 'eur';
  const euCodes = ['de', 'fr', 'it', 'nl', 'at', 'be', 'fi', 'ie', 'el', 'pt'];
  const region = locale.split('-')[1] ?? locale.split('-')[0];
  if (region && euCodes.some((c) => region.startsWith(c))) return 'eur';
  return 'usd';
}

export function detectDateFormat(): DetectedDateFormat {
  const locale = getBrowserLocale().toLowerCase();
  if (locale.startsWith('en-us') || locale === 'en') return 'mdy';
  return 'dmy';
}

export function getDetectedPreferences(): DetectedPreferences {
  return {
    language: detectLanguage(),
    currency: detectCurrency(),
    dateFormat: detectDateFormat(),
  };
}
