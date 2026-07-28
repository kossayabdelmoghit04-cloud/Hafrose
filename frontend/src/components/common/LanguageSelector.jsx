import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative inline-flex items-center text-xs tracking-wider uppercase">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-transparent border border-amber-900/20 text-neutral-800 dark:text-neutral-200 px-2 py-1 rounded focus:outline-none focus:border-amber-600 transition-colors cursor-pointer"
        aria-label="Sélectionner la langue"
      >
        <option value="fr" className="bg-neutral-900 text-white">FR</option>
        <option value="ar" className="bg-neutral-900 text-white">العربية</option>
        <option value="en" className="bg-neutral-900 text-white">EN</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
