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
  FiImage, 
  FiFilter, 
  FiStar 
} from 'react-icons/fi';
import MediaPickerModal from '../../components/common/MediaPickerModal';
import Button from '../../components/ui/Button';

export default function Products() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState('main'); // 'main' ou 'gallery'
  
  // États du produit en cours d'édition
  const [editingProduct, setEditingProduct] = useState(null);
  
  // États du formulaire
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [brand, setBrand] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedMainMediaPath, setSelectedMainMediaPath] = useState('');
  
  // Galerie d'images
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [newGalleryPaths, setNewGalleryPaths] = useState([]);
  const [existingGalleries, setExistingGalleries] = useState([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);

  // Charger les catégories pour le filtre et le formulaire
  const { data: categories = [] } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.get('/admin/categories').then(res => res.data),
  });

  // Charger les produits avec filtres
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['adminProducts', page, search, categoryFilter, featuredFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', 8);
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (featuredFilter) params.append('is_featured', featuredFilter);
      
      return api.get(`/admin/products?${params.toString()}`).then(res => res);
    },
    keepPreviousData: true,
  });

  // Mutation pour la création
  const createMutation = useMutation({
    mutationFn: (formData) => api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Succès !', 'Le produit a été créé.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        closeModal();
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.errors?.slug ? 'Ce slug est déjà pris.' : err.message, 'error');
    }
  });

  // Mutation pour la modification
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => api.post(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Succès !', 'Le produit a été modifié.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        closeModal();
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'La modification a échoué.', 'error');
    }
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Supprimé !', 'Le produit a été supprimé.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'La suppression a échoué.', 'error');
    }
  });

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (!editingProduct) {
      setSlug(
        value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      );
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setSlug(product.slug);
      setCategoryId(product.category?.id || '');
      setDescription(product.description || '');
      setShortDescription(product.short_description || '');
      setPrice(product.price);
      setStock(product.stock);
      setColor(product.color || '');
      setMaterial(product.material || '');
      setBrand(product.brand || '');
      setIsFeatured(product.is_featured);
      setImagePreview(product.image || '');
      setSelectedMainMediaPath('');
      setExistingGalleries(product.galleries || []);
    } else {
      setEditingProduct(null);
      setName('');
      setSlug('');
      setCategoryId('');
      setDescription('');
      setShortDescription('');
      setPrice('');
      setStock('');
      setColor('');
      setMaterial('');
      setBrand('');
      setIsFeatured(false);
      setImagePreview('');
      setSelectedMainMediaPath('');
      setExistingGalleries([]);
    }
    setImageFile(null);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    setNewGalleryPaths([]);
    setDeletedGalleryIds([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setSelectedMainMediaPath('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewGalleryFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewGalleryPreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleOpenMediaPicker = (target) => {
    setActiveMediaTarget(target);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelected = (media) => {
    if (activeMediaTarget === 'main') {
      setSelectedMainMediaPath(media.path);
      setImagePreview(media.url);
      setImageFile(null);
    } else if (activeMediaTarget === 'gallery') {
      setNewGalleryPaths(prev => [...prev, media.path]);
      setNewGalleryPreviews(prev => [...prev, media.url]);
    }
    setIsMediaPickerOpen(false);
  };

  const removeNewGalleryImage = (index) => {
    // Vérifier si c'est un fichier ou un chemin réutilisé
    setNewGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Pour simplifier, nous filtrons à la fois les fichiers et les chemins à cet index
    // Note: cette implémentation simple suppose que l'index correspond
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setNewGalleryPaths(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (id) => {
    setDeletedGalleryIds(prev => [...prev, id]);
    setExistingGalleries(prev => prev.filter(g => g.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('category_id', categoryId);
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('short_description', shortDescription);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('color', color);
    formData.append('material', material);
    formData.append('brand', brand);
    formData.append('is_featured', isFeatured ? 1 : 0);

    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (selectedMainMediaPath) {
      formData.append('image_path', selectedMainMediaPath);
    }

    // Nouveaux uploads de galerie
    newGalleryFiles.forEach((file) => {
      formData.append('galleries[]', file);
    });

    // Nouveaux chemins de galerie réutilisés
    newGalleryPaths.forEach((path, i) => {
      formData.append(`galleries_paths[${i}]`, path);
    });

    // Anciens ID à supprimer (pour la mise à jour)
    deletedGalleryIds.forEach((id, i) => {
      formData.append(`deleted_gallery_ids[${i}]`, id);
    });

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (product) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous allez supprimer le produit "${product.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111111',
      cancelButtonColor: '#7F7F7F',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(product.id);
      }
    });
  };

  if (isLoading) return <Loader fullPage />;
  if (error) return <div className="text-red-500">Erreur : {error.message}</div>;

  const productsList = productsData?.data || [];
  const meta = productsData?.meta || { current_page: 1, last_page: 1, total: 0 };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title & Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-luxury-charcoal">Gestion des Produits</h2>
          <p className="text-sm text-luxury-gray">Gérez l'ensemble des articles en vente sur Hafrose.</p>
        </div>
        <Button
          onClick={() => openModal()}
          variant="primary"
          icon={<FiPlus className="w-4 h-4" />}
        >
          Ajouter un Produit
        </Button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap bg-white p-4 rounded border border-luxury-gold/10 gap-4 items-center shadow-sm">
        
        {/* Search */}
        <div className="flex bg-luxury-light-gray/40 items-center gap-3 px-3 py-2 rounded border border-luxury-gold/10 w-full sm:max-w-xs">
          <FiSearch className="text-luxury-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, marque..."
            className="bg-transparent border-none outline-none text-sm text-luxury-charcoal w-full"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <FiFilter className="text-luxury-gold w-4 h-4" />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-luxury-gold/15 rounded text-sm outline-none cursor-pointer"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Featured Filter */}
        <select
          value={featuredFilter}
          onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white border border-luxury-gold/15 rounded text-sm outline-none cursor-pointer"
        >
          <option value="">Tous les produits</option>
          <option value="true">Vedettes uniquement</option>
        </select>

        <div className="ml-auto text-xs text-luxury-gray font-semibold">
          {meta.total} produit(s) trouvé(s)
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-luxury-gold/10 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-luxury-light-gray/40 border-b border-luxury-gold/10 text-xs text-luxury-gray uppercase tracking-wider">
                <th className="px-6 py-4 w-20">Image</th>
                <th className="px-6 py-4">Nom / Catégorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Marque / Modèle</th>
                <th className="px-6 py-4">Vedette</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsList.map((product) => (
                <tr key={product.id} className="border-b border-luxury-light-gray last:border-b-0 hover:bg-luxury-light-gray/20 transition-all duration-200">
                  <td className="px-6 py-4">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-12 h-12 rounded object-cover border border-luxury-gold/10"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-luxury-light-gray flex items-center justify-center text-luxury-gray rounded border border-dashed border-luxury-gray/30">
                        <FiImage className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-luxury-charcoal">{product.name}</div>
                    <div className="text-xs text-luxury-gray">{product.category?.name || 'Sans catégorie'}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-luxury-charcoal">
                    {parseFloat(product.price).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${product.stock <= 2 ? 'text-red-500' : 'text-luxury-charcoal'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-luxury-gray">
                    {product.brand || '-'} <span className="text-xs block">{product.material || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.is_featured ? (
                      <FiStar className="w-5 h-5 fill-luxury-gold text-luxury-gold" />
                    ) : (
                      <span className="text-luxury-light-gray">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 hover:bg-luxury-gold/10 text-luxury-charcoal hover:text-luxury-gold rounded transition-all duration-200"
                        title="Modifier"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-all duration-200"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productsList.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-luxury-gray">
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-luxury-gold/10 flex justify-between items-center">
            <span className="text-xs text-luxury-gray">Page {meta.current_page} sur {meta.last_page}</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                Précédent
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
                disabled={page === meta.last_page}
                variant="secondary"
                size="sm"
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Create/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-luxury-cream border border-luxury-gold/30 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-luxury-charcoal text-white border-b border-luxury-gold/20">
              <h3 className="font-serif text-lg text-luxury-gold">
                {editingProduct ? 'Modifier le Produit' : 'Créer un Produit'}
              </h3>
              <button onClick={closeModal} className="p-1 text-luxury-gray hover:text-white rounded">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              {/* Row 1: Name, Slug, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Vase d'Argile Dorée"
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="vase-d-argile-doree"
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Catégorie
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm cursor-pointer"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Price, Stock, Color, Material, Brand */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="49.00"
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Couleur
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Or / Noir"
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Matière
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Argile"
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Hafrose Paris"
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Short Description & Featured checkbox */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Description Courte
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Présentation rapide en une phrase..."
                    className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-3 py-3 px-4 border border-luxury-gold/15 bg-white rounded cursor-pointer">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-luxury-gold w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="is_featured" className="text-xs font-semibold text-luxury-charcoal cursor-pointer">
                    Produit Vedette
                  </label>
                </div>
              </div>

              {/* Row 4: Long Description */}
              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Description Complète
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Histoire, processus artisanal et caractéristiques du produit..."
                  rows="4"
                  className="w-full px-4 py-2.5 bg-white border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm resize-none"
                />
              </div>

              {/* Row 5: Main Image Upload/Picker */}
              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Image Principale du Produit
                </label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-24 h-24 rounded bg-white border border-luxury-gold/15 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu principal" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage className="w-8 h-8 text-luxury-light-gray" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-luxury-gold/25 hover:border-luxury-gold rounded text-xs cursor-pointer text-luxury-charcoal font-semibold">
                        <FiUpload />
                        <span>Téléverser</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                      </label>
                      <Button
                        type="button"
                        onClick={() => handleOpenMediaPicker('main')}
                        variant="primary"
                        size="sm"
                        icon={<FiImage />}
                      >
                        Médiathèque
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: Galleries Multiple Select/Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider">
                    Galerie d'Images (Upload multiple)
                  </label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-luxury-gold/25 hover:border-luxury-gold rounded text-[10px] uppercase font-bold cursor-pointer text-luxury-charcoal">
                      <FiUpload />
                      <span>Ajouter des fichiers</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryImagesChange}
                        className="hidden"
                      />
                    </label>
                    <Button
                      type="button"
                      onClick={() => handleOpenMediaPicker('gallery')}
                      variant="primary"
                      size="xs"
                      icon={<FiImage />}
                    >
                      Ajouter de la médiathèque
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-4 p-4 bg-white border border-luxury-gold/15 rounded">
                  
                  {/* Existing Images (for edit mode) */}
                  {existingGalleries.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded border border-luxury-gold/10 overflow-hidden group">
                      <img src={img.image} alt="galerie" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(img.id)}
                        className="absolute inset-0 bg-red-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all duration-200"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {/* New previews (to be uploaded/linked) */}
                  {newGalleryPreviews.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded border border-luxury-gold/30 overflow-hidden group">
                      <img src={url} alt="nouveau aperçu" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewGalleryImage(index)}
                        className="absolute inset-0 bg-red-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all duration-200"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {existingGalleries.length === 0 && newGalleryPreviews.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-luxury-gray">
                      Aucune image dans la galerie.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold/10">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                  size="sm"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  Enregistrer
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal 
          onClose={() => setIsMediaPickerOpen(false)} 
          onSelect={handleMediaSelected} 
        />
      )}

    </div>
  );
}
