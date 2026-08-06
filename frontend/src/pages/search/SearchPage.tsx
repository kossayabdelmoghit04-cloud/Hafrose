import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { SearchInput } from '../../components/ui/SearchInput';
import { ProductCard } from '../../components/ui/ProductCard';
import { Button } from '../../components/ui/Button';

const POPULAR_SUGGESTIONS = [
  'Robe Soirée Bordeaux',
  'Sac Cuir Rose',
  'Escarpins Satin',
  'Bijoux Or Champagne',
  'Foulard Soie',
  'Blazer Crème',
];

const SEARCH_DATABASE = [
  { id: 301, name: 'Robe Fourreau Bordeaux Silk', slug: 'robe-fourreau-bordeaux-silk', price: 28900, categoryName: 'Robes', badgeText: 'Nouveau' },
  { id: 302, name: 'Sac Mini Bucket Rose Poudré', slug: 'sac-mini-bucket-rose', price: 34500, categoryName: 'Sacs', badgeText: '-20%' },
  { id: 303, name: 'Escarpins Satin Noir Prestige', slug: 'escarpins-satin-noir', price: 21000, categoryName: 'Chaussures' },
  { id: 304, name: 'Robe Plissée Soleil Ivoire', slug: 'robe-plissee-soleil-ivoire', price: 26500, categoryName: 'Robes' },
];

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = query.trim()
    ? SEARCH_DATABASE.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

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
          ) : results.length > 0 ? (
            /* Results Grid */
            <div className="space-y-6">
              <p className="text-body-base text-neutral-600">
                <strong>{results.length}</strong> résultat(s) pour « <strong>{query}</strong> »
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    badgeText={product.badgeText ?? undefined}
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
