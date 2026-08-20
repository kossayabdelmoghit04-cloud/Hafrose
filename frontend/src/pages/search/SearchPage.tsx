import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { SearchInput } from '../../components/ui/SearchInput';
import { ProductCard } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/ProductCard/ProductCardSkeleton';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { useProducts } from '../../hooks/useProductHooks';
import { useDebounce } from '../../hooks/useUtilities';
import { getImageUrl } from '../../utils/formatters';
import { Product } from '../../types/models';
import { useSEO } from '../../hooks/useSEO';

const POPULAR_SUGGESTIONS = [
  'Sac en Cuir',
  'Collier Or',
  'Montre Classique',
  'Lunettes Aviateur',
  'Ceinture Cuir',
  'Portefeuille Noir',
];

export const SearchPage = () => {
  useSEO({
    title: 'Recherche | HAFROSE',
    description: 'Recherchez parmi les collections HAFROSE — maroquinerie, bijoux, montres et accessoires de luxe.',
    noIndex: false,
  });
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data: searchResponse, isLoading, isError, refetch } = useProducts(
    debouncedQuery.trim() ? { search: debouncedQuery } : undefined
  );

  const results: Product[] = debouncedQuery.trim() ? (searchResponse?.data ?? []) : [];

  return (
    <div className="bg-cream-100 min-h-screen">
      <div className="bg-cream-200 border-b border-cream-400 py-12 md:py-16 text-center">
        <Container size="md">
          <span className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500 block mb-2">
            Moteur de Recherche HAFROSE
          </span>
          <h1 className="font-serif text-h1 md:text-display-lg text-neutral-950 mb-6">
            Rechercher un Produit
          </h1>
          <div className="max-w-xl mx-auto shadow-hafrose-md">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Que recherchez-vous ? (ex: Robe, Sac, Bordeaux...)"
              autoFocus
            />
          </div>
        </Container>
      </div>

      <Section spacing="lg">
        <Container>
          {query.trim() === '' ? (
            /* Initial State: Popular Suggestions */
            <div className="max-w-xl mx-auto text-center space-y-6 py-8">
              <div className="flex items-center justify-center gap-2 text-gold-700 font-serif text-h4">
                <Sparkles className="w-5 h-5" /> Recherches Populaires
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {POPULAR_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-body-sm text-neutral-700 hover:border-burgundy-500 hover:text-burgundy-500 transition-all duration-200 shadow-hafrose-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            /* Error State */
            <ErrorState
              title="Erreur lors de la recherche"
              message="Une erreur est survenue lors de la connexion au serveur HAFROSE."
              onRetry={() => refetch()}
            />
          ) : results.length > 0 ? (
            /* Results Grid */
            <div className="space-y-6">
              <p className="text-body-base text-neutral-600">
                <strong>{results.length}</strong> résultat(s) pour « <strong>{debouncedQuery}</strong> »
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    salePrice={product.sale_price}
                    imageUrl={getImageUrl(product.image_url ?? product.image ?? product.media?.[0]?.url ?? null)}
                    imageCardUrl={product.image_card_url ? getImageUrl(product.image_card_url) : undefined}
                    categoryName={product.category?.name}
                    onClick={(slug) => navigate(`/product/${slug}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-powder text-burgundy-500 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-h3 text-neutral-950">Aucun résultat trouvé</h3>
              <p className="text-body-base text-neutral-600">
                Nous n'avons trouvé aucun produit correspondant à « <strong>{query}</strong> ». Essayez avec d'autres mots-clés.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="md" onClick={() => setQuery('')}>
                  Effacer la recherche
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default SearchPage;
