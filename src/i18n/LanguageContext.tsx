import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Language, Translations } from './types';
import { uz } from './locales/uz';
import { ru } from './locales/ru';
import { en } from './locales/en';

const translations: Record<Language, Translations> = {
  uz,
  ru,
  en,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  availableLanguages: Array<{ code: Language; label: string; flag: string }>;
}

const STORAGE_KEY = 'school_portal_lang';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const availableLanguages: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'uz', label: 'O‘zbek', flag: 'UZ' },
  { code: 'ru', label: 'Русский', flag: 'RU' },
  { code: 'en', label: 'English', flag: 'EN' },
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'uz' || saved === 'ru' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore localStorage errors (e.g. incognito)
    }
    return 'uz';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = useMemo(() => translations[language] || translations.uz, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.meta.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t.meta.description);
    }
  }, [language, t]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
