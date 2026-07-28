import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { Link } from 'react-router-dom';

const RecommendationCarousel = ({ title, products = [] }) => {
  const { formatPrice } = useCurrency();

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-amber-900/10 dark:border-amber-900/30 pb-4">
        <h2 className="font-serif text-2xl md:text-3xl text-neutral-900 dark:text-amber-100 tracking-wide">
          {title}
        </h2>
        <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
          Recommandations IA
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-amber-900/20 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={item.image_url || item.image || '/assets/images/placeholder.jpg'}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-neutral-950/80 backdrop-blur-md text-amber-400 px-2 py-1 text-[10px] tracking-wider rounded uppercase font-mono">
                IA Match
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-serif text-sm md:text-base text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1">
                {formatPrice(item.price)}
              </p>
              <Link
                to={`/products/${item.slug}`}
                className="mt-3 block w-full text-center text-xs py-2 bg-neutral-900 dark:bg-amber-600 text-white rounded hover:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
              >
                Découvrir
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendationCarousel;
