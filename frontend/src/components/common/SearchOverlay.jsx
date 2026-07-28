import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiArrowRight, FiClock, FiTrash2, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import productService from '../../services/productService';
import { getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';

/**
 * SearchOverlay — HAFROSE Design System Phase 2
 * Smart Search Premium full-screen avec recherche instantanée,
 * debounce 300ms, annulation de requêtes, historique localStorage,
 * produits populaires, navigation clavier (Flèches, Entrée, Échap),
 * surlignage du texte et skeleton loading.
 */

const QUICK_SUGGESTIONS = [
  'Sacs en cuir',
  'Maroquinerie',
  'Édition limitée',
  'Nouveautés',
  'Portefeuilles',
];

const RECENT_SEARCHES_KEY = 'hafrose_recent_searches';
const MAX_RECENT_SEARCHES = 5;

// Composant pour surligner les correspondances de texte
function HighlightText({ text, query }) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="search-overlay__highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const SearchOverlay = memo(function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  // Charger l'historique de recherche au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Charger les produits populaires quand l'overlay s'ouvre
  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      productService.getPopular(4)
        .then((res) => {
          if (isMounted && res?.data) {
            setPopularProducts(Array.isArray(res.data) ? res.data : (res.data.data || []));
          }
        })
        .catch(() => {
          // Fallback silencieux
        });
      return () => { isMounted = false; };
    }
  }, [isOpen]);

  // Sauvegarder un terme dans l'historique récent
  const saveRecentSearch = useCallback((term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Vider l'historique récent
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }, []);

  // Effectuer la recherche API instantanée avec debounce
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    debounceTimerRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      try {
        const response = await productService.getAll({ search: trimmedQuery });
        if (response?.data) {
          const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setResults(items);
        } else {
          setResults([]);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError('Erreur lors de la recherche.');
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Auto-focus input à l'ouverture
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Lock scroll du body
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Navigation au clavier : Flèches Haut/Bas, Entrée, Échap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selectedProduct = results[selectedIndex];
        if (selectedProduct) {
          saveRecentSearch(query);
          navigate(`/shop?search=${encodeURIComponent(selectedProduct.name)}`);
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, saveRecentSearch, navigate, onClose]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
    onClose();
  }, [query, saveRecentSearch, navigate, onClose]);

  const handleSelectProduct = useCallback((product) => {
    saveRecentSearch(product.name);
    navigate(`/shop?search=${encodeURIComponent(product.name)}`);
    onClose();
  }, [saveRecentSearch, navigate, onClose]);

  const handleSuggestion = useCallback((suggestion) => {
    setQuery(suggestion);
    saveRecentSearch(suggestion);
    navigate(`/shop?search=${encodeURIComponent(suggestion)}`);
    onClose();
  }, [saveRecentSearch, navigate, onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="search-overlay__backdrop"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="search-overlay__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Recherche instantanée"
          >
            <div className="search-overlay__inner">

              {/* Header */}
              <div className="search-overlay__header">
                <span className="search-overlay__eyebrow">
                  Maison HAFROSE — Recherche Instantanée
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="search-overlay__close"
                  aria-label="Fermer la recherche"
                >
                  <FiX size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Formulaire & Input */}
              <form
                onSubmit={handleSubmit}
                className="search-overlay__form"
                role="search"
                aria-label="Formulaire de recherche"
              >
                <div className="search-overlay__input-wrap">
                  <FiSearch
                    size={20}
                    className="search-overlay__input-icon"
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un sac, un portefeuille, une montre…"
                    className="search-overlay__input"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-label="Terme de recherche"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                      className="search-overlay__input-clear"
                      aria-label="Effacer le champ"
                    >
                      <FiX size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="search-overlay__submit"
                  aria-label="Lancer la recherche"
                >
                  <FiArrowRight size={18} aria-hidden="true" />
                </button>
              </form>

              {/* Contenu dynamique : Résultats en direct / Skeleton / Produits populaires / Historique */}
              <div className="search-overlay__results-wrap">

                {/* 1. SKELETON LOADING */}
                {loading && (
                  <div className="search-overlay__skeleton-grid">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="search-overlay__skeleton-card">
                        <div className="search-overlay__skeleton-img skeleton-shimmer" />
                        <div className="search-overlay__skeleton-text">
                          <div className="h-3 w-3/4 skeleton-shimmer mb-2" />
                          <div className="h-3 w-1/2 skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. RÉSULTATS DE RECHERCHE EN DIRECT */}
                {!loading && query.trim() !== '' && (
                  <div className="search-overlay__live-results">
                    <p className="search-overlay__section-title">
                      {results.length > 0
                        ? `${results.length} pièce${results.length > 1 ? 's' : ''} trouvée${results.length > 1 ? 's' : ''}`
                        : 'Aucun produit trouvé'}
                    </p>

                    {results.length > 0 ? (
                      <div className="search-overlay__live-grid" role="listbox">
                        {results.map((product, idx) => (
                          <div
                            key={product.id}
                            role="option"
                            aria-selected={idx === selectedIndex}
                            onClick={() => handleSelectProduct(product)}
                            className={`search-overlay__product-card${idx === selectedIndex ? ' search-overlay__product-card--selected' : ''}`}
                          >
                            <div className="search-overlay__product-img-wrap">
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="search-overlay__product-img"
                                loading="lazy"
                              />
                            </div>
                            <div className="search-overlay__product-info">
                              <h4 className="search-overlay__product-name">
                                <HighlightText text={product.name} query={query} />
                              </h4>
                              {product.material && (
                                <p className="search-overlay__product-material">
                                  {product.material}
                                </p>
                              )}
                              <p className="search-overlay__product-price">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="search-overlay__empty">
                        <FiShoppingBag size={36} className="opacity-30 mb-2" />
                        <p className="text-sm font-sans font-light text-warm-gray">
                          Aucun modèle ne correspond à « {query} ».
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. HISTORIQUE & SUGGESTIONS ET PRODUITS POPULAIRES (Quand pas de query) */}
                {!loading && query.trim() === '' && (
                  <div className="search-overlay__default-state">
                    {/* Historique récent */}
                    {recentSearches.length > 0 && (
                      <div className="search-overlay__recent">
                        <div className="flex items-center justify-between mb-3">
                          <span className="search-overlay__section-title flex items-center gap-1.5">
                            <FiClock size={12} /> Recherches récentes
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="search-overlay__clear-btn"
                          >
                            Effacer
                          </button>
                        </div>

                        <div className="search-overlay__tags">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleSuggestion(term)}
                              className="search-overlay__tag"
                            >
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Suggestions Tags */}
                    <div className="search-overlay__suggestions">
                      <p className="search-overlay__section-title">
                        Tendances & Collections
                      </p>
                      <div className="search-overlay__tags">
                        {QUICK_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestion(suggestion)}
                            className="search-overlay__tag"
                          >
                            <FiSearch size={12} className="opacity-40" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Produits populaires vedette */}
                    {popularProducts.length > 0 && (
                      <div className="search-overlay__popular mt-6">
                        <p className="search-overlay__section-title mb-3">
                          Sélection Populaire
                        </p>
                        <div className="search-overlay__popular-grid">
                          {popularProducts.slice(0, 4).map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => handleSelectProduct(prod)}
                              className="search-overlay__popular-card"
                            >
                              <div className="search-overlay__popular-img-wrap">
                                <img
                                  src={getProductImage(prod)}
                                  alt={prod.name}
                                  className="search-overlay__popular-img"
                                  loading="lazy"
                                />
                              </div>
                              <h5 className="search-overlay__popular-name">
                                {prod.name}
                              </h5>
                              <span className="search-overlay__popular-price">
                                {formatPrice(prod.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
});

export default SearchOverlay;
