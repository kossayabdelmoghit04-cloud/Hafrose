import React, { useState, useEffect } from 'react';
import { X, XCircle } from 'lucide-react';
import { Product, Category } from '../../../types/models';
import { getImageUrl, slugify } from '../../../utils/formatters';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: Category[];
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  categories,
  isCategoriesLoading,
  isCategoriesError,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      const catId = editingProduct.category_id ?? editingProduct.category?.id;
      setCategoryId(catId ? String(catId) : (categories.length > 0 ? String(categories[0].id) : ''));
      setPrice(String(editingProduct.price || ''));
      setSalePrice(editingProduct.sale_price ? String(editingProduct.sale_price) : '');
      setStock(String(editingProduct.stock ?? 10));
      setColor(editingProduct.color || '');
      setMaterial(editingProduct.material || '');
      setDescription(editingProduct.description || '');
      setIsFeatured(Boolean(editingProduct.is_featured));
      setImageFile(null);
      setFormError('');
      setFieldErrors({});
    } else {
      setName('');
      setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
      setPrice('');
      setSalePrice('');
      setStock('10');
      setColor('');
      setMaterial('');
      setDescription('');
      setIsFeatured(false);
      setImageFile(null);
      setFormError('');
      setFieldErrors({});
    }
  }, [editingProduct, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    if (!name.trim()) {
      setFormError('Le nom du produit est obligatoire.');
      return;
    }
    if (!categoryId || !String(categoryId).trim()) {
      setFieldErrors((prev) => ({ ...prev, category_id: ['La catégorie est obligatoire.'] }));
      setFormError('La catégorie est obligatoire.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError('Veuillez saisir un prix valide.');
      return;
    }
    if (salePrice.trim() !== '') {
      if (Number(salePrice) < 0) {
        setFormError('Le prix soldé ne peut pas être négatif.');
        return;
      }
      if (Number(salePrice) >= Number(price)) {
        setFormError('Le prix soldé doit être strictement inférieur au prix normal.');
        return;
      }
    }
    if (!description.trim()) {
      setFormError('La description du produit est obligatoire.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('slug', slugify(name));
    formData.append('category_id', String(categoryId));
    formData.append('price', String(price));
    if (salePrice.trim() !== '') {
      formData.append('sale_price', String(salePrice));
    }
    formData.append('stock', String(stock || '0'));
    if (color.trim()) formData.append('color', color.trim());
    if (material.trim()) formData.append('material', material.trim());
    formData.append('description', description.trim());
    formData.append('is_featured', isFeatured ? '1' : '0');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record<string, string[]>; message?: string };
      if (apiErr?.errors && typeof apiErr.errors === 'object') {
        setFieldErrors(apiErr.errors);
        setFormError(apiErr.message || 'Veuillez corriger les erreurs de validation.');
      } else {
        setFormError(apiErr?.message || "Une erreur est survenue lors de l'enregistrement.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h3 className="font-serif text-xl text-white">
            {editingProduct ? `Modifier Produit #${editingProduct.id}` : 'Nouveau Produit'}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {formError && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Nom du Produit *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 bg-neutral-900 border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                fieldErrors.name ? 'border-rose-700 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-500/50'
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-rose-400 font-medium">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Catégorie *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isCategoriesLoading}
                className={`w-full px-3.5 py-2 bg-neutral-900 border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                  fieldErrors.category_id ? 'border-rose-700 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-500/50'
                }`}
              >
                {isCategoriesLoading ? (
                  <option value="" disabled>Chargement des catégories...</option>
                ) : isCategoriesError ? (
                  <option value="" disabled>Erreur de chargement des catégories</option>
                ) : categories.length === 0 ? (
                  <option value="" disabled>Aucune catégorie disponible</option>
                ) : (
                  <>
                    <option value="" disabled>-- Sélectionner une catégorie --</option>
                    {categories.map((c: Category) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {fieldErrors.category_id && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">{fieldErrors.category_id[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Prix (MAD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full px-3.5 py-2 bg-neutral-900 border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                  fieldErrors.price ? 'border-rose-700 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-500/50'
                }`}
              />
              {fieldErrors.price && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">{fieldErrors.price[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Prix soldé (MAD) <span className="text-neutral-500 font-normal">(Optionnel, &lt; Prix)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 149.00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className={`w-full px-3.5 py-2 bg-neutral-900 border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                  fieldErrors.sale_price ? 'border-rose-700 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-500/50'
                }`}
              />
              {fieldErrors.sale_price && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">{fieldErrors.sale_price[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Stock disponible *</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`w-full px-3.5 py-2 bg-neutral-900 border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                  fieldErrors.stock ? 'border-rose-700 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-500/50'
                }`}
              />
              {fieldErrors.stock && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">{fieldErrors.stock[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Couleur</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Matière</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2 bg-neutral-900 border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                fieldErrors.description ? 'border-rose-700 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-500/50'
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-[11px] text-rose-400 font-medium">{fieldErrors.description[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Image Produit <span className="text-neutral-500 font-normal">(JPG, JPEG, PNG, WEBP — Max 5 Mo)</span>
            </label>
            {editingProduct?.image && !imageFile && (
              <div className="mb-2 flex items-center gap-3 p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                <img
                  src={getImageUrl(editingProduct.image)}
                  alt={editingProduct.name}
                  className="w-12 h-12 object-cover rounded-lg border border-neutral-700 bg-neutral-950 flex-shrink-0"
                />
                <div className="text-xs text-neutral-400 min-w-0">
                  <p className="text-neutral-200 font-medium">Image actuelle</p>
                  <p className="text-[11px] text-neutral-500 truncate">{editingProduct.image}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (fieldErrors.image) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.image;
                      return next;
                    });
                  }
                }}
                className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
              />
            </div>
            {imageFile && (
              <p className="mt-1.5 text-[11px] text-emerald-400">
                Fichier prêt à être envoyé : {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} Ko)
              </p>
            )}
            {fieldErrors.image && (
              <p className="mt-1 text-[11px] text-rose-400 font-medium flex items-center gap-1">
                <span>⚠️</span> {fieldErrors.image[0]}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded bg-neutral-900 border-neutral-800 text-burgundy-600 focus:ring-0"
            />
            <label htmlFor="is_featured" className="text-xs text-neutral-300">
              Mettre ce produit en vedette sur la page d'accueil
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-burgundy-800 hover:bg-burgundy-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
