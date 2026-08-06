import dressesSrc from '../../../assets/images/category-dresses.jpg';
import bagsSrc from '../../../assets/images/category-bags.jpg';
import shoesSrc from '../../../assets/images/category-shoes.jpg';
import { CategoryCard } from '../../../components/ui/CategoryCard';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';

const CATEGORIES = [
  { name: 'Robes', slug: 'robes', imageUrl: dressesSrc, productCount: 48 },
  { name: 'Sacs', slug: 'sacs', imageUrl: bagsSrc, productCount: 32 },
  { name: 'Chaussures', slug: 'chaussures', imageUrl: shoesSrc, productCount: 27 },
  {
    name: 'Bijoux',
    slug: 'bijoux',
    imageUrl: null,
    productCount: 64,
    gradient: 'from-gold-700 to-gold-500',
  },
  {
    name: 'Accessoires',
    slug: 'accessoires',
    imageUrl: null,
    productCount: 41,
    gradient: 'from-rose-700 to-rose-400',
  },
  {
    name: 'Nouveautés',
    slug: 'nouveautes',
    imageUrl: null,
    productCount: 18,
    gradient: 'from-burgundy-800 to-burgundy-500',
  },
];

export const CategoriesSection = () => (
  <Section spacing="lg" bg="cream">
    <Container>
      {/* Section Header */}
      <div className="text-center mb-10 md:mb-14 space-y-3">
        <p className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500">
          Nos Univers
        </p>
        <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950">
          Explorez nos Catégories
        </h2>
        <p className="text-body-base text-neutral-500 max-w-md mx-auto leading-relaxed">
          Découvrez chaque univers soigneusement pensé pour exprimer votre personnalité.
        </p>
      </div>

      {/* Grid: 2 large + 4 small */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {/* Two tall featured cards */}
        {CATEGORIES.slice(0, 2).map((cat) => (
          <div key={cat.slug} className="col-span-1 md:row-span-2">
            <CategoryCard
              name={cat.name}
              slug={cat.slug}
              imageUrl={cat.imageUrl ?? undefined}
              productCount={cat.productCount}
              className="h-72 md:h-full min-h-[320px]"
            />
          </div>
        ))}
        {/* Four smaller cards */}
        {CATEGORIES.slice(2).map((cat) => (
          <div key={cat.slug} className="col-span-1">
            {cat.imageUrl ? (
              <CategoryCard
                name={cat.name}
                slug={cat.slug}
                imageUrl={cat.imageUrl}
                productCount={cat.productCount}
                className="h-44 md:h-52"
              />
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label={`Découvrir ${cat.name}`}
                className={`relative h-44 md:h-52 rounded-md overflow-hidden cursor-pointer bg-gradient-to-br ${(cat as { gradient?: string }).gradient ?? 'from-burgundy-800 to-burgundy-500'} group`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <h3 className="font-serif text-h4 text-white">{cat.name}</h3>
                  <span className="text-caption text-white/70 tracking-luxury">{cat.productCount} articles</span>
                </div>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-350" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Container>
  </Section>
);
