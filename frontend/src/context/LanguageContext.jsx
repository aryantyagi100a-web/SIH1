import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English (Simple)' },
  { code: 'hi', label: 'हिन्दी', nativeName: 'Hindi' },
  { code: 'as', label: 'অসমীয়া', nativeName: 'Assamese' },
  { code: 'bn', label: 'বাংলা', nativeName: 'Bengali' },
  { code: 'ne', label: 'नेपाली', nativeName: 'Nepali' },
  { code: 'mz', label: 'Mizo', nativeName: 'Mizo ṭawng' }
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ner_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('ner_lang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] || TRANSLATIONS.en, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
