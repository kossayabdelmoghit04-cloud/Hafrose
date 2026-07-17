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
import AdminActionButton from '../../components/ui/AdminActionButton';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { Form, Input, NumberField, Textarea, Select, Checkbox } from '../../components/ui/form';

export default function Products() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState('main');

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
  const { data: productsData, isLoading, error, isFetching } = useQuery({
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
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewGalleryFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => { setNewGalleryPreviews(prev => [...prev, reader.result]); };
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
    setNewGalleryPreviews(prev => prev.filter((_, i) => i !== index));
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

    if (imageFile) formData.append('image', imageFile);
    if (selectedMainMediaPath) formData.append('image_path', selectedMainMediaPath);

    newGalleryFiles.forEach((file) => { formData.append('galleries[]', file); });
    newGalleryPaths.forEach((path, i) => { formData.append(`galleries_paths[${i}]`, path); });
    deletedGalleryIds.forEach((id, i) => { formData.append(`deleted_gallery_ids[${i}]`, id); });

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
      if (result.isConfirmed) { deleteMutation.mutate(product.id); }
    });
  };

  if (error) return (
    <Card variant="alert" animate={false}>
      <Card.Body><p className="text-red-500">Erreur : {error.message}</p></Card.Body>
    </Card>
  );

  const productsList = productsData?.data || [];
  const meta = productsData?.meta || { current_page: 1, last_page: 1, total: 0 };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-serif text-luxury-charcoal">Gestion des Produits</h2>
        <p className="text-sm text-luxury-gray">Gérez l'ensemble des articles en vente sur Hafrose.</p>
      </div>

      {/* Products Table System */}
      <Table aria-label="Liste des produits" variant="admin" density="comfortable" resetPage={() => setPage(1)}>
        <Table.Toolbar>
          <Table.Search
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Rechercher par nom, marque..."
          />
          <Table.Filter
            label="Catégorie"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            value={categoryFilter}
            onChange={(val) => { setCategoryFilter(val); setPage(1); }}
            allLabel="Toutes les catégories"
          />
          <Table.Filter
            label="Vedette"
            options={[{ value: 'true', label: 'Vedettes uniquement' }]}
            value={featuredFilter}
            onChange={(val) => { setFeaturedFilter(val); setPage(1); }}
            allLabel="Tous les produits"
          />
          <Table.Actions>
            <Button
              onClick={() => openModal()}
              variant="primary"
              size="sm"
              icon={<FiPlus className="w-4 h-4" />}
            >
              Ajouter
            </Button>
          </Table.Actions>
          <Table.ResultCount count={meta.total} label="produit(s)" />
        </Table.Toolbar>

        <Table.Container>
          <Table.Head>
            <Table.HeadRow>
              <Table.HeadCell width="w-20" hideBelow="sm">Image</Table.HeadCell>
              <Table.HeadCell>Nom / Catégorie</Table.HeadCell>
              <Table.HeadCell align="right">Prix</Table.HeadCell>
              <Table.HeadCell align="center" hideBelow="md">Stock</Table.HeadCell>
              <Table.HeadCell hideBelow="lg">Marque</Table.HeadCell>
              <Table.HeadCell align="center" hideBelow="sm">Vedette</Table.HeadCell>
              <Table.HeadCell align="right">Actions</Table.HeadCell>
            </Table.HeadRow>
          </Table.Head>

          <Table.Body loading={isLoading} skeletonRows={8} skeletonColumns={7} isFetching={isFetching}>
            {productsList.map((product) => (
              <Table.Row key={product.id}>
                <Table.Cell hideBelow="sm">
                  <Table.ImageCell src={product.image} alt={product.name} size="md" />
                </Table.Cell>
                <Table.Cell>
                  <Table.PrimaryText>{product.name}</Table.PrimaryText>
                  <Table.SecondaryText>{product.category?.name || 'Sans catégorie'}</Table.SecondaryText>
                </Table.Cell>
                <Table.Cell align="right" numeric>
                  {parseFloat(product.price).toFixed(2)} €
                </Table.Cell>
                <Table.Cell align="center" hideBelow="md">
                  <Table.StockIndicator value={product.stock} threshold={2} />
                </Table.Cell>
                <Table.Cell hideBelow="lg" truncate>
                  {product.brand || '-'}
                  <Table.SecondaryText>{product.material || '-'}</Table.SecondaryText>
                </Table.Cell>
                <Table.Cell align="center" hideBelow="sm">
                  {product.is_featured ? (
                    <FiStar className="w-4 h-4 fill-luxury-gold text-luxury-gold mx-auto" aria-label="Vedette" />
                  ) : (
                    <span className="text-luxury-light-gray" aria-label="Non vedette">—</span>
                  )}
                </Table.Cell>
                <Table.Cell align="right">
                  <Table.RowActions>
                    <AdminActionButton action="edit" onClick={() => openModal(product)} title="Modifier" />
                    <AdminActionButton action="delete" onClick={() => handleDelete(product)} title="Supprimer" />
                  </Table.RowActions>
                </Table.Cell>
              </Table.Row>
            ))}

            <Table.Empty
              visible={productsList.length === 0 && !isLoading}
              colSpan={7}
              title="Aucun produit trouvé"
              description="Modifiez vos critères de recherche ou ajoutez un nouveau produit."
              action={
                <Button variant="primary" size="sm" onClick={() => openModal()}>
                  Ajouter un produit
                </Button>
              }
            />
          </Table.Body>
        </Table.Container>

        <Table.Footer>
          <Table.Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            onPrev={() => setPage(p => Math.max(p - 1, 1))}
            onNext={() => setPage(p => Math.min(p + 1, meta.last_page))}
          />
        </Table.Footer>
      </Table>

      {/* Modal - Create/Edit Product */}
      <Modal isOpen={isModalOpen} onClose={closeModal} variant="admin" size="xl">
        <Modal.Backdrop />
        <Modal.Container className="max-h-[90vh] flex flex-col overflow-hidden">
          <Modal.Header className="bg-luxury-charcoal text-white border-b border-luxury-gold/20">
            <Modal.Title className="text-luxury-gold">
              {editingProduct ? 'Modifier le Produit' : 'Créer un Produit'}
            </Modal.Title>
            <Modal.CloseButton className="text-luxury-gray hover:text-white" />
          </Modal.Header>

          <Form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
            <Modal.Body className="overflow-y-auto flex-grow">
              <Form.Section>

                {/* Row 1 : Nom, Slug, Catégorie */}
                <Form.Row cols={{ default: 1, md: 3 }}>
                  <Form.Field name="prod-name">
                    <Form.Label required>Nom du produit</Form.Label>
                    <Input
                      variant="admin"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Vase d'Argile Dorée"
                      required
                    />
                    <Form.Error />
                  </Form.Field>

                  <Form.Field name="prod-slug">
                    <Form.Label required>Slug</Form.Label>
                    <Input
                      variant="admin"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="vase-d-argile-doree"
                      required
                      className="font-mono"
                    />
                    <Form.Helper>Généré automatiquement depuis le nom</Form.Helper>
                    <Form.Error />
                  </Form.Field>

                  <Form.Field name="prod-category">
                    <Form.Label required>Catégorie</Form.Label>
                    <Select
                      variant="admin"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      options={categoryOptions}
                      placeholder="Sélectionner une catégorie"
                      required
                    />
                    <Form.Error />
                  </Form.Field>
                </Form.Row>

                {/* Row 2 : Prix, Stock, Couleur, Matière, Marque */}
                <Form.Row cols={{ default: 2, md: 5 }}>
                  <Form.Field name="prod-price">
                    <Form.Label required>Prix (€)</Form.Label>
                    <NumberField
                      variant="admin"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49.00"
                      required
                    />
                    <Form.Error />
                  </Form.Field>

                  <Form.Field name="prod-stock">
                    <Form.Label required>Stock</Form.Label>
                    <NumberField
                      variant="admin"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="10"
                      required
                    />
                    <Form.Error />
                  </Form.Field>

                  <Form.Field name="prod-color">
                    <Form.Label>Couleur</Form.Label>
                    <Input
                      variant="admin"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Or / Noir"
                    />
                  </Form.Field>

                  <Form.Field name="prod-material">
                    <Form.Label>Matière</Form.Label>
                    <Input
                      variant="admin"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Argile"
                    />
                  </Form.Field>

                  <Form.Field name="prod-brand">
                    <Form.Label>Marque</Form.Label>
                    <Input
                      variant="admin"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Hafrose Paris"
                    />
                  </Form.Field>
                </Form.Row>

                {/* Row 3 : Description courte + Vedette */}
                <Form.Row cols={{ default: 1, md: 4 }}>
                  <Form.Field name="prod-short-desc" className="md:col-span-3">
                    <Form.Label>Description Courte</Form.Label>
                    <Input
                      variant="admin"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Présentation rapide en une phrase..."
                    />
                  </Form.Field>

                  <Form.Field name="prod-featured" className="flex items-end pb-1.5">
                    <Checkbox
                      variant="admin"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      label="Produit Vedette"
                    />
                  </Form.Field>
                </Form.Row>

                {/* Row 4 : Description complète */}
                <Form.Field name="prod-description">
                  <Form.Label required>Description Complète</Form.Label>
                  <Textarea
                    variant="admin"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Histoire, processus artisanal et caractéristiques du produit..."
                    rows={4}
                    required
                  />
                  <Form.Counter current={description.length} />
                  <Form.Error />
                </Form.Field>

                <Form.Divider />

                {/* Image principale */}
                <div>
                  <p className="text-label text-anthracite/70 mb-3">Image Principale du Produit</p>
                  <div className="flex gap-4 items-center">
                    <div className="relative w-24 h-24 rounded bg-white border border-luxury-gold/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Aperçu principal" className="w-full h-full object-cover" />
                      ) : (
                        <FiImage className="w-8 h-8 text-luxury-light-gray" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-luxury-gold/25 hover:border-luxury-gold rounded text-xs cursor-pointer text-luxury-charcoal font-semibold">
                        <FiUpload />
                        <span>Téléverser</span>
                        <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
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

                {/* Galerie */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-label text-anthracite/70">Galerie d'Images</p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-luxury-gold/25 hover:border-luxury-gold rounded text-[10px] uppercase font-bold cursor-pointer text-luxury-charcoal">
                        <FiUpload />
                        <span>Ajouter des fichiers</span>
                        <input type="file" multiple accept="image/*" onChange={handleGalleryImagesChange} className="hidden" />
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

                  <Card variant="flat" size="sm" animate={false} className="!p-0">
                    <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-4 p-4">
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
                  </Card>
                </div>

              </Form.Section>
            </Modal.Body>

            <Modal.Footer>
              <Modal.Actions>
                <Button type="button" onClick={closeModal} variant="secondary" size="sm">
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
              </Modal.Actions>
            </Modal.Footer>
          </Form>
        </Modal.Container>
      </Modal>

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
