import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';

export default function AddressModal({ isOpen, onClose, onSave, addressToEdit = null }) {
  const [form, setForm] = useState({
    title: '',
    name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    phone: '',
    is_default: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (addressToEdit) {
      setForm(addressToEdit);
    } else {
      setForm({
        title: '',
        name: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'France',
        phone: '',
        is_default: false,
      });
    }
    setErrors({});
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom du destinataire est requis.';
    if (!form.address.trim()) errs.address = 'L\'adresse est requise.';
    if (!form.city.trim()) errs.city = 'La ville est requise.';
    if (!form.postal_code.trim()) errs.postal_code = 'Le code postal est requis.';
    if (!form.phone.trim()) errs.phone = 'Le téléphone est requis.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-anthracite/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-off-white border border-beige w-full max-w-lg p-8 shadow-2xl relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-warm-gray hover:text-luxury-charcoal p-2"
            aria-label="Fermer"
          >
            <FiX size={20} />
          </button>

          <h3 className="font-serif text-2xl text-luxury-charcoal font-light mb-6">
            {addressToEdit ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                Intitulé (ex: Domicile, Bureau)
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Domicile"
                className="w-full border border-beige bg-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                Nom du destinataire <span className="text-rose-gold">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Mme Marie Dupont"
                className="w-full border border-beige bg-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                Adresse complète <span className="text-rose-gold">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="12, Avenue Montaigne"
                className="w-full border border-beige bg-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
              />
              {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                  Code Postal <span className="text-rose-gold">*</span>
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  placeholder="75008"
                  className="w-full border border-beige bg-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                />
                {errors.postal_code && <p className="text-red-500 text-[10px] mt-1">{errors.postal_code}</p>}
              </div>
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                  Ville <span className="text-rose-gold">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Paris"
                  className="w-full border border-beige bg-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
                />
                {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city}</p>}
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-1">
                Téléphone <span className="text-rose-gold">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="w-full border border-beige bg-white px-3 py-2.5 font-sans text-xs text-luxury-charcoal focus:outline-none focus:border-rose-gold"
              />
              {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
            </div>

            <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_default"
                checked={form.is_default}
                onChange={handleChange}
                className="sr-only peer"
              />
              <span className="w-4 h-4 border border-beige bg-white peer-checked:bg-luxury-charcoal peer-checked:border-luxury-charcoal flex items-center justify-center transition-colors">
                <FiCheck size={10} className="text-white opacity-0 peer-checked:opacity-100" />
              </span>
              <span className="font-sans text-xs text-luxury-charcoal">
                Définir comme adresse de livraison par défaut
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-6 border-t border-beige mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-luxury-charcoal"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest hover:bg-rose-gold transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
