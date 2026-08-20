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

  // Source unique de vérité : catégories chargées depuis l'API backend
  const categories = data?.data ?? [];

  return (
    <Section spacing="lg" bg="cream">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12 space-y-2.5">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-md" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          /* Grille équilibrée 3 colonnes desktop / 2 colonnes mobile avec ratio uniforme */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                slug={cat.slug}
                imageUrl={cat.image_url ? getImageUrl(cat.image_url) : (cat.image ? getImageUrl(cat.image) : undefined)}
                imageCardUrl={cat.image_card_url ? getImageUrl(cat.image_card_url) : undefined}
                productCount={cat.products_count}
                onClick={(slug) => navigate(`/shop?category=${slug}`)}
                className="aspect-[3/4] shadow-hafrose-xs hover:shadow-hafrose-md"
              />
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
};
