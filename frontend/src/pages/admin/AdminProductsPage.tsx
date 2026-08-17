import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';

import {
  useAdminProducts,
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { LazyImage } from '../../components/ui/LazyImage/LazyImage';
import { useSEO } from '../../hooks/useSEO';
import { formatPrice, getImageUrl, slugify } from '../../utils/formatters';

export const AdminProductsPage: React.FC = () => {
  useSEO({ title: 'Gestion des Produits | HAFROSE Admin', noIndex: true });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
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

  // Hooks
  const { data: productsData, isLoading, isError, refetch } = useAdminProducts({
    page,
    search: search || undefined,
    category_id: selectedCategory || undefined,
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useAdminCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const productsList = productsData?.data || (Array.isArray(productsData) ? productsData : []);
  const meta = productsData?.meta;
  const categoriesList = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.data && Array.isArray(categoriesData.data)
      ? categoriesData.data
      : []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categoriesList.length > 0 ? String(categoriesList[0].id) : '');
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
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setName(product.name || '');
    const catId = product.category_id ?? product.category?.id;
    setCategoryId(catId ? String(catId) : (categoriesList.length > 0 ? String(categoriesList[0].id) : ''));
    setPrice(String(product.price || ''));
    setSalePrice(product.sale_price ? String(product.sale_price) : '');
    setStock(String(product.stock ?? 10));
    setColor(product.color || '');
    setMaterial(product.material || '');
    setDescription(product.description || '');
    setIsFeatured(Boolean(product.is_featured));
    setImageFile(null);
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

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
    formData.append('price', price);
    if (salePrice.trim() !== '') {
      formData.append('sale_price', salePrice.trim());
    } else if (editingProduct) {
      formData.append('sale_price', '');
    }
    formData.append('stock', stock);
    if (color) formData.append('color', color);
    if (material) formData.append('material', material);
    formData.append('description', description.trim());
    formData.append('is_featured', isFeatured ? '1' : '0');

    // Only append image if a file was actually selected
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      if (err?.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors);
        setFormError(err.message || 'Veuillez corriger les erreurs de validation.');
      } else {
        setFormError(err?.message || 'Une erreur est survenue lors de l enregistrement.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeletingId(null);
    } catch (err: any) {
      alert(err?.message || 'Impossible de supprimer ce produit.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="xl" variant="burgundy" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible d obtenir la liste des produits depuis le serveur."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un produit (nom, référence)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Toutes les catégories</option>
            {categoriesList.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Product Button */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-burgundy-800 hover:bg-burgundy-700 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-burgundy-900/40"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Visuel</th>
                <th className="py-3.5 px-4">Produit</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Prix</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">En Vedette</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {productsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <Package className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <span>Aucun produit trouvé dans le catalogue.</span>
                  </td>
                </tr>
              ) : (
                productsList.map((p: any) => (
                  <tr key={p.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex-shrink-0">
                        <LazyImage
                          src={getImageUrl(p.image)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white text-sm">{p.name}</p>
                      <p className="text-[10px] text-neutral-400">ID #{p.id} — {p.color || 'Standard'}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {p.category?.name || 'Général'}
                    </td>
                    <td className="py-3 px-4">
                      {p.sale_price && Number(p.sale_price) < Number(p.price) ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-burgundy-400 text-sm">
                            {formatPrice(Number(p.sale_price))}
                          </span>
                          <span className="text-[11px] text-neutral-400 line-through">
                            {formatPrice(Number(p.price))}
                          </span>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-burgundy-950/60 text-burgundy-300 border border-burgundy-800/50 w-max">
                            {p.discount_percentage ? `-${p.discount_percentage}%` : 'Soldé'}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-white">
                          {formatPrice(Number(p.price))}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        (p.stock ?? 10) > 0
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      }`}>
                        {p.stock ?? 10} en stock
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.is_featured ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Vedette
                        </span>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          title="Modifier"
                          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          title="Supprimer"
                          className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-neutral-900 flex justify-center">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-serif text-xl text-white">
                {editingProduct ? `Modifier #${editingProduct.id}` : 'Nouveau Produit HAFROSE'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {fieldErrors.slug && (
                    <p className="mt-1 text-[11px] text-rose-400 font-medium">Slug : {fieldErrors.slug[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Catégorie *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (fieldErrors.category_id) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.category_id;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2 bg-neutral-900 border rounded-xl text-sm text-white focus:outline-none transition-colors ${
                      fieldErrors.category_id ? 'border-rose-700 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-500/50'
                    }`}
                  >
                    {isCategoriesLoading ? (
                      <option value="" disabled>Chargement des catégories...</option>
                    ) : isCategoriesError ? (
                      <option value="" disabled>Erreur de chargement des catégories</option>
                    ) : categoriesList.length === 0 ? (
                      <option value="" disabled>Aucune catégorie disponible</option>
                    ) : (
                      <>
                        <option value="" disabled>-- Sélectionner une catégorie --</option>
                        {categoriesList.map((c: any) => (
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
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Prix (€) *</label>
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
                    Prix soldé (€) <span className="text-neutral-500 font-normal">(Optionnel, &lt; Prix)</span>
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-burgundy-800 hover:bg-burgundy-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-6">
            <h3 className="font-serif text-lg text-white">Confirmer la suppression</h3>
            <p className="text-xs text-neutral-300">
              Êtes-vous sûr de vouloir supprimer le produit #{deletingId} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
