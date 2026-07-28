import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('hafrose_lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('hafrose_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let result = translations[lang];
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return keyPath;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
