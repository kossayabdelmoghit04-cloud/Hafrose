import { useNavigate } from 'react-router-dom';
import { CategoryCard } from '../../../components/ui/CategoryCard';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useCategories } from '../../../hooks/useProductHooks';
import { getImageUrl } from '../../../utils/formatters';

export const CategoriesSection = () => {
  const { data, isLoading } = useCategories();
  const navigate = useNavigate();

  // Source unique de vérité : catégories chargées depuis l'API
  const apiCategories = data?.data ?? [];
  const categoriesToDisplay = apiCategories.map((c, i) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.image_url ? getImageUrl(c.image_url) : (c.image ? getImageUrl(c.image) : null),
    productCount: 24 + i * 5,
  }));

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
        ) : categoriesToDisplay.length > 0 ? (
          /* Grid: 2 large + remaining */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {/* Two tall featured cards */}
            {categoriesToDisplay.slice(0, 2).map((cat) => (
              <div key={cat.id} className="col-span-1 md:row-span-2">
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
              <div key={cat.id} className="col-span-1">
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
        ) : null}
      </Container>
    </Section>
  );
};
