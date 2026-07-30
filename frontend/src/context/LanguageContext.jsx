import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { translations } from '../utils/i18n';
import { statePersistence } from '../lib/statePersistence';
import { crossTabSync } from '../services/network/crossTabSync';

const LanguageContext = createContext(null);
const LANG_KEY = 'lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() =>
    statePersistence.getItem(LANG_KEY, 'fr')
  );

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    statePersistence.setItem(LANG_KEY, newLang);
    crossTabSync.broadcast('LANG_CHANGED', { lang: newLang });
  }, []);

  useEffect(() => {
    statePersistence.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((msg) => {
      if (msg.type === 'LANG_CHANGED' && msg.payload?.lang) {
        setLangState(msg.payload.lang);
      }
    });
    return unsubscribe;
  }, []);

  const t = useCallback(
    (keyPath) => {
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
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      isRtl: lang === 'ar',
    }),
    [lang, setLang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
