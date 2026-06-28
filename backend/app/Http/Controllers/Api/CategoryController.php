<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

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
     * Obtenir le détail d'une catégorie par son slug.
     */
    public function show(string $slug): JsonResponse
    {
        $category = $this->categoryService->getCategoryBySlug($slug);
        return $this->successResponse(new CategoryResource($category));
    }
}
