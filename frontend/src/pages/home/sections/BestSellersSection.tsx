import { useState } from 'react';
import { ProductCard } from '../../../components/ui/ProductCard';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS = [
  { id: 1, name: 'Robe Soirée Bordeaux', slug: 'robe-soiree-bordeaux', price: 24900, salePrice: null, imageUrl: null, categoryName: 'Robes', badgeText: 'Nouveau' },
  { id: 2, name: 'Sac Cuir Rose Poudré', slug: 'sac-cuir-rose', price: 31500, salePrice: 25200, imageUrl: null, categoryName: 'Sacs', badgeText: '-20%' },
  { id: 3, name: 'Escarpins Velours Nuit', slug: 'escarpins-velours', price: 18900, salePrice: null, imageUrl: null, categoryName: 'Chaussures', badgeText: undefined },
  { id: 4, name: 'Collier Perles Fines', slug: 'collier-perles', price: 12500, salePrice: null, imageUrl: null, categoryName: 'Bijoux', badgeText: 'Best-seller' },
  { id: 5, name: 'Robe Midi Ivoire', slug: 'robe-midi-ivoire', price: 21900, salePrice: 17500, imageUrl: null, categoryName: 'Robes', badgeText: '-20%' },
  { id: 6, name: 'Ceinture Cuir Or', slug: 'ceinture-cuir-or', price: 8900, salePrice: null, imageUrl: null, categoryName: 'Accessoires', badgeText: undefined },
  { id: 7, name: 'Foulard Soie Imprimé', slug: 'foulard-soie', price: 6500, salePrice: null, imageUrl: null, categoryName: 'Accessoires', badgeText: 'Édition Limitée' },
  { id: 8, name: 'Blazer Crème Structuré', slug: 'blazer-creme', price: 28900, salePrice: null, imageUrl: null, categoryName: 'Vestes', badgeText: 'Nouveau' },
];

const VISIBLE = 4;

export const BestSellersSection = () => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);

  const maxOffset = Math.max(0, PRODUCTS.length - VISIBLE);

  const toggleWishlist = (id: number) =>
    setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);

  const visible = PRODUCTS.slice(offset, offset + VISIBLE);

  return (
    <Section spacing="lg" bg="cream-dark">
      <Container>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div className="space-y-3">
            <p className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500">
              Sélection du Moment
            </p>
            <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950 leading-tight">
              Meilleures Ventes
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 pb-1">
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Articles précédents"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            />
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Articles suivants"
              disabled={offset >= maxOffset}
              onClick={() => setOffset(Math.min(maxOffset, offset + 1))}
              icon={<ChevronRight className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              badgeText={product.badgeText ?? undefined}
              isWishlisted={wishlist.includes(product.id)}
              onWishlistToggle={toggleWishlist}
              onQuickAdd={(id) => console.info('Quick add:', id)}
              onClick={(slug) => console.info('Navigate to:', slug)}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Voir toutes les Meilleures Ventes
          </Button>
        </div>
      </Container>
    </Section>
  );
};
