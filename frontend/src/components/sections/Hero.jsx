import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-luxury-charcoal flex items-center justify-center">
      {/* Background Image with elegant overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/hero.png"
          alt="Hafrose Luxury Collection"
          className="w-full h-full object-cover object-center scale-[1.02] animate-pulse-subtle"
          style={{ animationDuration: '8s' }}
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-brightness-[0.85]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-luxury-cream space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <span className="text-[10px] md:text-xs tracking-[0.6em] uppercase text-luxury-gold font-sans font-semibold block">
            Maison de Haute Maroquinerie
          </span>
          <h1 className="font-serif text-5xl md:text-8xl font-extralight tracking-[0.2em] text-white">
            HAFROSE
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="w-16 h-[1px] bg-luxury-gold mx-auto"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <p className="text-sm md:text-lg font-serif italic text-luxury-cream/80 max-w-xl mx-auto font-light leading-relaxed">
            "L'art d'associer la pureté du geste artisanal à l'audace créative contemporaine."
          </p>
          <div>
            <Link to="/shop">
              <Button variant="gold" size="lg" className="shadow-lg">
                Découvrir la Collection
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative vertical line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[1px] h-16 bg-gradient-to-t from-luxury-gold to-transparent" />
    </section>
  );
}
