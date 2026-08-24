import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, X, Filter } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/ProductCard/ProductCardSkeleton';
import { Select } from '../../components/ui/Select';
import { Radio } from '../../components/ui/Radio';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Pagination } from '../../components/ui/Pagination';
import { ErrorState } from '../../components/ui/ErrorState';
import { useProducts, useCategories } from '../../hooks/useProductHooks';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCartStore } from '../../stores/useCartStore';
import { getImageUrl } from '../../utils/formatters';
import { Product } from '../../types/models';
import { useSEO } from '../../hooks/useSEO';
import { cn } from '../../utils/cn';

// ── Types internes ─────────────────────────────────────────────────────────
type SortOption = 'featured' | 'latest' | 'price_asc' | 'price_desc';

interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

// ── Dropdown générique réutilisable pour la Toolbar ────────────────────────
interface FilterDropdownProps {
  label: string;
  isActive?: boolean;
  children: React.ReactNode;
}

const FilterDropdown = ({ label, isActive, children }: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs border text-body-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500',
          isActive
            ? 'border-burgundy-500 bg-burgundy-50 text-burgundy-700 font-semibold'
            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
        )}
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform duration-200 text-neutral-400', open && 'rotate-180 text-burgundy-500')}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 min-w-[220px] bg-white border border-neutral-200/90 rounded-sm shadow-hafrose-md p-3 space-y-2 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

