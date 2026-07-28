import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const RATES = {
  EUR: { rate: 1.0, symbol: '€' },
  MAD: { rate: 10.85, symbol: 'MAD' },
  USD: { rate: 1.09, symbol: '$' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('hafrose_currency') || 'EUR');

  useEffect(() => {
    localStorage.setItem('hafrose_currency', currency);
  }, [currency]);

  const formatPrice = (amountInEur) => {
    if (amountInEur === null || amountInEur === undefined) return '';
    const numericAmount = typeof amountInEur === 'number' ? amountInEur : parseFloat(amountInEur);
    const currObj = RATES[currency] || RATES.EUR;
    const converted = (numericAmount * currObj.rate).toFixed(2);

    return currency === 'MAD' ? `${converted} MAD` : `${currObj.symbol}${converted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, availableCurrencies: Object.keys(RATES) }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
