import React, { useState } from 'react';
import {
  useAdminProducts,
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';
import { Product, Category } from '../../types/models';
import {
  ProductFilterBar,
  ProductTable,
  ProductFormModal,
  ProductDeleteModal,
} from '../../components/admin/products';

export const AdminProductsPage: React.FC = () => {
  useSEO({ title: 'Gestion des Produits | HAFROSE Admin', noIndex: true });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Hooks
  const { data: productsData, isLoading, isError, refetch } = useAdminProducts({
    page,
    search: search || undefined,
    category_id: selectedCategory ? Number(selectedCategory) : undefined,
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useAdminCategories();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const productsList: Product[] = productsData?.data ?? [];
  const meta = productsData?.meta;
  const categoriesList: Category[] = categoriesData?.data ?? [];

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeletingId(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Impossible de supprimer ce produit.';
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
        message="Impossible d'obtenir la liste des produits depuis le serveur."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* FILTER BAR */}
      <ProductFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categoriesList}
        onOpenCreateModal={handleOpenCreate}
      />

      {/* PRODUCTS TABLE */}
      <ProductTable
        products={productsList}
        meta={meta}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
        onDelete={setDeletingId}
      />

      {/* CREATE / EDIT MODAL */}
      <ProductFormModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        categories={categoriesList}
        isCategoriesLoading={isCategoriesLoading}
        isCategoriesError={isCategoriesError}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ProductDeleteModal
        deletingId={deletingId}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminProductsPage;
