import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiCheck, FiEdit3 } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

/**
 * GiftOptionsModal — HAFROSE v3.0
 * Option d'écrin cadeau signature offert & rédaction de carte manuscrite avec sceau de cire.
 */
const GiftOptionsModal = memo(function GiftOptionsModal({ isOpen, onClose, onSave, initialMessage = '' }) {
  const [giftBox, setGiftBox] = useState(true);
  const [cardMessage, setCardMessage] = useState(initialMessage);
  const [senderName, setSenderName] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        giftBox,
        cardMessage,
        senderName,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Backdrop className="bg-anthracite/70 backdrop-blur-md" />
      <Modal.Container className="bg-off-white relative border border-luxury-gold/30 p-8 max-w-lg overflow-hidden">
        <Modal.CloseButton onClick={onClose} className="top-4 right-4" />

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b border-beige pb-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center mx-auto border border-luxury-gold/30">
              <FiGift size={22} />
            </div>
            <span className="text-overline block">Service Signature Offert</span>
            <h3 className="font-serif text-2xl text-luxury-charcoal font-light">
              Écrin Cadeau & Carte Manuscrite
            </h3>
            <p className="text-xs font-sans text-luxury-gray font-light max-w-sm mx-auto">
              Chaque pièce est emballée dans notre boîte signature avec ruban de soie et carte scellée à la cire.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">

            {/* Gift Box Toggle */}
            <div
              onClick={() => setGiftBox(!giftBox)}
              className={`p-4 border flex items-center justify-between cursor-pointer transition-colors ${
                giftBox ? 'border-luxury-gold bg-luxury-gold/5' : 'border-beige bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                  giftBox ? 'border-luxury-gold bg-luxury-gold text-white' : 'border-beige'
                }`}>
                  {giftBox && <FiCheck size={12} />}
                </div>
                <div>
                  <div className="text-xs font-sans font-medium text-luxury-charcoal uppercase tracking-wider">
                    Écrin Signature & Ruban Soie
                  </div>
                  <div className="text-[10px] text-luxury-gray font-light">Inclus sans frais supplémentaires</div>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold">Offert</span>
            </div>

            {/* Handwritten Message */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-luxury-charcoal font-medium flex items-center justify-between">
                <span>Message Personnalisé (Carte Dorée)</span>
                <span className="text-luxury-gray/60 font-mono text-[9px]">{cardMessage.length}/200</span>
              </label>
              <textarea
                rows={4}
                maxLength={200}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="Rédigez votre message d'attention ici... Nos calligraphes le retranscriront à l'encre sur carte dorée."
                className="w-full p-3 bg-white border border-beige text-xs font-serif italic text-luxury-charcoal placeholder:font-sans placeholder:not-italic placeholder:text-luxury-gray/40 focus:border-luxury-gold outline-none resize-none"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1 font-medium">
                Signature de la Carte (Optionnel)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Ex: De la part de Marie"
                className="w-full px-3 py-2 bg-white border border-beige text-xs text-luxury-charcoal placeholder:text-luxury-gray/40 focus:border-luxury-gold outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end gap-3 border-t border-beige">
              <Button variant="ghost" size="md" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" variant="luxury" size="md">
                Enregistrer l'Écrin
              </Button>
            </div>
          </form>
        </div>
      </Modal.Container>
    </Modal>
  );
});

export default GiftOptionsModal;
