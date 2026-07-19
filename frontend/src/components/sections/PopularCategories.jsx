import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function PopularCategories() {
  const categories = [
    {
      name: 'Sacs',
      slug: 'sacs',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=70',
      description: 'Cabas, sacs à main et pochettes de soirée.'
    },
    {
      name: 'Bijoux',
      slug: 'bijoux',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=70',
      description: 'Créations précieuses serties d\'éclats éternels.'
    },
    {
      name: 'Montres',
      slug: 'montres',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=70',
      description: 'Garde-temps automatiques de haute précision.'
    },
    {
      name: 'Lunettes',
      slug: 'lunettes',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=70',
      description: 'Lunettes de créateur alliant style et clarté.'
    },
    {
      name: 'Ceintures',
      slug: 'ceintures',
      image: 'https://images.unsplash.com/photo-1624222247344-550fb8efeb31?auto=format&fit=crop&w=500&q=70',
      description: 'Ceintures en cuir de veau aux finitions d\'art.'
    },
    {
      name: 'Portefeuilles',
      slug: 'portefeuilles',
      image: 'https://images.unsplash.com/photo-1627124357773-41319db23f2f?auto=format&fit=crop&w=500&q=70',
      description: 'Petite maroquinerie fonctionnelle et raffinée.'
    }
  ];

  return (
    <section className="py-24 bg-luxury-light-gray/40 border-y border-luxury-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
            Collections Phares
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-luxury-charcoal font-light">
            Nos Catégories Populaires
          </h2>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-[4/5] bg-luxury-charcoal overflow-hidden shadow-md"
            >
              {/* Category Image */}
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.7]"
              />

              {/* Category Card Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div />
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl text-white font-light tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/70 font-sans font-light leading-relaxed max-w-[220px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {cat.description}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="inline-flex items-center text-[10px] tracking-widest uppercase text-luxury-gold hover:text-white font-sans font-semibold transition-colors duration-300"
                    >
                      Explorer la collection &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card Accent Overlay */}
              <div className="absolute inset-0 border border-luxury-cream/15 group-hover:border-luxury-gold/30 transition-colors duration-500 pointer-events-none m-4" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
