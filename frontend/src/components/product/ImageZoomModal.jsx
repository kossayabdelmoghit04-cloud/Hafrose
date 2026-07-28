import { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZoomIn, FiMaximize2 } from 'react-icons/fi';

/**
 * ImageZoomModal — HAFROSE v3.0
 * Modale de zoom HD pour inspecter les matières, finitions et coutures sellier.
 */
const ImageZoomModal = memo(function ImageZoomModal({ imageSrc, isOpen, onClose, productName = '' }) {
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/90 backdrop-blur-lg"
        onClick={onClose}
      >
        <div
          className="relative max-w-5xl w-full h-[90vh] flex flex-col justify-between p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between z-10 text-white">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase text-luxury-gold font-sans font-semibold">
                Inspection Haute Définition
              </div>
              <h3 className="font-serif text-lg text-white font-light">
                {productName}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="px-3 py-1.5 border border-luxury-gold/30 hover:border-luxury-gold text-[10px] uppercase tracking-widest text-luxury-cream flex items-center gap-1.5 transition-colors"
              >
                <FiZoomIn size={14} className="text-luxury-gold" />
                <span>{isZoomed ? 'Vue Normale' : 'Loupe 200%'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold transition-colors"
                aria-label="Fermer la vue grand angle"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Main Zoom Display */}
          <div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onClick={() => setIsZoomed(!isZoomed)}
            className="relative flex-grow flex items-center justify-center overflow-hidden my-4 cursor-zoom-in"
          >
            <img
              src={imageSrc}
              alt={productName}
              className={`max-h-full max-w-full object-contain transition-transform duration-200 ${
                isZoomed ? 'scale-[2.2]' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : {}
              }
            />

            {!isZoomed && (
              <div className="absolute bottom-6 glass-card-dark px-4 py-2 text-[10px] uppercase tracking-widest text-luxury-cream/75 pointer-events-none flex items-center gap-2">
                <FiMaximize2 className="text-luxury-gold" size={12} />
                <span>Cliquer pour activer le zoom ultra-précision</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center text-[9px] tracking-[0.3em] uppercase text-luxury-cream/40 font-sans">
            Appréciez la noblesse du cuir pleine fleur et le sertissage des finitions.
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default ImageZoomModal;
