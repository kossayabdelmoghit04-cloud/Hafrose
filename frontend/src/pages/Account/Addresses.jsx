import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import addressService from '../../services/addressService';
import AddressModal from '../../components/account/AddressModal';
import useSEO from '../../hooks/useSEO';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  useSEO({
    title: 'Adresses de Livraison — Espace Client',
    description: 'Gérez vos adresses de livraison et de facturation Maison Hafrose.',
  });

  const loadAddresses = () => {
    setAddresses(addressService.getAll());
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddr(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddr(addr);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      await addressService.delete(id);
      loadAddresses();
    }
  };

  const handleSetDefault = async (id) => {
    await addressService.setDefault(id);
    loadAddresses();
  };

  const handleSave = async (formData) => {
    if (editingAddr) {
      await addressService.update(editingAddr.id, formData);
    } else {
      await addressService.add(formData);
    }
    loadAddresses();
  };

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-beige pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-luxury-charcoal">
            Adresses de Livraison
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light mt-1">
            Gérez vos adresses enregistrées pour accélérer vos prochaines commandes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-4 py-3 hover:bg-rose-gold transition-colors flex items-center gap-1.5"
        >
          <FiPlus size={14} /> Ajouter une adresse
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border border-beige p-12 text-center space-y-4">
          <FiMapPin size={40} className="mx-auto text-warm-gray/40" />
          <p className="font-sans text-xs text-warm-gray">Aucune adresse enregistrée.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest px-5 py-3 hover:bg-rose-gold transition-colors"
          >
            Ajouter une adresse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border p-6 flex flex-col justify-between space-y-4 relative ${
                addr.is_default ? 'border-rose-gold ring-1 ring-rose-gold/20' : 'border-beige'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs uppercase tracking-widest font-semibold text-luxury-charcoal">
                    {addr.title || 'Adresse'}
                  </span>
                  {addr.is_default && (
                    <span className="font-sans text-[9px] uppercase tracking-wider bg-rose-gold/10 text-rose-gold border border-rose-gold/20 px-2 py-0.5 font-medium flex items-center gap-1">
                      <FiCheck size={10} /> Par défaut
                    </span>
                  )}
                </div>

                <div className="font-sans text-xs text-luxury-charcoal font-light space-y-1 pt-1">
                  <p className="font-medium">{addr.name}</p>
                  <p>{addr.address}</p>
                  <p>{addr.postal_code} {addr.city}, {addr.country}</p>
                  <p className="text-warm-gray mt-1">{addr.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-beige pt-4 font-sans text-[10px] uppercase tracking-widest">
                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-warm-gray hover:text-rose-gold transition-colors"
                  >
                    Définir par défaut
                  </button>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="text-warm-gray hover:text-luxury-charcoal flex items-center gap-1 transition-colors"
                    aria-label="Modifier l'adresse"
                  >
                    <FiEdit2 size={12} /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="text-warm-gray hover:text-red-600 flex items-center gap-1 transition-colors"
                    aria-label="Supprimer l'adresse"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        addressToEdit={editingAddr}
      />
    </div>
  );
}
