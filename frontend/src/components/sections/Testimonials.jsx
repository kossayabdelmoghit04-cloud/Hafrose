import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Card from '../ui/Card';
import { scrollRevealProps, staggerContainer, fadeUp } from '../../utils/motionConfig';

const reviews = [
  {
    author: "Hélène de M.",
    city: "Genève",
    comment: "Le cabas en cuir d'autruche est un chef-d'œuvre. La patine, la précision de la couture sellier et l'élégance qu'il dégage sont incomparables. C'est mon compagnon de voyage privilégié.",
    rating: 5,
  },
  {
    author: "Julien R.",
    city: "Paris",
    comment: "J'ai acquis le chronographe automatique Héritage. Une merveille d'horlogerie. Le mouvement squelette est captivant et le service de la conciergerie a été irréprochable.",
    rating: 5,
  },
  {
    author: "Clara B.",
    city: "Londres",
    comment: "Le collier en or blanc orné du diamant de synthèse est d'une pureté absolue. Le service client m'a accompagnée avec un soin particulier. Hafrose est devenue ma maison préférée.",
    rating: 5,
  },
  {
    author: "Mehdi A.",
    city: "Dubai",
    comment: "Une expérience d'achat sans égale. L'emballage, la lettre manuscrite, chaque détail témoigne d'un soin exceptionnel pour le client. Je reviendrai assurément.",
    rating: 5,
  },
];

const AUTOPLAY_DELAY = 5000;

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir < 0 ? 80 : -80, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-xs ${i < rating ? 'text-luxury-gold' : 'text-luxury-gold/20'}`} aria-hidden="true">
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

  const goTo = (idx, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const next = () => goTo((current + 1) % reviews.length, 1);
  const prev = () => goTo((current - 1 + reviews.length) % reviews.length, -1);

  useEffect(() => {
    if (shouldReduceMotion) return;
    timerRef.current = setInterval(next, AUTOPLAY_DELAY);
    return () => clearInterval(timerRef.current);
  }, [current, shouldReduceMotion]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    if (!shouldReduceMotion) timerRef.current = setInterval(next, AUTOPLAY_DELAY);
  };

  const rev = reviews[current];

  return (
    <section
      className="py-28 bg-luxury-charcoal border-t border-luxury-gold/10 overflow-hidden relative"
      aria-label="Témoignages clients"
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(196,168,130,0.4) 0%, transparent 70%)' }}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12">

        {/* Header */}
        <motion.div
          {...scrollRevealProps}
          variants={staggerContainer(0.1)}
          className="text-center mb-16 space-y-4"
        >
          <motion.span variants={fadeUp} className="text-overline block">
            Échos des Esthètes
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-fluid-h2 text-white font-extralight">
            Les Témoignages
          </motion.h2>
          <motion.div variants={fadeUp} className="h-[1px] bg-luxury-gold/40 w-12 mx-auto" />
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
        >
          <div
            className="overflow-hidden glass-card-dark p-8 md:p-14 relative"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Giant quote mark */}
            <span
              className="absolute top-6 right-8 font-serif text-8xl text-luxury-gold/08 font-extralight pointer-events-none select-none leading-none"
              aria-hidden="true"
            >
              "
            </span>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={shouldReduceMotion ? {} : slideVariants}
                initial={shouldReduceMotion ? { opacity: 1 } : 'enter'}
                animate="center"
                exit={shouldReduceMotion ? { opacity: 1 } : 'exit'}
                className="space-y-8"
              >
                <StarRating rating={rev.rating} />

                <blockquote>
                  <p className="text-editorial text-luxury-cream/85 text-base md:text-xl leading-relaxed">
                    "{rev.comment}"
                  </p>
                </blockquote>

                <footer className="flex items-center gap-4 border-t border-luxury-gold/15 pt-6">
                  <div
                    className="w-10 h-10 rounded-full bg-luxury-gold/15 flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="font-serif text-luxury-gold font-light text-lg">
                      {rev.author[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-sans text-sm font-medium">{rev.author}</div>
                    <div className="text-luxury-gold/60 text-[10px] tracking-[0.3em] uppercase font-sans mt-0.5">{rev.city}</div>
                  </div>
                </footer>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            {/* Previous */}
            <button
              onClick={prev}
              className="w-10 h-10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold/60 hover:border-luxury-gold hover:text-luxury-gold transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-luxury-gold"
              aria-label="Témoignage précédent"
            >
              ←
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Navigation témoignages">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={idx === current}
                  aria-label={`Témoignage ${idx + 1}`}
                  onClick={() => goTo(idx, idx > current ? 1 : -1)}
                  className={`transition-all duration-500 ${
                    idx === current
                      ? 'w-6 h-[2px] bg-luxury-gold'
                      : 'w-2 h-[2px] bg-luxury-gold/25 hover:bg-luxury-gold/50'
                  }`}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={next}
              className="w-10 h-10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold/60 hover:border-luxury-gold hover:text-luxury-gold transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-luxury-gold"
              aria-label="Témoignage suivant"
            >
              →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
});

export default Testimonials;
