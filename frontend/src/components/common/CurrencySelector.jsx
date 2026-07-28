import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const CurrencySelector = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  return (
    <div className="relative inline-flex items-center text-xs tracking-wider uppercase">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-transparent border border-amber-900/20 text-neutral-800 dark:text-neutral-200 px-2 py-1 rounded focus:outline-none focus:border-amber-600 transition-colors cursor-pointer"
        aria-label="Sélectionner la devise"
      >
        {availableCurrencies.map((c) => (
          <option key={c} value={c} className="bg-neutral-900 text-white">
            {c}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
