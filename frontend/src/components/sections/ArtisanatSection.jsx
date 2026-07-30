import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, scrollRevealProps, slideRight, slideLeft } from '../../utils/motionConfig';

/**
 * ArtisanatSection — Storytelling savoir-faire
 * Animated counters + split layout with image + text reveal
 */

const stats = [
  { value: 500, suffix: '+', label: 'Créations Uniques' },
  { value: 40,  suffix: '+', label: 'Pays Livrés' },
  { value: 8,   suffix: ' ans', label: "D'Excellence" },
  { value: 100, suffix: '%', label: 'Main & Cœur' },
];

function AnimatedCounter({ value, suffix, inView }) {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (shouldReduceMotion) { setCount(value); return; }
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, value, shouldReduceMotion]);

  return (
    <span>
      {count}{suffix}
    </span>
  );
}

export default function ArtisanatSection() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 bg-luxury-charcoal text-luxury-cream overflow-hidden relative"
      aria-label="L'Artisanat Hafrose"
    >
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Top overline */}
        <motion.div
          {...scrollRevealProps}
          variants={fadeUp}
          className="text-center mb-20"
        >
          <span className="text-overline">L'Art du Geste</span>
        </motion.div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">

          {/* Image side */}
          <motion.div
            {...scrollRevealProps}
            variants={slideRight}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
              alt="Artisan Hafrose au travail"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s] ease-out"
              loading="lazy"
              decoding="async"
            />
            {/* Gold frame overlay */}
            <div className="absolute inset-4 border border-luxury-gold/20 pointer-events-none" aria-hidden="true" />
            {/* Badge */}
            <div className="absolute bottom-8 right-8 glass-card-dark p-4 text-center">
              <div className="text-2xl font-serif text-luxury-gold font-light">VIII</div>
              <div className="text-[8px] tracking-[0.4em] uppercase text-luxury-cream/50 font-sans mt-1">Ans d'excellence</div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            {...scrollRevealProps}
            variants={slideLeft}
            className="space-y-8"
          >
            <h2 className="text-fluid-h1 text-white font-extralight leading-tight">
              Un Savoir-Faire<br />
              <span className="text-luxury-gold italic font-light">Intemporel</span>
            </h2>

            <div className="h-[1px] bg-luxury-gold/30 w-12" />

            <div className="space-y-5 text-luxury-cream/65 font-sans font-light leading-relaxed">
              <p>
                Dans nos ateliers partenaires, chaque pièce Hafrose naît d'une relation profonde entre
                l'artisan et la matière. Aucune machine ne remplace la précision du geste humain,
                aucun algorithme n'égale l'intuition de la main experte.
              </p>
              <p>
                De la sélection rigoureuse des cuirs pleine fleur aux finitions à la cire naturelle,
                chaque étape est un acte d'amour envers l'excellence — une philosophie qui guide
                la Maison depuis 2018.
              </p>
            </div>

            {/* Decorative quote */}
            <blockquote className="border-l-2 border-luxury-gold/40 pl-6">
              <p className="text-editorial text-luxury-cream/80 text-lg">
                "Nous ne fabriquons pas des produits. Nous créons des héritages."
              </p>
              <cite className="text-[9px] tracking-[0.4em] uppercase text-luxury-gold/60 font-sans mt-3 block not-italic">
                — Le Directeur Artistique
              </cite>
            </blockquote>
          </motion.div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-luxury-gold/10 pt-16">
          {stats.map(({ value, suffix, label }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.12, duration: 0.7, ease: [0.16,1,0.3,1] }}
              className="text-center"
            >
              <div className="font-serif text-4xl md:text-5xl text-luxury-gold font-extralight tabular-nums">
                <AnimatedCounter value={value} suffix={suffix} inView={inView} />
              </div>
              <div className="text-[9px] tracking-[0.4em] uppercase text-luxury-cream/40 font-sans mt-2">
                {label}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
