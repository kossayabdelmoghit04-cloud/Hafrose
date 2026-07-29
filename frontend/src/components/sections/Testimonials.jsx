import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, revealLine } from '../../utils/motionConfig';

const reviews = [
  {
    author: "Hélène de M.",
    city: "Genève",
    comment: "Le cabas en cuir d'autruche est un chef-d'œuvre. La patine, la précision de la couture sellier et l'élégance qu'il dégage sont incomparables. C'est mon compagnon de voyage privilégié.",
    rating: 5,
    tag: "Achat Certifié",
  },
  {
    author: "Julien R.",
    city: "Paris",
    comment: "J'ai acquis le chronographe automatique Héritage. Une merveille d'horlogerie. Le mouvement squelette est captivant et le service de la conciergerie a été irréprochable.",
    rating: 5,
    tag: "Achat Certifié",
  },
  {
    author: "Clara B.",
    city: "Londres",
    comment: "Le collier en or blanc orné du diamant de synthèse est d'une pureté absolue. Le service client m'a accompagnée avec un soin particulier. Hafrose est devenue ma maison préférée.",
    rating: 5,
    tag: "Achat Certifié",
  },
  {
    author: "Mehdi A.",
    city: "Dubai",
    comment: "Une expérience d'achat sans égale. L'emballage, la lettre manuscrite, chaque détail témoigne d'un soin exceptionnel pour le client. Je reviendrai assurément.",
    rating: 5,
    tag: "Achat Certifié",
  },
];

const AUTOPLAY_DELAY = 5000;

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60, filter: 'blur(4px)' }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir < 0 ? 60 : -60,
    filter: 'blur(4px)',
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-xs ${
            i < rating ? 'text-luxury-gold' : 'text-luxury-gold/20'
          }`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

const Testimonials = memo(function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const goTo = useCallback(
    (idx, dir = 1) => {
      setDirection(dir);
      setCurrent(idx);
    },
    []
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prevIdx) => (prevIdx + 1) % reviews.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prevIdx) => (prevIdx - 1 + reviews.length) % reviews.length);
  }, []);

  const startTimer = useCallback(() => {
    if (shouldReduceMotion) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_DELAY);
  }, [next, shouldReduceMotion]);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [current, startTimer, stopTimer]);

  const rev = reviews[current];

  return (
    <section
      id="testimonials"
      className="testimonials-section py-28 md:py-36 bg-luxury-charcoal text-luxury-cream border-t border-luxury-gold/15 overflow-hidden relative"
      aria-label="Témoignages clients de la Maison Hafrose"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(196,168,130,0.3) 0%, transparent 75%)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer(0.1)}
          className="text-center mb-16 md:mb-20 space-y-4"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-3">
            <span className="h-[1px] w-6 bg-luxury-gold/60 inline-block" aria-hidden="true" />
            <span className="text-overline text-luxury-gold">Échos des Esthètes</span>
            <span className="h-[1px] w-6 bg-luxury-gold/60 inline-block" aria-hidden="true" />
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-fluid-h2 text-white font-serif font-extralight tracking-tight">
            Les Témoignages
          </motion.h2>

          <motion.div
            variants={revealLine}
            className="h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/60 to-transparent w-16 mx-auto"
            aria-hidden="true"
          />
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={stopTimer}
          onMouseLeave={startTimer}
          onFocus={stopTimer}
          onBlur={startTimer}
          className="relative"
        >
          <div
            className="overflow-hidden bg-luxury-charcoal/90 border border-luxury-gold/25 p-8 md:p-14 relative shadow-2xl backdrop-blur-md"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Giant watermark quote icon */}
            <span
              className="absolute top-4 right-8 font-serif text-9xl leading-none pointer-events-none select-none opacity-[0.06] text-luxury-gold"
              aria-hidden="true"
            >
              &ldquo;
            </span>

            {/* Corner Frame Accents */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-luxury-gold/40 pointer-events-none" aria-hidden="true" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-luxury-gold/40 pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-luxury-gold/40 pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-luxury-gold/40 pointer-events-none" aria-hidden="true" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={shouldReduceMotion ? {} : slideVariants}
                initial={shouldReduceMotion ? { opacity: 1 } : 'enter'}
                animate="center"
                exit={shouldReduceMotion ? { opacity: 1 } : 'exit'}
                className="space-y-8 relative z-10"
              >
                <div className="flex items-center justify-between">
                  <StarRating rating={rev.rating} />
                  <span className="text-[9px] tracking-[0.3em] uppercase text-luxury-gold/70 font-sans font-medium px-2.5 py-1 border border-luxury-gold/20 bg-luxury-gold/5">
                    {rev.tag || 'Achat Certifié'}
                  </span>
                </div>

                <blockquote>
                  <p className="text-editorial text-luxury-cream/95 text-lg md:text-2xl leading-relaxed md:leading-loose font-light italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </blockquote>

                <footer className="flex items-center gap-4 border-t border-luxury-gold/15 pt-6">
                  {/* Avatar Circle with Initial */}
                  <div
                    className="w-12 h-12 rounded-full border border-luxury-gold/40 bg-gradient-to-br from-luxury-gold/20 via-luxury-charcoal to-[var(--color-sienne)]/20 flex items-center justify-center shadow-inner shrink-0"
                    aria-hidden="true"
                  >
                    <span className="font-serif text-luxury-gold font-light text-xl">
                      {rev.author[0]}
                    </span>
                  </div>

                  <div>
                    <div className="text-white font-sans text-sm md:text-base font-medium tracking-wide">
                      {rev.author}
                    </div>
                    <div className="text-[10px] tracking-[0.35em] uppercase font-sans mt-0.5 text-luxury-cream/60">
                      {rev.city}
                    </div>
                  </div>
                </footer>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls & Pagination */}
          <div className="flex items-center justify-between mt-8 px-2">
            <button
              onClick={prev}
              className="w-11 h-11 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold/70 hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-charcoal"
              aria-label="Témoignage précédent"
            >
              ←
            </button>

            <div className="flex items-center gap-2.5" role="tablist" aria-label="Navigation des témoignages">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={idx === current}
                  aria-label={`Témoignage ${idx + 1}`}
                  onClick={() => goTo(idx, idx > current ? 1 : -1)}
                  className={`transition-all duration-500 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold ${
                    idx === current
                      ? 'w-8 h-[2px] bg-luxury-gold shadow-[0_0_8px_rgba(196,168,130,0.5)]'
                      : 'w-2.5 h-[2px] bg-luxury-gold/25 hover:bg-luxury-gold/60'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold/70 hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-charcoal"
              aria-label="Témoignage suivant"
            >
              →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default Testimonials;
