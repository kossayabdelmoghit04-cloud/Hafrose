import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Swal from 'sweetalert2';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiX, 
  FiUpload, 
  FiImage 
} from 'react-icons/fi';
import MediaPickerModal from '../../components/common/MediaPickerModal';

export default function Categories() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // États du formulaire
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedMediaPath, setSelectedMediaPath] = useState('');

  // Charger les catégories
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.get('/admin/categories').then(res => res.data),
  });

  // Mutation pour la création
  const createMutation = useMutation({
    mutationFn: (formData) => api.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Succès !', 'La catégorie a été créée.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
        closeModal();
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.errors?.slug ? 'Ce slug est déjà pris.' : err.message, 'error');
    }
  });

  // Mutation pour la modification
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => api.post(`/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Succès !', 'La catégorie a été modifiée.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
        closeModal();
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.errors?.slug ? 'Ce slug est déjà pris.' : err.message, 'error');
    }
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Supprimé !', 'La catégorie a été supprimée.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'Impossible de supprimer cette catégorie car elle contient des produits.', 'error');
    }
  });

  // Générer automatiquement le slug à partir du nom
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (!editingCategory) {
      setSlug(
        value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      );
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setImagePreview(category.image || '');
      setSelectedMediaPath('');
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setDescription('');
      setImagePreview('');
      setSelectedMediaPath('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setSelectedMediaPath(''); // réinitialiser la médiathèque si upload direct
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaSelected = (media) => {
    setSelectedMediaPath(media.path); // Stocker le chemin relatif pour le serveur
    setImagePreview(media.url);       // Utiliser l'URL publique pour l'aperçu
    setImageFile(null);               // réinitialiser l'upload de fichier
    setIsMediaPickerOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (selectedMediaPath) {
      formData.append('image_path', selectedMediaPath);
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (category) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous allez supprimer la catégorie "${category.name}". Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111111',
      cancelButtonColor: '#7F7F7F',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(category.id);
      }
    });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <Loader fullPage />;
  if (error) return <div className="text-red-500">Erreur : {error.message}</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title & Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-luxury-charcoal">Gestion des Catégories</h2>
          <p className="text-sm text-luxury-gray">Organisez et gérez le catalogue de produits Hafrose.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal border border-luxury-gold/30 rounded text-sm transition-all duration-300 font-semibold uppercase tracking-wider"
        >
          <FiPlus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white items-center gap-3 px-4 py-3 rounded border border-luxury-gold/15 max-w-md shadow-sm">
        <FiSearch className="text-luxury-gray" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une catégorie par nom ou slug..."
          className="w-full bg-transparent border-none outline-none text-sm text-luxury-charcoal"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-luxury-gold/10 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-luxury-light-gray/40 border-b border-luxury-gold/10 text-xs text-luxury-gray uppercase tracking-wider">
                <th className="px-6 py-4 w-24">Image</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-b border-luxury-light-gray last:border-b-0 hover:bg-luxury-light-gray/20 transition-all duration-200">
                  <td className="px-6 py-4">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-12 h-12 rounded object-cover border border-luxury-gold/10"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-luxury-light-gray flex items-center justify-center text-luxury-gray rounded border border-dashed border-luxury-gray/30">
                        <FiImage className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-luxury-charcoal">{category.name}</td>
                  <td className="px-6 py-4 text-luxury-gray font-mono text-xs">{category.slug}</td>
                  <td className="px-6 py-4 text-luxury-gray max-w-xs truncate">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(category)}
                        className="p-2 hover:bg-luxury-gold/10 text-luxury-charcoal hover:text-luxury-gold rounded transition-all duration-200"
                        title="Modifier"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-all duration-200"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-luxury-gray">
                    Aucune catégorie trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-luxury-cream border border-luxury-gold/30 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center px-6 py-4 bg-luxury-charcoal text-white border-b border-luxury-gold/20">
              <h3 className="font-serif text-lg text-luxury-gold">
                {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
              </h3>
              <button onClick={closeModal} className="p-1 text-luxury-gray hover:text-white rounded">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="ex: Arts de la Table"
                  className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Slug (généré automatiquement)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex: arts-de-la-table"
                  className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm font-mono text-xs transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brève description de la catégorie..."
                  rows="3"
                  className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm resize-none transition-all duration-300"
                />
              </div>

              {/* Image upload & preview */}
              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Image de la catégorie
                </label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded bg-white border border-luxury-gold/15 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage className="w-8 h-8 text-luxury-light-gray" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-luxury-gold/25 hover:border-luxury-gold rounded text-xs cursor-pointer text-luxury-charcoal font-semibold transition-all duration-300">
                        <FiUpload />
                        <span>Téléverser</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal rounded text-xs font-semibold transition-all duration-300"
                      >
                        <FiImage />
                        <span>Médiathèque</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-luxury-gray">
                      Recommandé : 600x600 px (JPEG, PNG, WEBP), max 5 Mo.
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-luxury-light-gray hover:bg-luxury-gray/10 text-luxury-charcoal rounded text-sm transition-all duration-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal rounded text-sm transition-all duration-300 font-semibold uppercase tracking-wider text-xs"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Media Library Picker */}
      {isMediaPickerOpen && (
        <MediaPickerModal 
          onClose={() => setIsMediaPickerOpen(false)} 
          onSelect={handleMediaSelected} 
        />
      )}
    </div>
  );
}
