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
import Button from '../../components/ui/Button';
import AdminActionButton from '../../components/ui/AdminActionButton';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

export default function Categories() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
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
          .replace(/[\u0300-\u036f]/g, '')
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
      setSelectedMediaPath('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaSelected = (media) => {
    setSelectedMediaPath(media.path);
    setImagePreview(media.url);
    setImageFile(null);
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

  const perPage = 10;
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedCategories = filteredCategories.slice((page - 1) * perPage, page * perPage);
  const lastPage = Math.ceil(filteredCategories.length / perPage) || 1;

  if (isLoading) return <Loader fullPage />;
  if (error) return (
    <Card variant="alert" animate={false}>
      <Card.Body><p className="text-red-500">Erreur : {error.message}</p></Card.Body>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-serif text-luxury-charcoal">Gestion des Catégories</h2>
        <p className="text-sm text-luxury-gray">Organisez et gérez le catalogue de produits Hafrose.</p>
      </div>

      {/* Categories Table System */}
      <Table aria-label="Liste des catégories" variant="admin" density="comfortable" resetPage={() => setPage(1)}>
        <Table.Toolbar>
          <Table.Search
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Rechercher une catégorie par nom ou slug..."
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
          <Table.ResultCount count={filteredCategories.length} label="catégorie(s)" />
        </Table.Toolbar>

        <Table.Container>
          <Table.Head>
            <Table.HeadRow>
              <Table.HeadCell width="w-24">Image</Table.HeadCell>
              <Table.HeadCell>Nom</Table.HeadCell>
              <Table.HeadCell>Slug</Table.HeadCell>
              <Table.HeadCell hideBelow="md">Description</Table.HeadCell>
              <Table.HeadCell align="right">Actions</Table.HeadCell>
            </Table.HeadRow>
          </Table.Head>

          <Table.Body loading={isLoading} skeletonRows={5} skeletonColumns={5}>
            {paginatedCategories.map((category) => (
              <Table.Row key={category.id}>
                <Table.Cell>
                  <Table.ImageCell src={category.image} alt={category.name} size="md" rounded />
                </Table.Cell>
                <Table.Cell>
                  <Table.PrimaryText>{category.name}</Table.PrimaryText>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-mono text-xs text-luxury-gray">{category.slug}</span>
                </Table.Cell>
                <Table.Cell hideBelow="md" truncate>
                  {category.description || '-'}
                </Table.Cell>
                <Table.Cell align="right">
                  <Table.RowActions>
                    <AdminActionButton
                      action="edit"
                      onClick={() => openModal(category)}
                      title="Modifier"
                    />
                    <AdminActionButton
                      action="delete"
                      onClick={() => handleDelete(category)}
                      title="Supprimer"
                    />
                  </Table.RowActions>
                </Table.Cell>
              </Table.Row>
            ))}

            <Table.Empty
              visible={filteredCategories.length === 0 && !isLoading}
              colSpan={5}
              icon={<FiInbox />}
              title="Aucune catégorie trouvée"
              description="Modifiez vos critères de recherche ou ajoutez une nouvelle catégorie."
              action={
                <Button variant="primary" size="sm" onClick={() => openModal()}>
                  Ajouter une catégorie
                </Button>
              }
            />
          </Table.Body>
        </Table.Container>

        <Table.Footer>
          <Table.Pagination
            currentPage={page}
            lastPage={lastPage}
            total={filteredCategories.length}
            onPrev={() => setPage(p => Math.max(p - 1, 1))}
            onNext={() => setPage(p => Math.min(p + 1, lastPage))}
          />
        </Table.Footer>
      </Table>

      {/* Modal - Create/Edit Category — Card variant="admin" */}
      <Modal isOpen={isModalOpen} onClose={closeModal} variant="admin" size="lg">
        <Modal.Backdrop />
        <Modal.Container>
          {/* Modal Header */}
          <Modal.Header className="px-6 py-4 bg-luxury-charcoal text-white border-b border-luxury-gold/20">
            <Modal.Title className="text-luxury-gold">
              {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
            </Modal.Title>
            <Modal.CloseButton className="text-luxury-gray hover:text-white" />
          </Modal.Header>

          <form onSubmit={handleSubmit}>
            <Modal.Body className="space-y-6">
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
                        <Button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(true)}
                          variant="primary"
                          size="sm"
                          icon={<FiImage />}
                        >
                          Médiathèque
                        </Button>
                      </div>
                      <Card.Meta>Recommandé : 600x600 px (JPEG, PNG, WEBP), max 5 Mo.</Card.Meta>
                    </div>
                  </div>
                </div>
            </Modal.Body>

              {/* Actions buttons */}
              <Modal.Footer>
                <Modal.Actions>
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
                </Modal.Actions>
              </Modal.Footer>
            </form>
          </Modal.Container>
        </Modal>

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
