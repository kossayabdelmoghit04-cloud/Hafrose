import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { statePersistence } from '../lib/statePersistence';
import { crossTabSync } from '../services/network/crossTabSync';

const CurrencyContext = createContext(null);
const CURRENCY_KEY = 'currency';

const RATES = {
  EUR: { rate: 1.0, symbol: '€' },
  MAD: { rate: 10.85, symbol: 'MAD' },
  USD: { rate: 1.09, symbol: '$' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() =>
    statePersistence.getItem(CURRENCY_KEY, 'EUR')
  );

  const setCurrency = useCallback((newCurr) => {
    setCurrencyState(newCurr);
    statePersistence.setItem(CURRENCY_KEY, newCurr);
    crossTabSync.broadcast('CURRENCY_CHANGED', { currency: newCurr });
  }, []);

  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((msg) => {
      if (msg.type === 'CURRENCY_CHANGED' && msg.payload?.currency) {
        setCurrencyState(msg.payload.currency);
      }
    });
    return unsubscribe;
  }, []);

  const formatPrice = useCallback(
    (amountInEur) => {
      if (amountInEur === null || amountInEur === undefined) return '';
      const numericAmount = typeof amountInEur === 'number' ? amountInEur : parseFloat(amountInEur);
      const currObj = RATES[currency] || RATES.EUR;
      const converted = (numericAmount * currObj.rate).toFixed(2);
      return currency === 'MAD' ? `${converted} MAD` : `${currObj.symbol}${converted}`;
    },
    [currency]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      formatPrice,
      availableCurrencies: Object.keys(RATES),
    }),
    [currency, setCurrency, formatPrice]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
