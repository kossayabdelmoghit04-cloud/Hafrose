import React from 'react';

interface ProductDeleteModalProps {
  deletingId: number | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  deletingId,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!deletingId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-6">
        <h3 className="font-serif text-lg text-white">Confirmer la suppression</h3>
        <p className="text-xs text-neutral-300">
          Êtes-vous sûr de vouloir supprimer le produit #{deletingId} ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(deletingId)}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
};
