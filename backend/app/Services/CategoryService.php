<?php

namespace App\Services;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CategoryService
{
    protected CategoryRepositoryInterface  $categoryRepository;
    protected ImageOptimizationService     $imageOptimizationService;

    public function __construct(
        CategoryRepositoryInterface $categoryRepository,
        ImageOptimizationService    $imageOptimizationService
    ) {
        $this->categoryRepository       = $categoryRepository;
        $this->imageOptimizationService = $imageOptimizationService;
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

        if (! $category) {
            throw new ModelNotFoundException('Category not found');
        }

        return $category;
    }

    /**
     * Récupérer une catégorie par son ID.
     */
    public function getCategoryById(int $id)
    {
        $category = $this->categoryRepository->find($id);

        if (! $category) {
            throw new ModelNotFoundException('Category not found');
        }

        return $category;
    }

    /**
     * Créer une catégorie avec image optimisée.
     *
     * L'image est redimensionnée et compressée via ImageOptimizationService.
     * Une version WebP est générée en parallèle si GD le supporte.
     */
    public function createCategory(array $data, ?UploadedFile $imageFile = null): Category
    {
        if ($imageFile) {
            $result       = $this->imageOptimizationService->optimizeAndStore($imageFile, 'public', 'categories');
            $data['image'] = $result['original'];
        } elseif (! empty($data['image_path'])) {
            $cleanPath     = ltrim(str_replace('/storage/', '', $data['image_path']), '/');
            $data['image'] = $cleanPath;
        }

        return $this->categoryRepository->create($data);
    }

    /**
     * Mettre à jour une catégorie et son image.
     */
    public function updateCategory(Category $category, array $data, ?UploadedFile $imageFile = null): Category
    {
        if ($imageFile) {
            // Supprimer l'ancienne image et ses variantes
            if ($category->image) {
                $this->imageOptimizationService->deleteWithVariants($category->image, 'public');
            }

            $result        = $this->imageOptimizationService->optimizeAndStore($imageFile, 'public', 'categories');
            $data['image'] = $result['original'];
        } elseif (! empty($data['image_path'])) {
            $cleanPath     = ltrim(str_replace('/storage/', '', $data['image_path']), '/');
            $data['image'] = $cleanPath;
        } else {
            // Conserver l'image existante si aucune nouvelle image n'est envoyée
            unset($data['image']);
        }

        return $this->categoryRepository->update($category, $data);
    }

    /**
     * Supprimer une catégorie et ses images associées (original + variantes + WebP).
     */
    public function deleteCategory(Category $category): bool
    {
        if ($category->image) {
            $this->imageOptimizationService->deleteWithVariants($category->image, 'public');
        }

        return $this->categoryRepository->delete($category);
    }

    /**
     * Supprimer physiquement un fichier image sur le disque public.
     * Conservé pour la compatibilité avec les images existantes sans variantes.
     */
    private function deletePhysicalImage(string $url): void
    {
        $path         = parse_url($url, PHP_URL_PATH) ?? $url;
        $relativePath = str_replace('/storage/', '', $path);
        $relativePath = ltrim($relativePath, '/');

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
