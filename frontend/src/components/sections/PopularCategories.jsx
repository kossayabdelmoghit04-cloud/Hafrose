import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { scrollRevealProps, staggerContainer, fadeUp } from '../../utils/motionConfig';

const categories = [
  {
    name: 'Sacs',
    slug: 'sacs',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=75',
    description: 'Cabas, sacs à main et pochettes de soirée.',
  },
  {
    name: 'Bijoux',
    slug: 'bijoux',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=75',
    description: "Créations précieuses serties d'éclats éternels.",
  },
  {
    name: 'Montres',
    slug: 'montres',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=75',
    description: 'Garde-temps automatiques de haute précision.',
  },
  {
    name: 'Lunettes',
    slug: 'lunettes',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=700&q=75',
    description: 'Lunettes de créateur alliant style et clarté.',
  },
  {
    name: 'Ceintures',
    slug: 'ceintures',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb8efeb31?auto=format&fit=crop&w=700&q=75',
    description: "Ceintures en cuir de veau aux finitions d'art.",
  },
  {
    name: 'Portefeuilles',
    slug: 'portefeuilles',
    image: 'https://images.unsplash.com/photo-1627124357773-41319db23f2f?auto=format&fit=crop&w=700&q=75',
    description: 'Petite maroquinerie fonctionnelle et raffinée.',
  },
];

export default function PopularCategories() {
  return (
    <section
      className="py-28 bg-luxury-charcoal/[0.03] border-y border-luxury-charcoal/5 relative overflow-hidden"
      aria-label="Catégories populaires Hafrose"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="text-center space-y-4 mb-16"
        >
          <motion.span variants={fadeUp} className="text-overline block">
            Collections Phares
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-fluid-h2 text-luxury-charcoal font-extralight">
            Nos Catégories
          </motion.h2>
          <motion.div variants={fadeUp} className="h-[1px] bg-luxury-gold w-12 mx-auto" />
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.08, 0.05)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.slug}
              variants={fadeUp}
              className="group relative aspect-[4/5] bg-luxury-charcoal overflow-hidden"
            >
              {/* Category Image with hover zoom */}
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center brightness-[0.72] group-hover:brightness-[0.55] group-hover:scale-105 transition-all duration-700 ease-out"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 gradient-card-hover opacity-70 group-hover:opacity-90 transition-opacity duration-700" />

              {/* Inner border accent */}
              <div
                className="absolute inset-4 border border-luxury-cream/10 group-hover:border-luxury-gold/30 transition-colors duration-700 pointer-events-none"
                aria-hidden="true"
              />

              {/* Category Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                <div className="space-y-3">
                  {/* Index number */}
                  <span
                    className="text-[9px] tracking-[0.5em] text-luxury-gold/60 font-sans font-semibold block"
                    aria-hidden="true"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <h3 className="font-serif text-2xl text-white font-light tracking-wide">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-white/65 font-sans font-light leading-relaxed max-w-[220px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                    {cat.description}
                  </p>

                  <div className="pt-2">
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="inline-flex items-center gap-2 text-[9px] tracking-[0.5em] uppercase text-luxury-gold hover:text-white font-sans font-semibold transition-colors duration-300 group/link focus-visible:outline focus-visible:outline-1 focus-visible:outline-luxury-gold focus-visible:outline-offset-2"
                      aria-label={`Explorer la collection ${cat.name}`}
                    >
                      <span>Explorer</span>
                      <span className="h-[1px] bg-current w-4 group-hover/link:w-8 transition-all duration-500" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
