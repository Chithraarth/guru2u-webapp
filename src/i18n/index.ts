import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import {
  translations,
  LANGUAGES,
  SUPPORTED_LANGUAGE_CODES,
  isRtl,
  type LanguageOption,
} from '@workspace/locales';

export { LANGUAGES, SUPPORTED_LANGUAGE_CODES, isRtl };
export type { LanguageOption };

export const LANGUAGE_STORAGE_KEY = 'app-language';
export const COUNTRY_STORAGE_KEY = 'app-country';
export const LOCALE_CHOSEN_KEY = 'app-locale-chosen';

/** Best-effort language guess from the browser, restricted to supported codes. */
export function detectBrowserLanguage(): string {
  for (const locale of navigator.languages ?? [navigator.language]) {
    const base = locale?.split('-')[0]?.toLowerCase();
    if (base && SUPPORTED_LANGUAGE_CODES.includes(base)) return base;
  }
  return 'en';
}

/** Best-effort country guess from the browser locale (ISO 3166-1 alpha-2). */
export function detectBrowserCountry(): string {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    if (region && /^[A-Z]{2}$/.test(region)) return region;
  } catch {
    // ignore
  }
  return 'US';
}

function applyDocumentLanguage(lang: string) {
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: Object.fromEntries(
      Object.entries(translations).map(([code, resource]) => [code, { translation: resource }]),
    ),
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    nonExplicitSupportedLngs: true,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    returnObjects: true,
  });

applyDocumentLanguage(i18n.resolvedLanguage ?? 'en');
i18n.on('languageChanged', (lang) => applyDocumentLanguage(lang.split('-')[0]));

export default i18n;
