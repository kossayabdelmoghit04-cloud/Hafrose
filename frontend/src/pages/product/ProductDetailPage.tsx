import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { NumberInput } from '../../components/ui/NumberInput';
import { ProductCard } from '../../components/ui/ProductCard';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import heroImg from '../../assets/images/hero-main.png';
import dressesImg from '../../assets/images/category-dresses.jpg';
import newCollectionImg from '../../assets/images/new-collection.jpg';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { Product } from '../../types/models';

const MOCK_IMAGES = [heroImg, dressesImg, newCollectionImg];
const SIZES = ['34', '36', '38', '40', '42'];
const COLORS = [
  { name: 'Bordeaux Signature', hex: '#8A1538' },
  { name: 'Rose Poudré', hex: '#F8D7DA' },
  { name: 'Crème', hex: '#FAF6F0' },
];

export const ProductDetailPage = () => {
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('38');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  const { addItem: addToCart } = useCartStore();
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const mockProduct: Product = {
    id: 101,
    name: 'Robe Fourreau Bordeaux Silk',
    slug: 'robe-fourreau-bordeaux-silk',
    sku: 'ROBE-101',
    price: 28900,
    category_id: 1,
    stock_quantity: 5,
    is_active: true,
    is_featured: true,
    created_at: '',
    updated_at: '',
    description: 'Une pièce d\'exception façonnée en soie naturelle de première qualité. Coupe fourreau ajustée avec décolleté discret en V et dos nu élégant.',
  };

  const isItemWishlisted = isWishlisted(mockProduct.id);

  const handleWishlistToggle = () => {
    if (isItemWishlisted) {
      removeFromWishlist(mockProduct.id);
    } else {
      addToWishlist({ id: mockProduct.id, user_id: 1, product_id: mockProduct.id, created_at: '' });
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-cream-100 min-h-screen">
      <div className="bg-cream-200 border-b border-cream-400 py-6">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Robes', href: '/shop' },
              { label: mockProduct.name },
            ]}
          />
        </Container>
      </div>

      <Section spacing="lg">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-cream-200 shadow-hafrose-md">
                <img
                  src={getImageUrl(MOCK_IMAGES[selectedImg])}
                  alt={mockProduct.name}
                  className="w-full h-full object-cover transition-all duration-350"
                />
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {MOCK_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImg(idx)}
                    className={`relative w-20 aspect-[3/4] rounded-xs overflow-hidden border-2 transition-all duration-200 ${
                      selectedImg === idx ? 'border-burgundy-500 shadow-hafrose-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-caption font-sans font-semibold tracking-luxury uppercase text-burgundy-500 block mb-1">
                  Robes de Soirée
                </span>
                <h1 className="font-serif text-h2 md:text-h1 text-neutral-950 mb-3 leading-tight">
                  {mockProduct.name}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="font-sans text-h3 font-semibold text-neutral-950">
                    {formatPrice(mockProduct.price)}
                  </span>
                  <span className="text-caption font-medium text-success-600 bg-success-50 px-2 py-0.5 rounded-xs border border-success-100">
                    En Stock ({mockProduct.stock_quantity} pièces)
                  </span>
                </div>
              </div>

              <p className="text-body-base text-neutral-600 leading-relaxed">
                {mockProduct.description}
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
                    max={mockProduct.stock_quantity}
                  />
                  <div className="flex-1">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      leftIcon={<ShoppingBag className="w-5 h-5" />}
                      onClick={() => addToCart(mockProduct, quantity, selectedSize, selectedColor)}
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
                  { id: 'desc', title: 'Description & Coupe', content: mockProduct.description },
                  { id: 'comp', title: 'Composition & Entretien', content: '100% Soie naturelle, Doublure en viscose douce.' },
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

          {/* Related Products */}
          <div className="mt-20 pt-12 border-t border-neutral-200">
            <h2 className="font-serif text-h2 text-neutral-950 mb-8 text-center">
              Vous Aimerez Aussi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 201, name: 'Sac Mini Bucket Rose', slug: 'sac-mini-bucket-rose', price: 34500, categoryName: 'Sacs' },
                { id: 202, name: 'Escarpins Satin Noir', slug: 'escarpins-satin-noir', price: 21000, categoryName: 'Chaussures' },
                { id: 203, name: 'Manchette Or Zircon', slug: 'manchette-or-zircon', price: 14500, categoryName: 'Bijoux' },
                { id: 204, name: 'Robe Plissée Soleil', slug: 'robe-plissee-soleil', price: 26500, categoryName: 'Robes' },
              ].map((p) => (
                <ProductCard key={p.id} {...p} onClick={(s) => navigate(`/product/${s}`)} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default ProductDetailPage;
