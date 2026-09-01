import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useProducts, useCategories } from '../../hooks/useProductHooks';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCartStore } from '../../stores/useCartStore';
import { Product } from '../../types/models';
import { useSEO } from '../../hooks/useSEO';
import {
  SortOption,
  ActiveFilter,
  ShopFilterBar,
  ShopActiveFilters,
  ShopProductGrid,
  ShopMobileFilterDrawer,
} from '../../components/shop';

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

  const products: Product[] = productsData?.data ?? [];
  const meta = productsData?.meta;
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
    activeFilters.push({
      key: 'category',
      label: `Catégorie : ${catName}`,
      onRemove: () => handleCategoryChange('all'),
    });
  }
  if (priceMin || priceMax) {
    const label = `Prix : ${priceMin || '0'} – ${priceMax || '∞'} MAD`;
    activeFilters.push({
      key: 'price',
      label,
      onRemove: () => {
        setPriceMin('');
        setPriceMax('');
        setCurrentPage(1);
      },
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
      addToWishlist({
        id: Date.now(),
        user_id: 0,
        product_id: product.id,
        product,
        created_at: new Date().toISOString(),
      });
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
                  <strong className="text-neutral-900 font-semibold">{totalCount}</strong> création
                  {totalCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* ── 2. Toolbar de Filtres Horizontale Premium ────────────────────── */}
      <ShopFilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        priceMin={priceMin}
        onPriceMinChange={setPriceMin}
        priceMax={priceMax}
        onPriceMaxChange={setPriceMax}
        onPriceApply={handlePriceApply}
        inStockOnly={inStockOnly}
        onStockToggle={handleStockToggle}
        onSaleOnly={onSaleOnly}
        onSaleToggle={handleSaleToggle}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        activeFiltersCount={activeFilters.length}
        onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
      />

      {/* ── 3. Filtres Actifs (uniquement si actifs) ──────────────────────── */}
      <ShopActiveFilters filters={activeFilters} onReset={resetFilters} />

      {/* ── 4. Grille Produits ────────────────────────────────────────────── */}
      <ShopProductGrid
        products={products}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onResetFilters={resetFilters}
        isWishlisted={isWishlisted}
        onWishlistToggle={handleWishlistToggle}
        onQuickAdd={(p) => addToCart(p, 1)}
        onProductClick={(slug) => navigate(`/product/${slug}`)}
        meta={meta}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* ── 5. Drawer Filtres Mobile ──────────────────────────────────────── */}
      <ShopMobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        priceMin={priceMin}
        onPriceMinChange={setPriceMin}
        priceMax={priceMax}
        onPriceMaxChange={setPriceMax}
        onPriceApply={handlePriceApply}
        inStockOnly={inStockOnly}
        onStockToggle={handleStockToggle}
        onSaleOnly={onSaleOnly}
        onSaleToggle={handleSaleToggle}
        onResetFilters={resetFilters}
        totalCount={totalCount}
      />
    </div>
  );
};

export default ShopPage;
