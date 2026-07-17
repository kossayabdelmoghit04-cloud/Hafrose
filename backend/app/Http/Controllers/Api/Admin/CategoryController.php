<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\AdminLog;
use App\Services\AdminLogService;
use App\Services\CategoryService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use HttpResponses;

    public function __construct(
        protected CategoryService  $categoryService,
        protected AdminLogService  $adminLogService,
    ) {}

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
        $data      = $request->validated();
        $imageFile = $request->file('image');

        $category = $this->categoryService->createCategory($data, $imageFile);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_CREATE,
            resource:   AdminLog::RESOURCE_CATEGORY,
            resourceId: $category->id,
            newValues:  $this->adminLogService->sanitize($data, ['image']),
        );

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
        $category  = $this->categoryService->getCategoryById($id);
        $oldValues = $this->adminLogService->extractModelValues($category, ['name', 'slug', 'description', 'is_active']);
        $data      = $request->validated();
        $imageFile = $request->file('image');

        $updated = $this->categoryService->updateCategory($category, $data, $imageFile);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_UPDATE,
            resource:   AdminLog::RESOURCE_CATEGORY,
            resourceId: $category->id,
            oldValues:  $oldValues,
            newValues:  $this->adminLogService->sanitize($data, ['image']),
        );

        return $this->successResponse(
            new CategoryResource($updated),
            'Catégorie modifiée avec succès.'
        );
    }

    /**
     * Supprimer une catégorie.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);

        // Vérifier que la catégorie n'a pas de produits associés
        if ($category->products()->count() > 0) {
            return $this->errorResponse(
                'Impossible de supprimer cette catégorie car elle contient des produits.',
                409
            );
        }

        $snapshot = $this->adminLogService->extractModelValues($category, ['id', 'name', 'slug']);

        $this->categoryService->deleteCategory($category);

        $this->adminLogService->log(
            request:    $request,
            action:     AdminLog::ACTION_DELETE,
            resource:   AdminLog::RESOURCE_CATEGORY,
            resourceId: $id,
            oldValues:  $snapshot,
        );

        return $this->successResponse(null, 'Catégorie supprimée avec succès.');
    }
}
