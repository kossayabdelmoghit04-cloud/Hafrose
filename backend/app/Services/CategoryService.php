<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CategoryService
{
    protected CategoryRepositoryInterface $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    /**
     * Récupérer toutes les catégories.
     */
    public function getAllCategories(): Collection
    {
        return $this->categoryRepository->all();
    }

    /**
     * Récupérer une catégorie par son slug.
     */
    public function getCategoryBySlug(string $slug)
    {
        $category = $this->categoryRepository->findBySlug($slug);

        if (!$category) {
            throw new ModelNotFoundException("Category not found");
        }

        return $category;
    }

    /**
     * Récupérer une catégorie par son ID.
     */
    public function getCategoryById(int $id)
    {
        $category = $this->categoryRepository->find($id);

        if (!$category) {
            throw new ModelNotFoundException("Category not found");
        }

        return $category;
    }

    /**
     * Créer une catégorie avec image.
     */
    public function createCategory(array $data, ?\Illuminate\Http\UploadedFile $imageFile = null): Category
    {
        if ($imageFile) {
            $path = $imageFile->store('categories', 'public');
            $data['image'] = \Illuminate\Support\Facades\Storage::url($path);
        } elseif (!empty($data['image_path'])) {
            $data['image'] = \Illuminate\Support\Facades\Storage::url($data['image_path']);
        }

        return $this->categoryRepository->create($data);
    }

    /**
     * Mettre à jour une catégorie et son image.
     */
    public function updateCategory(Category $category, array $data, ?\Illuminate\Http\UploadedFile $imageFile = null): Category
    {
        if ($imageFile) {
            // Supprimer l'ancienne image
            if ($category->image) {
                $this->deletePhysicalImage($category->image);
            }
            $path = $imageFile->store('categories', 'public');
            $data['image'] = \Illuminate\Support\Facades\Storage::url($path);
        } elseif (!empty($data['image_path'])) {
            $data['image'] = \Illuminate\Support\Facades\Storage::url($data['image_path']);
        }

        return $this->categoryRepository->update($category, $data);
    }

    /**
     * Supprimer une catégorie.
     */
    public function deleteCategory(Category $category): bool
    {
        if ($category->image) {
            $this->deletePhysicalImage($category->image);
        }

        return $this->categoryRepository->delete($category);
    }

    /**
     * Supprimer physiquement un fichier image.
     */
    private function deletePhysicalImage(string $url): void
    {
        $path = parse_url($url, PHP_URL_PATH);
        $relativePath = str_replace('/storage/', '', $path);
        
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
        }
    }
}
