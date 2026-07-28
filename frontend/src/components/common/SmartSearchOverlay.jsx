import React, { useState, useEffect } from 'react';
import VoiceSearchWidget from './VoiceSearchWidget';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';

const SmartSearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (query.trim().length >= 2) {
      setLoading(true);
      fetch(`/api/products/autocomplete?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSuggestions(data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-amber-900/20 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-amber-900/20 pb-4 mb-4">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, style, matière (ex: Caftan soie)..."
            className="w-full bg-transparent text-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
            autoFocus
          />
          <VoiceSearchWidget onSpeechResult={(transcript) => setQuery(transcript)} />
        </div>

        {loading && <div className="text-center py-6 text-xs text-amber-600">Recherche IA en cours...</div>}

        {!loading && suggestions.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.slug}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-900/10 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={item.image || '/assets/images/placeholder.jpg'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                  <div>
                    <h4 className="font-serif text-sm text-neutral-900 dark:text-amber-100">{item.name}</h4>
                    <span className="text-xs text-amber-600 font-semibold">{formatPrice(item.price)}</span>
                  </div>
                </div>
                <span className="text-xs text-neutral-400">Voir →</span>
              </Link>
            ))}
          </div>
        )}

        {!loading && query.trim() !== '' && suggestions.length === 0 && (
          <div className="text-center py-8 text-sm text-neutral-500">
            Aucun résultat direct. Essayez avec un mot clé comme "robe", "parfum" ou "soie".
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearchOverlay;
