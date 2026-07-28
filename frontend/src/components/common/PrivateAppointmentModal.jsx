import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiCheck, FiUser, FiMail, FiPhone, FiCompass } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

/**
 * PrivateAppointmentModal — HAFROSE v3.0
 * Réservation d'un rendez-vous privé en salon ouvisioconférence VIP avec un Conseiller de la Maison.
 */
const PrivateAppointmentModal = memo(function PrivateAppointmentModal({ isOpen, onClose, productName = '' }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'salon', // 'salon' | 'visio'
    date: '',
    time: '14:00',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Auto reset after feedback
    }, 3000);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleReset} size="lg">
      <Modal.Backdrop className="bg-anthracite/70 backdrop-blur-md" />
      <Modal.Container className="bg-off-white relative border border-luxury-gold/30 p-8 max-w-2xl overflow-hidden">
        <Modal.CloseButton onClick={handleReset} className="top-4 right-4" />

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-luxury-gold/20 text-luxury-gold flex items-center justify-center mx-auto border border-luxury-gold/40">
                <FiCheck size={28} />
              </div>

              <div className="space-y-2">
                <span className="text-overline block">Confirmation Conciergerie</span>
                <h3 className="font-serif text-2xl text-luxury-charcoal font-light">
                  Votre Demande est Enregistrée
                </h3>
                <p className="text-sm font-sans text-luxury-gray max-w-md mx-auto font-light leading-relaxed">
                  Votre conseiller personnel prendra contact avec vous dans les 2 heures pour confirmer
                  votre rendez-vous privé {form.type === 'salon' ? 'au Salon Faubourg Saint-Honoré' : 'en Visioconférence VIP'}.
                </p>
              </div>

              <div className="pt-4">
                <Button variant="luxury" size="md" onClick={handleReset}>
                  Retour à l'Expérience
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-6">
              {/* Header */}
              <div className="space-y-2 text-center border-b border-beige pb-6">
                <span className="text-overline block">Conciergerie Privée</span>
                <h3 className="font-serif text-2xl text-luxury-charcoal font-light">
                  Réserver une Présentation Privée
                </h3>
                <p className="text-xs font-sans text-luxury-gray font-light max-w-md mx-auto">
                  Bénéficiez d'un accompagnement sur-mesure dédié à la découverte de nos pièces d'exception
                  {productName ? ` (${productName})` : ''}.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Service Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'salon' })}
                    className={`p-4 border text-left transition-all ${
                      form.type === 'salon'
                        ? 'border-luxury-gold bg-luxury-gold/5 text-luxury-charcoal'
                        : 'border-beige text-luxury-gray hover:border-luxury-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FiCompass className="text-luxury-gold" size={16} />
                      <span className="font-sans text-xs font-medium uppercase tracking-wider">Salon Privé Paris</span>
                    </div>
                    <p className="text-[10px] text-luxury-gray font-light">12 Rue du Faubourg Saint-Honoré, 75008 Paris</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'visio' })}
                    className={`p-4 border text-left transition-all ${
                      form.type === 'visio'
                        ? 'border-luxury-gold bg-luxury-gold/5 text-luxury-charcoal'
                        : 'border-beige text-luxury-gray hover:border-luxury-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FiCalendar className="text-luxury-gold" size={16} />
                      <span className="font-sans text-xs font-medium uppercase tracking-wider">Visioconférence VIP</span>
                    </div>
                    <p className="text-[10px] text-luxury-gray font-light">Présentation en direct avec écrin HD</p>
                  </button>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1 font-medium">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Mme. / M. Votre Nom"
                        className="w-full px-3 py-2.5 bg-white border border-beige text-xs text-luxury-charcoal placeholder:text-luxury-gray/40 focus:border-luxury-gold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1 font-medium">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full px-3 py-2.5 bg-white border border-beige text-xs text-luxury-charcoal placeholder:text-luxury-gray/40 focus:border-luxury-gold outline-none"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1 font-medium">
                      Date souhaitée *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-beige text-xs text-luxury-charcoal focus:border-luxury-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1 font-medium">
                      Créneau horaire
                    </label>
                    <select
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-beige text-xs text-luxury-charcoal focus:border-luxury-gold outline-none"
                    >
                      <option value="10:00">10:00 - 11:00</option>
                      <option value="11:30">11:30 - 12:30</option>
                      <option value="14:00">14:00 - 15:00</option>
                      <option value="15:30">15:30 - 16:30</option>
                      <option value="17:00">17:00 - 18:00</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end gap-3">
                  <Button variant="ghost" size="md" onClick={handleReset}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="luxury" size="md">
                    Confirmer la Demande
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal.Container>
    </Modal>
  );
});

export default PrivateAppointmentModal;
