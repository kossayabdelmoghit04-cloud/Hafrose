import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ProductCard } from '../../components/ui/ProductCard';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Radio } from '../../components/ui/Radio';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Pagination } from '../../components/ui/Pagination';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCartStore } from '../../stores/useCartStore';
import { Product } from '../../types/models';

const CATEGORIES = [
  { id: 'all', name: 'Toutes les catégories', count: 180 },
  { id: 'robes', name: 'Robes', count: 48 },
  { id: 'sacs', name: 'Sacs & Maroquinerie', count: 32 },
  { id: 'chaussures', name: 'Chaussures', count: 27 },
  { id: 'bijoux', name: 'Bijoux', count: 41 },
  { id: 'accessoires', name: 'Accessoires', count: 32 },
];

const SIZES = ['34', '36', '38', '40', '42', '44'];
const COLORS = [
  { name: 'Bordeaux', hex: '#8A1538' },
  { name: 'Rose Poudré', hex: '#F8D7DA' },
  { name: 'Crème', hex: '#FAF6F0' },
  { name: 'Noir', hex: '#18181B' },
  { name: 'Or Champagne', hex: '#D4AF37' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 101, name: 'Robe Fourreau Bordeaux Silk', slug: 'robe-fourreau-bordeaux-silk', sku: 'ROBE-101', description: 'Robe fourreau silk', price: 28900, category_id: 1, stock_quantity: 10, is_active: true, is_featured: true, created_at: '', updated_at: '' },
  { id: 102, name: 'Sac Mini Bucket Rose Poudré', slug: 'sac-mini-bucket-rose', sku: 'SAC-102', description: 'Sac mini bucket', price: 34500, sale_price: 27600, category_id: 2, stock_quantity: 8, is_active: true, is_featured: false, created_at: '', updated_at: '' },
  { id: 103, name: 'Escarpins Satin Noir Prestige', slug: 'escarpins-satin-noir', sku: 'ESC-103', description: 'Escarpins satin', price: 21000, category_id: 3, stock_quantity: 12, is_active: true, is_featured: false, created_at: '', updated_at: '' },
  { id: 104, name: 'Manchette Or & Zircon', slug: 'manchette-or-zircon', sku: 'BIJ-104', description: 'Manchette or zircon', price: 14500, category_id: 4, stock_quantity: 15, is_active: true, is_featured: true, created_at: '', updated_at: '' },
  { id: 105, name: 'Robe Plissée Soleil Ivoire', slug: 'robe-plissee-soleil-ivoire', sku: 'ROBE-105', description: 'Robe plissée ivoire', price: 26500, category_id: 1, stock_quantity: 6, is_active: true, is_featured: false, created_at: '', updated_at: '' },
  { id: 106, name: 'Cabas Cuir Grainé Bordeaux', slug: 'cabas-cuir-graine-bordeaux', sku: 'SAC-106', description: 'Cabas cuir bordeaux', price: 42000, sale_price: 33600, category_id: 2, stock_quantity: 4, is_active: true, is_featured: false, created_at: '', updated_at: '' },
  { id: 107, name: 'Mules Satin Champagne', slug: 'mules-satin-champagne', sku: 'ESC-107', description: 'Mules satin champagne', price: 19500, category_id: 3, stock_quantity: 9, is_active: true, is_featured: true, created_at: '', updated_at: '' },
  { id: 108, name: 'Sautoir Perles de Culture', slug: 'sautoir-perles-culture', sku: 'BIJ-108', description: 'Sautoir perles', price: 16800, category_id: 4, stock_quantity: 11, is_active: true, is_featured: false, created_at: '', updated_at: '' },
];

export const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const navigate = useNavigate();

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
  };

  const handleWishlistToggle = (product: Product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({ id: product.id, user_id: 1, product_id: product.id, created_at: '' });
    }
  };

  const FilterContent = (
    <div className="space-y-8">
      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-serif text-h5 text-neutral-900 border-b border-neutral-200 pb-2">Catégories</h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <Radio
              key={cat.id}
              name="category"
              label={`${cat.name} (${cat.count})`}
              checked={selectedCategory === cat.id}
              onChange={() => setSelectedCategory(cat.id)}
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
                Affichage de <strong>{MOCK_PRODUCTS.length}</strong> produits
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-neutral-500 hidden sm:inline">Trier par :</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {MOCK_PRODUCTS.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    salePrice={product.sale_price}
                    isWishlisted={isWishlisted(product.id)}
                    onWishlistToggle={() => handleWishlistToggle(product)}
                    onQuickAdd={() => addToCart(product, 1)}
                    onClick={(slug) => navigate(`/product/${slug}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
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
