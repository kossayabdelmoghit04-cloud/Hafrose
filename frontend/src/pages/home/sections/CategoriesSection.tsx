import { useNavigate } from 'react-router-dom';
import dressesSrc from '../../../assets/images/category-dresses.jpg';
import bagsSrc from '../../../assets/images/category-bags.jpg';
import shoesSrc from '../../../assets/images/category-shoes.jpg';
import { CategoryCard } from '../../../components/ui/CategoryCard';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useCategories } from '../../../hooks/useProductHooks';
import { getImageUrl } from '../../../utils/formatters';

const DEFAULT_CATEGORIES = [
  { name: 'Robes', slug: 'robes', imageUrl: dressesSrc, productCount: 48 },
  { name: 'Sacs', slug: 'sacs', imageUrl: bagsSrc, productCount: 32 },
  { name: 'Chaussures', slug: 'chaussures', imageUrl: shoesSrc, productCount: 27 },
  { name: 'Bijoux', slug: 'bijoux', imageUrl: null, productCount: 64 },
  { name: 'Accessoires', slug: 'accessoires', imageUrl: null, productCount: 41 },
  { name: 'Nouveautés', slug: 'nouveautes', imageUrl: null, productCount: 18 },
];

export const CategoriesSection = () => {
  const { data, isLoading } = useCategories();
  const navigate = useNavigate();

  const apiCategories = data?.data ?? [];
  const categoriesToDisplay = apiCategories.length > 0
    ? apiCategories.map((c, i) => ({
        name: c.name,
        slug: c.slug,
        imageUrl: getImageUrl(c.image ?? c.image_url ?? DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].imageUrl),
        productCount: 24 + i * 5,
      }))
    : DEFAULT_CATEGORIES;

  return (
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

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Skeleton className="h-72 md:h-[420px] rounded-md col-span-1" />
            <Skeleton className="h-72 md:h-[420px] rounded-md col-span-1" />
            <Skeleton className="h-44 md:h-52 rounded-md col-span-1" />
            <Skeleton className="h-44 md:h-52 rounded-md col-span-1" />
          </div>
        ) : (
          /* Grid: 2 large + remaining */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {/* Two tall featured cards */}
            {categoriesToDisplay.slice(0, 2).map((cat) => (
              <div key={cat.slug} className="col-span-1 md:row-span-2">
                <CategoryCard
                  name={cat.name}
                  slug={cat.slug}
                  imageUrl={cat.imageUrl ?? undefined}
                  productCount={cat.productCount}
                  onClick={(slug) => navigate(`/shop?category=${slug}`)}
                  className="h-72 md:h-full min-h-[320px]"
                />
              </div>
            ))}
            {/* Remaining cards */}
            {categoriesToDisplay.slice(2, 6).map((cat) => (
              <div key={cat.slug} className="col-span-1">
                <CategoryCard
                  name={cat.name}
                  slug={cat.slug}
                  imageUrl={cat.imageUrl ?? undefined}
                  productCount={cat.productCount}
                  onClick={(slug) => navigate(`/shop?category=${slug}`)}
                  className="h-44 md:h-52"
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
};
