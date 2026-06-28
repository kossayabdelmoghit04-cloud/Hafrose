<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use HttpResponses;

    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * Obtenir la liste de toutes les catégories.
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getAllCategories();
        return $this->successResponse(CategoryResource::collection($categories));
    }

    /**
     * Créer une nouvelle catégorie.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $imageFile = $request->file('image');

        $category = $this->categoryService->createCategory($data, $imageFile);

        return $this->successResponse(
            new CategoryResource($category),
            'Catégorie créée avec succès.',
            201
        );
    }

    /**
     * Mettre à jour une catégorie existante.
     */
    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);
        $data = $request->validated();
        $imageFile = $request->file('image');

        $updated = $this->categoryService->updateCategory($category, $data, $imageFile);

        return $this->successResponse(
            new CategoryResource($updated),
            'Catégorie modifiée avec succès.'
        );
    }

    /**
     * Supprimer une catégorie.
     */
    public function destroy(int $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);

        // Vérifier que la catégorie n'a pas de produits associés
        if ($category->products()->count() > 0) {
            return $this->errorResponse(
                'Impossible de supprimer cette catégorie car elle contient des produits.',
                409
            );
        }

        $this->categoryService->deleteCategory($category);

        return $this->successResponse(null, 'Catégorie supprimée avec succès.');
    }
}