// ── Page principale ────────────────────────────────────────────────────────
export const ShopPage = () => {
  useSEO({
    title: 'Boutique — Collections HAFROSE | Mode Féminine Luxe',
    description: 'Explorez toutes les créations HAFROSE — maroquinerie, bijoux, montres et accessoires de luxe.',
    ogType: 'website',
    canonical: 'https://hafrose.com/shop',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = (searchParams.get('sort') as SortOption) || 'featured';
  const saleParam = searchParams.get('on_sale') === 'true' || searchParams.get('sale') === 'true';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(saleParam);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Synchronisation URL → state
  useEffect(() => {
    const currentSort = searchParams.get('sort') as SortOption;
    if (currentSort && currentSort !== sortBy) setSortBy(currentSort);

    const currentCat = searchParams.get('category') || 'all';
    if (currentCat !== selectedCategory) setSelectedCategory(currentCat);

    const currentSale = searchParams.get('on_sale') === 'true' || searchParams.get('sale') === 'true';
    if (currentSale !== onSaleOnly) setOnSaleOnly(currentSale);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- URL-to-state sync: deps intentionally omit state vars to avoid infinite update loop
  }, [searchParams]);

  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const navigate = useNavigate();

  // ── Queries API (Source unique de vérité) ────────────────────────────────
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  const { data: productsData, isLoading, isError, refetch } = useProducts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    sort: sortBy,
    on_sale: onSaleOnly ? true : undefined,
    price_min: priceMin ? Number(priceMin) : undefined,
    price_max: priceMax ? Number(priceMax) : undefined,
    page: currentPage,
    per_page: 12,
  });

  const products: Product[] = Array.isArray(productsData?.data)
    ? productsData.data
    : (productsData?.data as any)?.data ?? [];
  const meta = productsData?.meta ?? (productsData?.data as any)?.meta;
  const totalCount = meta?.total ?? products.length;

  // ── Actions de filtrage ──────────────────────────────────────────────────
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    const p: Record<string, string> = {};
    if (slug !== 'all') p.category = slug;
    if (sortBy !== 'featured') p.sort = sortBy;
    if (onSaleOnly) p.on_sale = 'true';
    setSearchParams(p);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    const p: Record<string, string> = {};
    if (selectedCategory !== 'all') p.category = selectedCategory;
    if (value !== 'featured') p.sort = value;
    if (onSaleOnly) p.on_sale = 'true';
    setSearchParams(p);
  };

  const handleSaleToggle = (checked: boolean) => {
    setOnSaleOnly(checked);
    setCurrentPage(1);
    const p: Record<string, string> = {};
    if (selectedCategory !== 'all') p.category = selectedCategory;
    if (sortBy !== 'featured') p.sort = sortBy;
    if (checked) p.on_sale = 'true';
    setSearchParams(p);
  };

  const handleStockToggle = (inStock: boolean) => {
    setInStockOnly(inStock);
    setCurrentPage(1);
  };

  const handlePriceApply = () => setCurrentPage(1);

  const resetFilters = () => {
    setSelectedCategory('all');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setPriceMin('');
    setPriceMax('');
    setCurrentPage(1);
    setSearchParams({});
  };

  // ── Filtres actifs (badges) ──────────────────────────────────────────────
  const activeFilters: ActiveFilter[] = [];
  if (selectedCategory !== 'all') {
    const catName = categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory;
    activeFilters.push({ key: 'category', label: `Catégorie : ${catName}`, onRemove: () => handleCategoryChange('all') });
  }
  if (priceMin || priceMax) {
    const label = `Prix : ${priceMin || '0'} – ${priceMax || '∞'} MAD`;
    activeFilters.push({
      key: 'price',
      label,
      onRemove: () => { setPriceMin(''); setPriceMax(''); setCurrentPage(1); },
    });
  }
  if (onSaleOnly) {
    activeFilters.push({ key: 'sale', label: 'En soldes', onRemove: () => handleSaleToggle(false) });
  }
  if (inStockOnly) {
    activeFilters.push({ key: 'stock', label: 'En stock', onRemove: () => setInStockOnly(false) });
  }

  // ── Wishlist ─────────────────────────────────────────────────────────────
  const handleWishlistToggle = (product: Product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({ id: Date.now(), user_id: 0, product_id: product.id, product, created_at: new Date().toISOString() });
    }
  };

  return (
    <div className="bg-cream-100 min-h-screen text-neutral-900">

      {/* ── 1. Barre de Contexte Boutique Compacte ──────────────────────── */}
      <div className="bg-white border-b border-neutral-200/70">
        <Container>
          <div className="py-4 md:py-5 flex items-center justify-between gap-4">
            <Breadcrumb
              items={[
                { label: 'Accueil', href: '/' },
                { label: 'Boutique' },
              ]}
            />
            <div className="text-body-sm text-neutral-500 font-medium tracking-wide">
              {isLoading ? (
                <span className="inline-block h-4 w-20 bg-neutral-200/60 rounded-xs animate-pulse" />
              ) : (
                <span>
                  <strong className="text-neutral-900 font-semibold">{totalCount}</strong> création{totalCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* ── 2. Toolbar de Filtres Horizontale Premium ────────────────────── */}
      <div className="bg-white border-b border-neutral-200/80 shadow-hafrose-xs sticky top-16 md:top-20 z-20">
        <Container>
          {/* Desktop Toolbar */}
          <div className="hidden md:flex items-center justify-between gap-4 py-2.5">
            {/* Left: Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">

              {/* Catégorie */}
              <FilterDropdown
                label={selectedCategory !== 'all' ? (categories.find(c => c.slug === selectedCategory)?.name || 'Catégorie') : 'Catégorie'}
                isActive={selectedCategory !== 'all'}
              >
                <div className="space-y-1 py-1">
                  <Radio
                    name="cat-desktop"
                    label="Toutes les créations"
                    checked={selectedCategory === 'all'}
                    onChange={() => handleCategoryChange('all')}
                  />
                  {categories.map((cat) => (
                    <Radio
                      key={cat.id}
                      name="cat-desktop"
                      label={cat.name}
                      checked={selectedCategory === cat.slug}
                      onChange={() => handleCategoryChange(cat.slug)}
                    />
                  ))}
                </div>
              </FilterDropdown>

              {/* Prix */}
              <FilterDropdown
                label={priceMin || priceMax ? `Prix (${priceMin || '0'}-${priceMax || '∞'})` : 'Prix'}
                isActive={Boolean(priceMin || priceMax)}
              >
                <div className="space-y-3 w-52 p-1">
                  <span className="text-caption text-neutral-500 font-semibold uppercase tracking-wider block">
                    Intervalle de Prix (MAD)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full border border-neutral-300 rounded-xs px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-burgundy-500"
                    />
                    <span className="text-neutral-400 text-caption font-bold">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full border border-neutral-300 rounded-xs px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-burgundy-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePriceApply}
                    className="w-full py-1.5 text-body-sm font-medium bg-burgundy-500 text-white rounded-xs hover:bg-burgundy-600 transition-colors shadow-hafrose-xs"
                  >
                    Appliquer
                  </button>
                </div>
              </FilterDropdown>

              {/* Disponibilité */}
              <FilterDropdown
                label={inStockOnly ? 'En stock' : 'Disponibilité'}
                isActive={inStockOnly}
              >
                <div className="space-y-1 py-1">
                  <Radio
                    name="stock-desktop"
                    label="Tous les produits"
                    checked={!inStockOnly}
                    onChange={() => handleStockToggle(false)}
                  />
                  <Radio
                    name="stock-desktop"
                    label="En stock uniquement"
                    checked={inStockOnly}
                    onChange={() => handleStockToggle(true)}
                  />
                </div>
              </FilterDropdown>

              {/* En Soldes Toggle Button */}
              <button
                type="button"
                onClick={() => handleSaleToggle(!onSaleOnly)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs border text-body-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500',
                  onSaleOnly
                    ? 'border-burgundy-500 bg-burgundy-50 text-burgundy-700 font-semibold shadow-hafrose-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <span>En soldes</span>
                {onSaleOnly && <span className="w-1.5 h-1.5 rounded-full bg-burgundy-500" />}
              </button>
            </div>

            {/* Right: Tri */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-body-sm text-neutral-500 whitespace-nowrap">Trier par :</span>
              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                options={[
                  { value: 'featured', label: 'En vedette' },
                  { value: 'latest', label: 'Nouveautés' },
                  { value: 'price_asc', label: 'Prix : Croissant' },
                  { value: 'price_desc', label: 'Prix : Décroissant' },
                ]}
                className="text-body-sm min-w-[170px]"
              />
            </div>
          </div>

          {/* Mobile Toolbar */}
          <div className="flex md:hidden items-center justify-between gap-3 py-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setIsMobileFilterOpen(true)}
              className="text-body-sm font-medium"
            >
              Filtres{activeFilters.length > 0 && (
                <span className="ml-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-burgundy-500 text-white text-[10px] font-bold">
                  {activeFilters.length}
                </span>
              )}
            </Button>
            <div className="flex items-center gap-1.5">
              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                options={[
                  { value: 'featured', label: 'En vedette' },
                  { value: 'latest', label: 'Nouveautés' },
                  { value: 'price_asc', label: 'Prix ↑' },
                  { value: 'price_desc', label: 'Prix ↓' },
                ]}
                className="text-body-sm min-w-[140px]"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* ── 3. Filtres Actifs (uniquement si actifs) ──────────────────────── */}
      {activeFilters.length > 0 && (
        <div className="bg-neutral-50/90 border-b border-neutral-200/60 py-2.5">
          <Container>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 mr-1">
                Filtres actifs :
              </span>
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-white border border-neutral-200 text-neutral-800 text-caption font-medium shadow-hafrose-xs"
                >
                  {f.label}
                  <button
                    type="button"
                    onClick={f.onRemove}
                    aria-label={`Retirer le filtre : ${f.label}`}
                    className="text-neutral-400 hover:text-burgundy-600 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto text-caption font-medium text-burgundy-600 hover:text-burgundy-700 underline underline-offset-2 transition-colors py-1 px-2"
              >
                Tout effacer
              </button>
            </div>
          </Container>
        </div>
      )}

      {/* ── 4. Grille Produits — Espacement Maîtrisé ──────────────────────── */}
      <main className="py-6 md:py-8">
        <Container>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="py-12">
              <ErrorState
                title="Impossible de charger le catalogue"
                message="Une erreur est survenue lors de la connexion au serveur HAFROSE."
                onRetry={() => refetch()}
              />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="text-center py-16 px-6 max-w-lg mx-auto bg-white rounded-md border border-neutral-200/80 shadow-hafrose-xs space-y-4 my-8">
              <div className="w-14 h-14 rounded-full bg-cream-200 text-neutral-400 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-h3 text-neutral-900">Aucun produit trouvé</h3>
              <p className="text-body-sm text-neutral-500 leading-relaxed">
                Aucune création ne correspond à vos critères de sélection actuels. Essayez de modifier vos filtres ou de réinitialiser votre recherche.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          )}

          {/* Product Grid — 4 Columns on Desktop, 3 on Tablet, 2 on Mobile */}
          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    salePrice={product.sale_price}
                    imageUrl={getImageUrl(product.image_url ?? product.image ?? product.media?.[0]?.url ?? null)}
                    imageCardUrl={product.image_card_url ? getImageUrl(product.image_card_url) : undefined}
                    categoryName={product.category?.name}
                    badgeText={
                      product.is_featured
                        ? 'Best-seller'
                        : (product.sale_price && Number(product.sale_price) < Number(product.price))
                          ? (product.discount_percentage ? `-${product.discount_percentage}%` : 'Soldes')
                          : undefined
                    }
                    isWishlisted={isWishlisted(product.id)}
                    onWishlistToggle={() => handleWishlistToggle(product)}
                    onQuickAdd={() => addToCart(product, 1)}
                    onClick={(slug) => navigate(`/product/${slug}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {(meta?.last_page ?? 1) > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={meta?.last_page ?? 1}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      </main>

      {/* ── 5. Drawer Filtres Mobile ──────────────────────────────────────── */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        position="left"
        title="Filtres"
      >
        <div className="p-5 space-y-6">
          {/* Catégories */}
          <div className="space-y-2.5">
            <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 block">
              Catégorie
            </span>
            <Radio
              name="cat-mobile"
              label="Toutes les créations"
              checked={selectedCategory === 'all'}
              onChange={() => { handleCategoryChange('all'); setIsMobileFilterOpen(false); }}
            />
            {categories.map((cat) => (
              <Radio
                key={cat.id}
                name="cat-mobile"
                label={cat.name}
                checked={selectedCategory === cat.slug}
                onChange={() => { handleCategoryChange(cat.slug); setIsMobileFilterOpen(false); }}
              />
            ))}
          </div>

          {/* Prix */}
          <div className="space-y-2.5 pt-4 border-t border-neutral-100">
            <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 block">
              Prix (MAD)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full border border-neutral-300 rounded-xs px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-burgundy-500"
              />
              <span className="text-neutral-400 font-bold">–</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full border border-neutral-300 rounded-xs px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-burgundy-500"
              />
            </div>
            <button
              type="button"
              onClick={() => { handlePriceApply(); setIsMobileFilterOpen(false); }}
              className="w-full py-2 text-body-sm font-medium bg-burgundy-500 text-white rounded-xs hover:bg-burgundy-600 transition-colors shadow-hafrose-xs"
            >
              Appliquer le prix
            </button>
          </div>

          {/* Disponibilité */}
          <div className="space-y-2.5 pt-4 border-t border-neutral-100">
            <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 block">
              Disponibilité &amp; Promotions
            </span>
            <Radio
              name="stock-mobile"
              label="Tous les produits"
              checked={!inStockOnly}
              onChange={() => handleStockToggle(false)}
            />
            <Radio
              name="stock-mobile"
              label="En stock uniquement"
              checked={inStockOnly}
              onChange={() => handleStockToggle(true)}
            />
            <Radio
              name="sale-mobile"
              label="Articles en soldes uniquement"
              checked={onSaleOnly}
              onChange={() => handleSaleToggle(true)}
            />
          </div>

          {/* Actions Drawer */}
          <div className="pt-6 border-t border-neutral-200 space-y-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => { resetFilters(); setIsMobileFilterOpen(false); }}
            >
              Réinitialiser tous les filtres
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Voir les résultats ({totalCount})
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default ShopPage;
