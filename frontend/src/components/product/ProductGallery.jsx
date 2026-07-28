import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

/**
 * ProductGallery — HAFROSE Design System Phase 3
 * Galerie produit HD avec Lens Zoom, Lightbox Fullscreen, navigation au clavier (flèches),
 * et carrousel de vignettes.
 */

const ProductGallery = memo(function ProductGallery({ images = [], productName = 'Produit', onOpen360, onOpenZoom }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Lens Zoom State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);

  const galleryImages = images.length > 0 ? images : ['https://hafrose.com/og-default.jpg'];
  const currentImg = galleryImages[activeIdx] || galleryImages[0];

  // Gestion du survol Lens Zoom
  const handleMouseMove = useCallback((e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  }, []);

  // Keyboard Navigation (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages.length, isLightboxOpen]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Image Principale ── */}
      <div
        ref={imageContainerRef}
        className="relative w-full aspect-[4/5] bg-blush overflow-hidden border border-beige cursor-zoom-in group"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
      >
        {/* Main Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={currentImg}
            alt={`${productName} — Vue ${activeIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full h-full object-cover object-center ${isZooming ? 'opacity-0 md:opacity-0' : 'opacity-100'}`}
          />
        </AnimatePresence>

        {/* Lens Zoom Container (Desktop) */}
        {isZooming && (
          <div
            className="hidden md:block absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              backgroundImage: `url(${currentImg})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: '220%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {/* Bouton Fullscreen & 360° & Zoom HD */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10 opacity-90 hover:opacity-100 transition-opacity">
          {onOpen360 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpen360(); }}
              className="bg-anthracite/80 text-luxury-gold hover:bg-anthracite px-3 py-1.5 rounded-none text-[9px] uppercase tracking-widest font-sans flex items-center gap-1.5 border border-luxury-gold/30 shadow-md backdrop-blur-sm transition-all"
              aria-label="Ouvrir la vue 360°"
            >
              <span>Vue 360°</span>
            </button>
          )}
          {onOpenZoom && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenZoom(); }}
              className="bg-off-white/90 text-anthracite hover:text-rose-gold px-3 py-1.5 rounded-none text-[9px] uppercase tracking-widest font-sans flex items-center gap-1.5 shadow-md backdrop-blur-sm transition-all"
              aria-label="Ouvrir le zoom haute définition"
            >
              <span>Zoom HD</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
          className="absolute top-4 right-4 bg-off-white/90 text-anthracite p-2.5 rounded-full shadow-md hover:bg-off-white hover:text-rose-gold transition-colors z-10"
          aria-label="Agrandir en plein écran"
        >
          <FiMaximize2 size={16} />
        </button>

        {/* Flèches de navigation rapide sur l'image */}
        {galleryImages.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
              }}
              className="pointer-events-auto bg-off-white/90 text-anthracite hover:text-rose-gold p-2 rounded-full shadow-md"
              aria-label="Image précédente"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
              }}
              className="pointer-events-auto bg-off-white/90 text-anthracite hover:text-rose-gold p-2 rounded-full shadow-md"
              aria-label="Image suivante"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ── Vignettes (Thumbnails) ── */}
      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative flex-shrink-0 w-20 h-24 border-2 transition-all ${
                idx === activeIdx ? 'border-rose-gold opacity-100' : 'border-beige opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox Fullscreen Modal ── */}
      {isLightboxOpen && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-anthracite/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Header / Fermer */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
              <span className="font-sans text-xs text-off-white/70 tracking-widest uppercase">
                {activeIdx + 1} / {galleryImages.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="text-off-white hover:text-rose-poudre p-2"
                aria-label="Fermer"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Image Fullscreen */}
            <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={currentImg}
                alt={productName}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              />

              {/* Navigation Flèches */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                    className="absolute -left-12 top-1/2 -translate-y-1/2 text-off-white hover:text-rose-poudre p-3"
                    aria-label="Précédent"
                  >
                    <FiChevronLeft size={32} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 text-off-white hover:text-rose-poudre p-3"
                    aria-label="Suivant"
                  >
                    <FiChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
});

export default ProductGallery;
