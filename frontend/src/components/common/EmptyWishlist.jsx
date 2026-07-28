import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowRight } from 'react-icons/fi';

/**
 * EmptyWishlist — HAFROSE Design System Phase 3
 * État vide de la page favoris / wishlist.
 * Illustré avec une icône animée, un message éditorial et un CTA vers la boutique.
 */
const EmptyWishlist = memo(function EmptyWishlist({ className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center py-28 px-6 text-center ${className}`}
      aria-label="Aucun favori"
    >
      {/* Animated heart icon */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
        className="mb-8"
        aria-hidden="true"
      >
        <div className="w-20 h-20 rounded-full bg-blush border border-rose-gold/20 flex items-center justify-center mx-auto">
          <FiHeart size={32} className="text-rose-gold" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Headline */}
      <h2 className="font-serif text-2xl md:text-3xl font-light text-luxury-charcoal mb-3 leading-snug">
        Votre liste de désirs<br />est encore vide
      </h2>

      {/* Editorial message */}
      <p className="font-sans text-xs font-light text-warm-gray leading-relaxed max-w-xs mb-2">
        Ajoutez les créations qui vous inspirent en cliquant sur l'icône{' '}
        <FiHeart size={11} className="inline text-rose-gold" aria-hidden="true" /> depuis la boutique.
      </p>

      <div className="w-8 h-px bg-rose-gold/40 mx-auto my-6" aria-hidden="true" />

      {/* Citation luxe */}
      <blockquote className="font-serif text-sm italic text-warm-gray font-light mb-8 max-w-sm">
        « Le luxe commence là où finit la nécessité. »
        <cite className="block font-sans text-[10px] not-italic uppercase tracking-widest text-rose-gold mt-2">
          — Coco Chanel
        </cite>
      </blockquote>

      {/* CTA */}
      <Link
        to="/shop"
        className="group inline-flex items-center gap-3 bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-rose-gold transition-colors duration-300"
      >
        Explorer la Boutique
        <FiArrowRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>

      {/* Subtle bottom note */}
      <p className="font-sans text-[10px] text-warm-gray/60 mt-6 uppercase tracking-widest">
        Livraison offerte dès 150 €
      </p>
    </motion.section>
  );
});

export default EmptyWishlist;
