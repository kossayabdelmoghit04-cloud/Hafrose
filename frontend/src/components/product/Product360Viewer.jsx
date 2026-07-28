import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRotateCw, FiX, FiMove } from 'react-icons/fi';

/**
 * Product360Viewer — HAFROSE v3.0
 * Visualiseur 360° interactif avec contrôle tactile et souris.
 * Simule ou anime une rotation 360° fluide à partir d'une série de perspectives d'images.
 */
const Product360Viewer = memo(function Product360Viewer({ images = [], isOpen, onClose, productName = '' }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentFrameRef = useRef(0);

  // If no images provided, build simulated frames or use gallery
  const frames = images.length > 0 ? images : ['/images/hero.png'];
  const totalFrames = frames.length;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentFrameRef.current = frameIndex;
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - startXRef.current;
    const sensitivity = 15; // px per frame
    const frameOffset = Math.floor(deltaX / sensitivity);
    let nextFrame = (currentFrameRef.current - frameOffset) % totalFrames;
    if (nextFrame < 0) nextFrame += totalFrames;
    setFrameIndex(nextFrame);
  }, [isDragging, totalFrames]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative max-w-4xl w-full bg-luxury-charcoal border border-luxury-gold/30 p-6 md:p-10 text-luxury-cream overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-luxury-gold/20 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <FiRotateCw className="text-luxury-gold animate-spin-slow" size={20} />
              <div>
                <h3 className="font-serif text-lg md:text-xl text-white font-light">
                  Vue 360° — {productName || 'Création Hafrose'}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-luxury-gold/70 font-sans">
                  Glissez pour faire pivoter la pièce
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 border border-luxury-gold/20 hover:border-luxury-gold text-luxury-gold/70 hover:text-luxury-gold transition-colors"
              aria-label="Fermer la vue 360°"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Interactive Drag Area */}
          <div
            className="relative aspect-square md:aspect-[16/10] bg-black/40 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <motion.img
              key={frameIndex}
              src={frames[frameIndex]}
              alt={`${productName} vue à 360 degrés - angle ${frameIndex + 1}`}
              className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-100"
            />

            {/* Hint overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card-dark px-4 py-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-luxury-cream/80 pointer-events-none">
              <FiMove size={14} className="text-luxury-gold" />
              <span>Faire glisser horizontalement</span>
            </div>

            {/* Angle Indicator */}
            <div className="absolute top-4 right-4 text-[10px] tracking-widest uppercase font-mono text-luxury-gold/60">
              {Math.round(((frameIndex + 1) / totalFrames) * 360)}°
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 text-center text-[10px] uppercase tracking-widest text-luxury-cream/40 font-sans">
            Maison Hafrose — Haute Maroquinerie et Joaillerie Fine
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default Product360Viewer;
