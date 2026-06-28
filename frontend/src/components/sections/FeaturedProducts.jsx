import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../cards/ProductCard';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import productService from '../../services/productService';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const res = await productService.getAll({ is_featured: true, per_page: 4 });
        if (res?.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Impossible de charger les créations vedettes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-24 bg-luxury-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div className="space-y-4 text-left">
            <span className="text-[10px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold block">
              Sélection d'Artisans
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-luxury-charcoal font-light">
              Les Créations Vedettes
            </h2>
            <div className="w-12 h-[1px] bg-luxury-gold" />
          </div>
          <div className="text-left md:text-right">
            <Link to="/shop">
              <Button variant="text" className="text-xs">
                Voir toutes les créations &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Display */}
        {isLoading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : error || products.length === 0 ? (
          <div className="py-12 text-center text-xs font-sans text-luxury-gray font-light">
            {error || 'Aucune création vedette disponible pour le moment.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
