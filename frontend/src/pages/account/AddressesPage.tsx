import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit3, CheckCircle2, Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '../../hooks/useAccountHooks';
import { UserAddress } from '../../types/models';

const MOCK_FALLBACK_ADDRESSES: UserAddress[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Résidence Principale (Paris)',
    name: 'Mme. Éléonore De Saint-Germain',
    address: '124 Avenue Montaigne',
    city: 'Paris',
    postal_code: '75008',
    country: 'France',
    phone: '+33 6 12 34 56 78',
    is_default: true,
    created_at: '',
  },
  {
    id: 2,
    user_id: 1,
    title: 'Maison de Campagne (Cannes)',
    name: 'Mme. Éléonore De Saint-Germain',
    address: '42 Boulevard de la Croisette',
    city: 'Cannes',
    postal_code: '06400',
    country: 'France',
    phone: '+33 6 98 76 54 32',
    is_default: false,
    created_at: '',
  },
];

export const AddressesPage: React.FC = () => {
  const { data: apiAddresses, isLoading, isError, refetch } = useAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  const [localAddresses, setLocalAddresses] = useState<UserAddress[]>(MOCK_FALLBACK_ADDRESSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const addresses = (apiAddresses && apiAddresses.length > 0) ? apiAddresses : localAddresses;

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    phone: '',
    is_default: false,
  });

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setFormData({
      title: '',
      name: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'France',
      phone: '',
      is_default: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setFormData({
      title: addr.title,
      name: addr.name,
      address: addr.address,
      city: addr.city,
      postal_code: addr.postal_code,
      country: addr.country || 'France',
      phone: addr.phone || '',
      is_default: addr.is_default,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
    } catch {
      setLocalAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddressMutation.mutateAsync(id);
    } catch {
      setLocalAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({ id: editingAddress.id, payload: formData });
      } else {
        await addAddressMutation.mutateAsync(formData);
      }
    } catch {
      // Local fallback for offline preview
      if (editingAddress) {
        setLocalAddresses((prev) =>
          prev.map((a) => (a.id === editingAddress.id ? { ...a, ...formData } : a))
        );
      } else {
        const newAddr: UserAddress = {
          id: Date.now(),
          user_id: 1,
          ...formData,
          created_at: new Date().toISOString(),
        };
        setLocalAddresses((prev) => [...prev, newAddr]);
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="font-serif text-h2 text-neutral-950">Mes Adresses de Livraison</h1>
          <p className="text-body-sm text-neutral-600">
            Gérez vos adresses pour accélérer vos futurs achats HAFROSE.
          </p>
        </div>

        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
          Ajouter une Adresse
        </Button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-md" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      )}

      {/* Error State */}
      {isError && !apiAddresses && (
        <ErrorState
          title="Erreur de chargement"
          message="Impossible de synchroniser vos adresses avec le serveur."
          onRetry={() => refetch()}
        />
      )}

      {/* Address Cards Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <Card key={addr.id} className="p-6 bg-white space-y-4 relative flex flex-col justify-between border-neutral-200/80">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-h4 text-neutral-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-burgundy-500" /> {addr.title}
                  </span>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-caption font-semibold uppercase bg-burgundy-50 text-burgundy-700 px-2.5 py-0.5 rounded-xs border border-burgundy-100 shadow-hafrose-xs">
                      <Star className="w-3 h-3 fill-burgundy-500 text-burgundy-500" /> Principale
                    </span>
                  )}
                </div>

                <div className="text-body-sm text-neutral-700 space-y-0.5">
                  <p className="font-semibold text-neutral-950">{addr.name}</p>
                  <p>{addr.address}</p>
                  <p>{addr.postal_code} {addr.city}, {addr.country}</p>
                  {addr.phone && <p className="text-neutral-500 pt-1">Tél : {addr.phone}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                {!addr.is_default ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-caption font-medium text-burgundy-600 hover:underline"
                  >
                    Définir par défaut
                  </button>
                ) : (
                  <span className="text-caption text-success-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Adresse par défaut
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Modifier l'adresse"
                    onClick={() => handleOpenEditModal(addr)}
                    className="p-1.5 text-neutral-500 hover:text-burgundy-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Supprimer l'adresse"
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-neutral-400 hover:text-error-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Modifier l\'Adresse' : 'Ajouter une Nouvelle Adresse'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nom de l'adresse (ex: Domicile, Bureau)"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Résidence Principale"
          />
          <Input
            label="Nom du Destinataire"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Mme. Éléonore De Saint-Germain"
          />
          <Input
            label="Adresse de rue"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="124 Avenue Montaigne"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code Postal"
              required
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="75008"
            />
            <Input
              label="Ville"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Paris"
            />
          </div>
          <Select
            label="Pays"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            options={[
              { value: 'France', label: 'France' },
              { value: 'Belgique', label: 'Belgique' },
              { value: 'Luxembourg', label: 'Luxembourg' },
              { value: 'Suisse', label: 'Suisse' },
            ]}
          />
          <Input
            label="Téléphone de Contact"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+33 6 12 34 56 78"
          />
          <Checkbox
            label="Définir comme adresse principale"
            checked={formData.is_default}
            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button type="button" variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
            >
              Enregistrer l'Adresse
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddressesPage;

