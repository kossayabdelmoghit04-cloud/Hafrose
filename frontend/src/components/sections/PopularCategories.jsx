import { motion } from 'framer-motion';
import CategoryCard from '../cards/CategoryCard';
import { scrollRevealProps, staggerContainer, fadeUp, revealLine } from '../../utils/motionConfig';

const categories = [
  {
    name: 'Sacs & Cabas',
    slug: 'sacs',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    description: 'Cabas emblématiques, sacs à main et pochettes de soirée d’exception.',
  },
  {
    name: 'Bijoux Fins',
    slug: 'bijoux',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: "Créations précieuses serties d'or éthique et de pierres rares.",
  },
  {
    name: 'Horlogerie',
    slug: 'montres',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Garde-temps automatiques de haute précision horlogère.',
  },
  {
    name: 'Optique & Solaire',
    slug: 'lunettes',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    description: 'Montures sculptées alliant élégance intemporelle et clarté optique.',
  },
  {
    name: 'Ceintures',
    slug: 'ceintures',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb8efeb31?auto=format&fit=crop&w=800&q=80',
    description: "Cuir pleine fleur tanné au végétal avec boucles faites main.",
  },
  {
    name: 'Petite Maroquinerie',
    slug: 'portefeuilles',
    image: 'https://images.unsplash.com/photo-1627124357773-41319db23f2f?auto=format&fit=crop&w=800&q=80',
    description: 'Portefeuilles et étuis raffinés pensés pour traverser le temps.',
  },
];

export default function PopularCategories() {
  return (
    <section
      id="categories"
      className="categories-section relative overflow-hidden bg-luxury-cream py-28 md:py-36 border-y border-[var(--color-travertin)]/50"
      aria-label="Collections Phares Maison Hafrose"
    >
      {/* Ambient Terre de Sienne light backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(140, 109, 88, 0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.12)}
          className="text-center space-y-4 mb-16 md:mb-20 max-w-2xl mx-auto"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-3">
            <span className="h-[1px] w-6 bg-[var(--color-sienne)]/60 inline-block" aria-hidden="true" />
            <span className="text-overline text-[var(--color-sienne)]">Collections Phares</span>
            <span className="h-[1px] w-6 bg-[var(--color-sienne)]/60 inline-block" aria-hidden="true" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-fluid-h2 text-luxury-charcoal font-serif font-extralight tracking-tight"
          >
            Nos Univers de Création
          </motion.h2>

          <motion.div
            variants={revealLine}
            className="h-[1px] bg-gradient-to-r from-transparent via-[var(--color-sienne)] to-transparent w-20 mx-auto"
            aria-hidden="true"
          />

          <motion.p
            variants={fadeUp}
            className="text-editorial text-luxury-gray text-base md:text-lg font-light leading-relaxed pt-2"
          >
            Chaque collection incarne un savoir-faire d'exception et une vision poétique du luxe durable.
          </motion.p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.08, 0.05)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          role="list"
          aria-label="Liste des catégories de la Maison Hafrose"
        >
          {categories.map((cat, idx) => (
            <motion.div key={cat.slug} variants={fadeUp} role="listitem" className="h-full flex">
              <CategoryCard category={cat} index={idx} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
