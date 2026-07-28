import React, { useState } from 'react';

const GiftCardInput = ({ onApplyGiftCard }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      const res = await fetch(`/api/gift-cards/check?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success) {
        setStatus({ success: true, message: `Carte valide ! Solde: ${data.data.balance} ${data.data.currency}` });
        if (onApplyGiftCard) onApplyGiftCard(data.data);
      } else {
        setStatus({ success: false, message: data.message || 'Carte cadeau introuvable.' });
      }
    } catch {
      setStatus({ success: false, message: 'Erreur lors de la vérification.' });
    }
  };

  return (
    <div className="p-4 bg-amber-900/5 dark:bg-neutral-900/60 rounded-xl border border-amber-900/20 my-4">
      <h4 className="font-serif text-sm text-neutral-900 dark:text-amber-100 mb-2">Carte Cadeau HAFROSE</h4>
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: HAFROSE-X9A2B4"
          className="flex-1 uppercase bg-white dark:bg-neutral-800 border border-amber-900/30 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 rounded focus:outline-none focus:border-amber-600"
        />
        <button type="submit" className="bg-amber-700 hover:bg-amber-600 text-white text-xs px-4 py-2 rounded font-semibold transition-colors">
          Appliquer
        </button>
      </form>
      {status && (
        <p className={`text-xs mt-2 ${status.success ? 'text-emerald-500' : 'text-rose-500'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
};

export default GiftCardInput;
