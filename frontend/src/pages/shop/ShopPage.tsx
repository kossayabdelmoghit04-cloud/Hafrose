import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/ProductCard/ProductCardSkeleton';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
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

const SIZES = ['34', '36', '38', '40', '42', '44'];
const COLORS = [
  { name: 'Bordeaux', hex: '#8A1538' },
  { name: 'Rose Poudré', hex: '#F8D7DA' },
  { name: 'Crème', hex: '#FAF6F0' },
  { name: 'Noir', hex: '#18181B' },
  { name: 'Or Champagne', hex: '#D4AF37' },
];

export const ShopPage = () => {
  useSEO({
    title: 'Boutique — Collections HAFROSE | Mode Féminine Luxe',
    description: 'Explorez toutes les collections HAFROSE — robes, accessoires et tenues premium pour femme. Filtrez par catégorie, taille et couleur.',
    ogType: 'website',
    canonical: 'https://hafrose.com/shop',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'latest' | 'price_asc' | 'price_desc'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const navigate = useNavigate();

  // API Queries
  const { data: categoriesData } = useCategories();
  const { data: productsData, isLoading, isError, refetch } = useProducts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    sort: sortBy,
    page: currentPage,
    per_page: 12,
  });

  const categories = categoriesData?.data ?? [];
  const products: Product[] = Array.isArray(productsData?.data) ? productsData.data : (productsData?.data as any)?.data ?? [];
  const meta = productsData?.meta ?? (productsData?.data as any)?.meta;

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setSearchParams({});
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    if (slug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  const handleWishlistToggle = (product: Product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({ id: Date.now(), user_id: 0, product_id: product.id, product, created_at: new Date().toISOString() });
    }
  };

  const FilterContent = (
    <div className="space-y-8">
      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-serif text-h5 text-neutral-900 border-b border-neutral-200 pb-2">Catégories</h4>
        <div className="space-y-2">
          <Radio
            name="category"
            label="Toutes les catégories"
            checked={selectedCategory === 'all'}
            onChange={() => handleCategoryChange('all')}
          />
          {categories.map((cat) => (
            <Radio
              key={cat.id}
              name="category"
              label={cat.name}
              checked={selectedCategory === cat.slug}
              onChange={() => handleCategoryChange(cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h4 className="font-serif text-h5 text-neutral-900 border-b border-neutral-200 pb-2">Tailles</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`w-10 h-10 rounded-xs text-body-sm font-medium border transition-all duration-200 ${
                  isSelected
                    ? 'bg-burgundy-500 text-white border-burgundy-500 shadow-hafrose-xs'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-burgundy-500'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h4 className="font-serif text-h5 text-neutral-900 border-b border-neutral-200 pb-2">Couleurs</h4>
        <div className="space-y-2">
          {COLORS.map((color) => (
            <Checkbox
              key={color.name}
              label={
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-xs" style={{ backgroundColor: color.hex }} />
                  {color.name}
                </span>
              }
              checked={selectedColors.includes(color.name)}
              onChange={() => toggleColor(color.name)}
            />
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <h4 className="font-serif text-h5 text-neutral-900 border-b border-neutral-200 pb-2">Disponibilité</h4>
        <Checkbox
          label="En stock uniquement"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
        />
      </div>

      {/* Reset button */}
      <Button variant="ghost" size="sm" fullWidth onClick={resetFilters}>
        Réinitialiser les filtres
      </Button>
    </div>
  );

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-cream-200 border-b border-cream-400 py-10 md:py-16">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Boutique' },
            ]}
            className="mb-4"
          />
          <span className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500 block mb-2">
            Haute Couture & Prêt-à-Porter
          </span>
          <h1 className="font-serif text-h1 md:text-display-lg text-neutral-950 mb-4">
            Catalogue HAFROSE
          </h1>
          <p className="text-body-base text-neutral-600 max-w-xl leading-relaxed">
            Découvrez nos créations exclusives façonnées avec passion. Robes d'exception, sacs en cuir noble et bijoux délicats.
          </p>
        </Container>
      </div>

      <Section spacing="lg">
        <Container>
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={() => setIsMobileFilterOpen(true)}
              >
                Filtres
              </Button>
              <span className="text-body-sm text-neutral-500 font-medium">
                Affichage de <strong>{meta?.total ?? products.length}</strong> produits
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-neutral-500 hidden sm:inline">Trier par :</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'featured', label: 'En vedette' },
                  { value: 'latest', label: 'Nouveautés' },
                  { value: 'price_asc', label: 'Prix : Croissant' },
                  { value: 'price_desc', label: 'Prix : Décroissant' },
                ]}
                className="w-48 text-body-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 bg-white p-6 rounded-md border border-neutral-200/60 shadow-hafrose-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-h4 text-neutral-950 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-burgundy-500" /> Filtres
                  </h3>
                </div>
                {FilterContent}
              </div>
            </aside>

            {/* Product Grid */}
            <main className="lg:col-span-9">
              {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {isError && (
                <ErrorState
                  title="Impossible de charger le catalogue"
                  message="Une erreur est survenue lors de la connexion au serveur HAFROSE."
                  onRetry={() => refetch()}
                />
              )}

              {!isLoading && !isError && products.length === 0 && (
                <div className="text-center py-16 bg-white rounded-md p-8 border border-neutral-200/80 space-y-4">
                  <h3 className="font-serif text-h3 text-neutral-950">Aucun produit trouvé</h3>
                  <p className="text-body-base text-neutral-600">
                    Essayez de réinitialiser vos filtres pour découvrir toutes nos créations.
                  </p>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}

              {!isLoading && !isError && products.length > 0 && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        salePrice={product.sale_price}
                        imageUrl={getImageUrl(product.image ?? product.media?.[0]?.url ?? null)}
                        categoryName={product.category?.name}
                        badgeText={product.is_featured ? 'Best-seller' : undefined}
                        isWishlisted={isWishlisted(product.id)}
                        onWishlistToggle={() => handleWishlistToggle(product)}
                        onQuickAdd={() => addToCart(product, 1)}
                        onClick={(slug) => navigate(`/product/${slug}`)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {(meta?.last_page ?? 1) > 1 && (
                    <div className="mt-12">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={meta?.last_page ?? 1}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </Container>
      </Section>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        position="left"
        title="Filtres du Catalogue"
      >
        <div className="p-2">
          {FilterContent}
        </div>
      </Drawer>
    </div>
  );
};

export default ShopPage;
