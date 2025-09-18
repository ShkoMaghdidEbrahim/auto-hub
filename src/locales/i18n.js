// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationKU from './ku.json';
import translationEN from './en.json';
import translationAR from './ar.json';

const resources = {
  ku: { translation: translationKU },
  en: { translation: translationEN },
  ar: { translation: translationAR }
};

const RTL_LANGUAGES = ['ku', 'ar', 'fa', 'he', 'ur'];

// Retrieve the saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(initReactI18next) // 👈 Enables react-i18next binding
  .init({
    resources,
    lng: savedLanguage, // Use saved language or default
    fallbackLng: 'ku',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'querystring'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: false // Avoids Suspense fallback flickers
    }
  });

// Change document direction & lang on language switch
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng); // Save language to localStorage
  document.documentElement.lang = lng;
  document.dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
});

// Initial document settings
document.documentElement.lang = i18n.language;
document.dir = RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr';

// ✅ Use `useTranslation` hook inside components for reactivity
// For external non-component usage:
const translation = (key, options) => i18n.t(key, options);

const changeLanguage = (lng) => i18n.changeLanguage(lng);

const getCurrentLanguage = () => i18n.language;

const getDirection = () =>
  RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr';

export { translation, changeLanguage, getCurrentLanguage, getDirection };
export default i18n;
