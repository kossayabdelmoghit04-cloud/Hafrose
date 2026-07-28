import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { scrollRevealProps, staggerContainer, fadeUp } from '../../utils/motionConfig';

const articles = [
  {
    id: 'couture-sellier',
    title: 'L\'Art Secret de la Couture Sellier',
    category: 'Savoir-Faire',
    date: 'Automne 2026',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=75',
    excerpt: 'Découvrez la technique ancestrale au fil de lin poissé qui confère à nos sacs une résistance inégalée.',
  },
  {
    id: 'inspiration-paris',
    title: 'Flânerie au Faubourg Saint-Honoré',
    category: 'Inspiration',
    date: 'Édition N°8',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=75',
    excerpt: 'Une promenade architecturale au cœur de la capitale où chaque façade nourrit nos créations contemporaines.',
  },
  {
    id: 'entretien-cuir',
    title: 'Sublimer et Patiner les Cuirs Nobles',
    category: 'Guide d\'Artisan',
    date: 'Conseils Privés',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=75',
    excerpt: 'Les gestes essentiels transmis par nos compagnons selliers pour faire traverser les décennies à votre pièce.',
  },
];

const EditorialJournal = memo(function EditorialJournal() {
  return (
    <section
      className="py-28 bg-luxury-charcoal/[0.02] border-t border-luxury-charcoal/5 relative overflow-hidden"
      aria-label="Journal et Magazine de la Maison Hafrose"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="space-y-3">
            <motion.span variants={fadeUp} className="text-overline block">
              Gazette & Leçons d'Art
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-fluid-h2 text-luxury-charcoal font-extralight">
              Le Journal de la Maison
            </motion.h2>
            <motion.div variants={fadeUp} className="h-[1px] bg-luxury-gold w-12" />
          </div>

          <motion.div variants={fadeUp}>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-luxury-gold hover:text-luxury-charcoal font-sans font-semibold transition-colors group"
            >
              <span>Découvrir tout le Journal</span>
              <span className="h-[1px] bg-current w-6 group-hover:w-10 transition-all duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Articles Grid */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {articles.map((article) => (
            <motion.article
              key={article.id}
              variants={fadeUp}
              className="group flex flex-col justify-between bg-white border border-beige p-6 hover-elevate transition-all duration-500"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-blush">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-luxury-charcoal/80 backdrop-blur-sm text-luxury-gold text-[9px] uppercase tracking-widest px-2.5 py-1 font-sans font-medium">
                    {article.category}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-luxury-gray/60 font-sans block">
                    {article.date}
                  </span>
                  <h3 className="font-serif text-xl text-luxury-charcoal font-light group-hover:text-luxury-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs font-sans text-luxury-gray font-light leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Read More */}
              <div className="pt-6 border-t border-beige mt-6">
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-luxury-charcoal group-hover:text-luxury-gold font-sans font-medium transition-colors">
                  Lire l'Article &rarr;
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>

      </div>
    </section>
  );
});

export default EditorialJournal;
