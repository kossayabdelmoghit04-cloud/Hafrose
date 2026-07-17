import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiShoppingBag } from 'react-icons/fi';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import ProductCard from '../../components/cards/ProductCard';
import Loader from '../../components/ui/Loader';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import Breadcrumb from '../../components/ui/Breadcrumb';
import EmptyState from '../../components/ui/EmptyState';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const COLORS = [
  { name: 'Noir Ébène', hex: '#111111' },
  { name: 'Cognac', hex: '#9E5A2A' },
  { name: 'Rouge Rubis', hex: '#9C1A2E' },
  { name: 'Vert Émeraude', hex: '#046307' },
  { name: 'Bleu Nuit', hex: '#0F1E36' },
  { name: 'Or Miroir', hex: '#D4AF37' },
  { name: 'Rose Poudré', hex: '#F4C2C2' },
  { name: 'Argent Satiné', hex: '#C0C0C0' },
  { name: 'Écaille Blonde', hex: '#E5A65D' }
];

const MATERIALS = [
  'Cuir de veau pleine fleur', 'Cuir de veau grainé', 'Cuir de veau double face',
  'Cuir d\'autruche véritable', 'Cuir de crocodile véritable', 'Cuir saffiano',
  'Plaqué or jaune 24 carats', 'Or jaune 18K & Perles de culture', 'Or rose 18K & Verre Saphir',
  'Or blanc 18K & Diamant de synthèse', 'Platine massif', 'Acier 316L & Cuir alligator',
  'Acétate de cellulose italien', 'Satin de soie & Cristal'
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Advanced filters state toggle
  const [showFilters, setShowFilters] = useState(false);

  // Active query states
  const searchVal = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const activeColor = searchParams.get('color') || '';
  const activeMaterial = searchParams.get('material') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useDocumentTitle('La Boutique', 'Découvrez la collection exclusive d\'accessoires de mode, maroquinerie, bijoux et montres de la Maison Hafrose.');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      if (res?.success) setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        category: activeCategory || undefined,
        search: searchVal || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        color: activeColor || undefined,
        material: activeMaterial || undefined
      };
      const res = await productService.getAll(params);
      if (res?.success) {
        setProducts(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger la collection.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, activeCategory, searchVal, minPrice, maxPrice, activeColor, activeMaterial]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', '1'); // Reset pagination on filter change
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const resetAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'La Boutique', path: '/shop' }]} />
      
      {/* Editorial Header */}
      <div className="text-center space-y-4 mb-12">
        <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
          Collections Exclusive
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-luxury-charcoal font-light">La Collection</h1>
        <div className="w-12 h-[1px] bg-luxury-gold mx-auto my-6" />
      </div>

      {/* Main Filter & Action Bar */}
      <div className="border-t border-b border-luxury-charcoal/10 py-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Input
            value={searchVal}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Rechercher une pièce d'exception..."
            className="pr-10 !py-2.5"
          />
          <FiSearch className="absolute right-3 top-3 text-luxury-gray" size={16} />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-4 py-2 font-sans text-[10px] tracking-widest uppercase transition-all duration-300 rounded-none border ${
              activeCategory === ''
                ? 'bg-luxury-charcoal text-luxury-cream border-luxury-charcoal font-medium'
                : 'text-luxury-charcoal hover:border-luxury-gold/40 border-luxury-charcoal/10'
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 font-sans text-[10px] tracking-widest uppercase whitespace-nowrap transition-all duration-300 rounded-none border ${
                activeCategory === cat.slug
                  ? 'bg-luxury-charcoal text-luxury-cream border-luxury-charcoal font-medium'
                  : 'text-luxury-charcoal hover:border-luxury-gold/40 border-luxury-charcoal/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Advanced & Sort triggers */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border font-sans text-[10px] tracking-widest uppercase transition-all duration-300 ${
              showFilters || minPrice || maxPrice || activeColor || activeMaterial
                ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/5'
                : 'border-luxury-charcoal/10 text-luxury-charcoal hover:border-luxury-gold/40'
            }`}
          >
            <FiSliders size={14} />
            <span>Filtres</span>
          </button>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              const next = new URLSearchParams(searchParams);
              next.set('sort_by', by);
              next.set('sort_order', order);
              setSearchParams(next);
            }}
            className="px-3 py-2 border border-luxury-charcoal/10 bg-white font-sans text-[10px] tracking-widest uppercase outline-none text-luxury-charcoal focus:border-luxury-gold rounded-none"
          >
            <option value="created_at-desc">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden bg-luxury-cream border border-luxury-charcoal/5 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Price Filter */}
            <div className="space-y-3 text-left">
              <h4 className="font-serif text-xs uppercase tracking-wider text-luxury-charcoal">Budget</h4>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  placeholder="Min €"
                  className="!py-2"
                />
                <span className="text-luxury-gray text-xs">—</span>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  placeholder="Max €"
                  className="!py-2"
                />
              </div>
            </div>

            {/* Colors Filter */}
            <div className="space-y-3 text-left">
              <h4 className="font-serif text-xs uppercase tracking-wider text-luxury-charcoal">Nuance</h4>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((col) => {
                  const isActive = activeColor === col.name;
                  return (
                    <button
                      key={col.name}
                      onClick={() => updateParam('color', isActive ? '' : col.name)}
                      className={`w-6 h-6 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        isActive ? 'border-luxury-gold ring-1 ring-luxury-gold/50 scale-110' : 'border-luxury-charcoal/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Material Filter */}
            <div className="space-y-3 text-left">
              <h4 className="font-serif text-xs uppercase tracking-wider text-luxury-charcoal">Matière noble</h4>
              <select
                value={activeMaterial}
                onChange={(e) => updateParam('material', e.target.value)}
                className="w-full px-3 py-2.5 border border-luxury-charcoal/10 bg-white font-sans text-xs outline-none text-luxury-charcoal focus:border-luxury-gold rounded-none"
              >
                <option value="">Sélectionner une matière</option>
                {MATERIALS.map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>
            
            {/* Filter tags reset */}
            <div className="md:col-span-3 flex items-center justify-between border-t border-luxury-charcoal/5 pt-4 mt-2">
              <span className="text-[10px] text-luxury-gray font-sans font-light">
                {meta.total} articles correspondants
              </span>
              <button
                onClick={resetAllFilters}
                className="text-[10px] uppercase tracking-widest text-luxury-gold hover:text-luxury-charcoal font-sans transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Presentation */}
      {isLoading ? (
        <Skeleton.ProductGrid limit={8} />
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-sm font-sans text-red-500 font-light">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<FiShoppingBag />}
          title="Aucune création disponible"
          description="Aucun de nos modèles ne correspond à vos filtres actuels. Nous vous invitons à réinitialiser vos critères de recherche."
          action={
            <button
              onClick={resetAllFilters}
              className="px-6 py-3 bg-luxury-charcoal text-luxury-cream font-sans text-[10px] tracking-widest uppercase hover:bg-luxury-gold transition-colors duration-300 cursor-pointer"
            >
              Voir toute la collection
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={(page) => {
              const next = new URLSearchParams(searchParams);
              next.set('page', page.toString());
              setSearchParams(next);
            }}
          />
        </>
      )}
    </div>
  );
}
