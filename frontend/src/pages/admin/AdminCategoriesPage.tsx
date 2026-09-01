import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, FolderTree, X, XCircle, Image, Upload } from 'lucide-react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';
import { getImageUrl } from '../../utils/formatters';
import { Category } from '../../types/models';

export const AdminCategoriesPage: React.FC = () => {
  useSEO({ title: 'Gestion des Catégories | HAFROSE Admin', noIndex: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const imageFileRef = useRef<HTMLInputElement | null>(null);

  const { data: categoriesData, isLoading, isError, refetch } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categoriesList: Category[] = categoriesData?.data ?? [];

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setFormError('');
    setImagePreview(null);
    setCurrentImageUrl(null);
    if (imageFileRef.current) imageFileRef.current.value = '';
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setFormError('');
    setImagePreview(null);
    setCurrentImageUrl(cat.image_url ? getImageUrl(cat.image_url) : null);
    if (imageFileRef.current) imageFileRef.current.value = '';
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Le nom de la catégorie est obligatoire.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    if (slug) formData.append('slug', slug.trim());
    if (description) formData.append('description', description.trim());
    if (imageFileRef.current?.files?.[0]) {
      formData.append('image', imageFileRef.current.files[0]);
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'enregistrement.';
      setFormError(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeletingId(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Impossible de supprimer cette catégorie.';
      alert(errorMsg);
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
        message="Impossible de charger les catégories depuis le serveur."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <div>
          <h2 className="font-serif text-xl text-white font-medium">Catégories d'Articles</h2>
          <p className="text-xs text-neutral-400">Organisation du catalogue de luxe HAFROSE</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-burgundy-800 hover:bg-burgundy-700 text-white text-sm font-medium rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* CATEGORIES TABLE */}
      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Nom</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {categoriesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <FolderTree className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <span>Aucune catégorie trouvée.</span>
                  </td>
                </tr>
              ) : (
                categoriesList.map((c: Category) => (
                  <tr key={c.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-neutral-400">#{c.id}</td>
                    <td className="py-3.5 px-4">
                      {c.image_url ? (
                        <img
                          src={getImageUrl(c.image_url)}
                          alt={c.name}
                          className="w-10 h-10 rounded-lg object-cover border border-neutral-700"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                          <Image className="w-4 h-4 text-neutral-600" />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white text-sm">{c.name}</td>
                    <td className="py-3.5 px-4 text-amber-400 font-mono">{c.slug}</td>
                    <td className="py-3.5 px-4 text-neutral-300 max-w-md truncate">
                      {c.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          title="Modifier"
                          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
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
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-serif text-xl text-white">
                {editingCategory ? `Modifier Catégorie #${editingCategory.id}` : 'Nouvelle Catégorie'}
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
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nom de la Catégorie *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Slug URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Image de Catégorie</label>
                <p className="text-[10px] text-neutral-500">JPEG, PNG, WEBP · Max 5 Mo</p>
                {(imagePreview ?? currentImageUrl) && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-neutral-700">
                    <img
                      src={imagePreview ?? currentImageUrl ?? ''}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs text-neutral-300 hover:text-white transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choisir une image</span>
                  <input
                    ref={imageFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                  />
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
                  {editingCategory ? 'Mettre à jour' : 'Créer la catégorie'}
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
              Êtes-vous sûr de vouloir supprimer cette catégorie ?
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
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
