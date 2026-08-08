import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { NumberInput } from '../../components/ui/NumberInput';
import { ProductCard } from '../../components/ui/ProductCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import { useProduct, useRelatedProducts } from '../../hooks/useProductHooks';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useSEO, useJsonLD } from '../../hooks/useSEO';
import { buildProductLD, buildBreadcrumbLD, SITE_URL } from '../../utils/seo';
import { LazyImage } from '../../components/ui/LazyImage';

const SIZES = ['34', '36', '38', '40', '42'];
const COLORS = [
  { name: 'Bordeaux Signature', hex: '#8A1538' },
  { name: 'Rose Poudré', hex: '#F8D7DA' },
  { name: 'Crème', hex: '#FAF6F0' },
];

export const ProductDetailPage = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('38');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  const { addItem: addToCart } = useCartStore();
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  // API Queries
  const { data: productResponse, isLoading, isError, refetch } = useProduct(slug);
  const { data: relatedResponse } = useRelatedProducts(slug, 4);

  const product = productResponse?.data;
  const relatedProducts = relatedResponse?.data ?? [];

  // ── SEO ──────────────────────────────────────────────────────────────────
  const mainImgUrl = product?.image ? getImageUrl(product.image) : product?.media?.[0]?.url ? getImageUrl(product.media[0].url) : undefined;

  useSEO({
    title: product ? `${product.name} | HAFROSE` : 'Produit | HAFROSE',
    description: product?.description
      ? product.description.slice(0, 160)
      : 'Découvrez ce produit exclusif HAFROSE — élégance et artisanat d\'exception.',
    ogType: 'product',
    ogImage: mainImgUrl,
    canonical: `${SITE_URL}/product/${slug}`,
  });

  const productLD = useMemo(() =>
    product
      ? buildProductLD({
          name: product.name,
          description: product.description,
          imageUrl: mainImgUrl ?? null,
          price: product.price,
          salePrice: product.sale_price,
          slug: product.slug,
          sku: product.sku ?? '',
          inStock: (product.stock ?? product.stock_quantity ?? 0) > 0,
        })
      : null,
  [product, mainImgUrl]);

  const breadcrumbLD = useMemo(() =>
    product
      ? buildBreadcrumbLD([
          { name: 'Accueil', url: '/' },
          { name: 'Boutique', url: '/shop' },
          { name: product.name, url: `/product/${product.slug}` },
        ])
      : null,
  [product]);

  useJsonLD(productLD);
  useJsonLD(breadcrumbLD);

  const isItemWishlisted = product ? isWishlisted(product.id) : false;

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isItemWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({ id: Date.now(), user_id: 0, product_id: product.id, product, created_at: new Date().toISOString() });
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const rawGalleryList = product?.galleries?.map((g) => g.image) ?? product?.media?.map((m) => m.url) ?? [];
  const galleryImages = rawGalleryList.length > 0
    ? rawGalleryList.map((img) => getImageUrl(img))
    : product?.image ? [getImageUrl(product.image)] : [getImageUrl('assets/images/hero-main.png')];

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* Header Breadcrumb */}
      <div className="bg-cream-200 border-b border-cream-400 py-6">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Boutique', href: '/shop' },
              { label: product?.name || 'Chargement...' },
            ]}
          />
        </Container>
      </div>

      <Section spacing="lg">
        <Container>
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-7 space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-md" />
              </div>
              <div className="lg:col-span-5 space-y-6">
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="80%" height={32} />
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="rectangular" height={100} />
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <ErrorState
              title="Produit introuvable"
              message="Nous n'avons pas pu charger cette création. Elle est peut-être temporairement indisponible."
              onRetry={() => refetch()}
            />
          )}

          {/* Main Product Layout */}
          {!isLoading && !isError && product && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Gallery Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-cream-200 shadow-hafrose-md">
                  <LazyImage
                    src={galleryImages[selectedImg]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-350"
                    wrapperClassName="w-full h-full"
                    priority
                  />
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImg(idx)}
                        className={`relative w-20 aspect-[3/4] rounded-xs overflow-hidden border-2 transition-all duration-200 ${
                          selectedImg === idx ? 'border-burgundy-500 shadow-hafrose-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <LazyImage src={img} alt="" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Column */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  {product.category?.name && (
                    <span className="text-caption font-sans font-semibold tracking-luxury uppercase text-burgundy-500 block mb-1">
                      {product.category.name}
                    </span>
                  )}
                  <h1 className="font-serif text-h2 md:text-h1 text-neutral-950 mb-3 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-3">
                    <span className="font-sans text-h3 font-semibold text-neutral-950">
                      {formatPrice(product.sale_price ?? product.price)}
                    </span>
                    {product.sale_price && (
                      <span className="font-sans text-body-base text-neutral-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                    <span className="text-caption font-medium text-success-600 bg-success-50 px-2 py-0.5 rounded-xs border border-success-100">
                      {(product.stock ?? product.stock_quantity ?? 0) > 0 ? `En Stock (${product.stock ?? product.stock_quantity ?? 0} pièces)` : 'Sur commande'}
                    </span>
                  </div>
                </div>

                <p className="text-body-base text-neutral-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Color Selector */}
                <div className="space-y-2">
                  <label className="block text-body-sm font-medium text-neutral-900 tracking-wider">
                    Couleur : <span className="text-neutral-500 font-normal">{selectedColor}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        aria-label={`Couleur ${c.name}`}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === c.name ? 'border-burgundy-500 ring-2 ring-burgundy-500/30' : 'border-neutral-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-body-sm font-medium text-neutral-900 tracking-wider">
                      Taille EU
                    </label>
                    <button type="button" className="text-caption text-burgundy-500 underline font-medium">
                      Guide des Tailles
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`w-11 h-11 rounded-xs text-body-sm font-semibold border transition-all ${
                          selectedSize === s
                            ? 'bg-burgundy-500 text-white border-burgundy-500 shadow-hafrose-xs'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:border-burgundy-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <NumberInput
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={product.stock_quantity || 10}
                    />
                    <div className="flex-1">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon={<ShoppingBag className="w-5 h-5" />}
                        onClick={() => addToCart(product, quantity, selectedSize, selectedColor)}
                      >
                        Ajouter au Panier
                      </Button>
                    </div>
                    <IconButton
                      variant="outline"
                      size="lg"
                      aria-label={isItemWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      onClick={handleWishlistToggle}
                      icon={
                        <Heart
                          className={isItemWishlisted ? 'w-5 h-5 text-burgundy-500 fill-burgundy-500' : 'w-5 h-5 text-burgundy-500'}
                        />
                      }
                    />
                  </div>
                </div>

                {/* Reassurance Pills */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200 text-center">
                  <div className="flex flex-col items-center gap-1 p-2">
                    <Truck className="w-5 h-5 text-burgundy-500" />
                    <span className="text-caption text-neutral-600 font-medium">Livraison 24h-48h</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2">
                    <RotateCcw className="w-5 h-5 text-gold-700" />
                    <span className="text-caption text-neutral-600 font-medium">Retours Gratuits</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2">
                    <ShieldCheck className="w-5 h-5 text-burgundy-500" />
                    <span className="text-caption text-neutral-600 font-medium">Paiement Sécurisé</span>
                  </div>
                </div>

                {/* Accordions */}
                <div className="border-t border-neutral-200 pt-4 space-y-2">
                  {[
                    { id: 'desc', title: 'Description & Coupe', content: product.description },
                    { id: 'comp', title: 'Composition & Entretien', content: '100% Soie naturelle, Doublure en viscose douce. Nettoyage à sec uniquement.' },
                    { id: 'deliv', title: 'Livraison & Retours', content: 'Livraison express offerte sous 24h-48h. Retours gratuits sous 14 jours.' },
                  ].map((acc) => (
                    <div key={acc.id} className="border-b border-neutral-200 pb-2">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(acc.id)}
                        className="w-full flex items-center justify-between py-3 text-body-base font-serif text-neutral-900 font-medium text-left"
                      >
                        {acc.title}
                        <ChevronDown
                          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                            openAccordion === acc.id ? 'rotate-180 text-burgundy-500' : ''
                          }`}
                        />
                      </button>
                      {openAccordion === acc.id && (
                        <p className="text-body-sm text-neutral-600 pb-3 leading-relaxed animate-fade-in">
                          {acc.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 pt-12 border-t border-neutral-200">
              <h2 className="font-serif text-h2 text-neutral-950 mb-8 text-center">
                Vous Aimerez Aussi
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    salePrice={p.sale_price}
                    imageUrl={getImageUrl(p.image ?? p.media?.[0]?.url ?? null)}
                    categoryName={p.category?.name}
                    onClick={(s) => navigate(`/product/${s}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default ProductDetailPage;
