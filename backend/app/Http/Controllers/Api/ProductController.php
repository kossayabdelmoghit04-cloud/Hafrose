<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductSearchRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductFiltersResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use HttpResponses;

    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Obtenir la liste filtrée et paginée des produits.
     */
    public function index(ProductSearchRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $perPage = (int) ($filters['per_page'] ?? 12);

        $products = $this->productService->getPaginatedProducts($filters, $perPage);
        
        // Retourne la pagination complète enveloppée sous la clé 'data' pour la cohérence
        $paginatedData = ProductResource::collection($products)->response()->getData(true);

        return $this->successResponse($paginatedData);
    }

    /**
     * Obtenir le détail d'un produit par son slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = $this->productService->getProductBySlug($slug);
        return $this->successResponse(new ProductResource($product));
    }

    /**
     * Obtenir tous les filtres disponibles pour la boutique (Shop).
     */
    public function filters(): JsonResponse
    {
        $filtersData = $this->productService->getFiltersData();
        return $this->successResponse(new ProductFiltersResource($filtersData));
    }

    /**
     * Obtenir les produits similaires à un produit donné.
     *
     * GET /api/products/{product}/related
     *
     * Utilise le route-model binding sur l'ID du produit.
     * Retourne 4 produits (configurable) de la même catégorie,
     * triés par proximité de prix. Complète avec les plus récents si nécessaire.
     *
     * Le produit courant n'apparaît jamais dans les résultats.
     */
    public function related(Product $product): JsonResponse
    {
        $limit = config('recommendations.related_limit', 4);

        $related = $this->productService->getRelatedProducts($product, $limit);

        return $this->successResponse(ProductResource::collection($related));
    }

    /**
     * Obtenir les produits les plus populaires.
     *
     * GET /api/products/popular
     *
     * Stratégie : produits les plus commandés (order_items count),
     * avec fallback sur is_featured puis created_at.
     * Retourne 8 produits (configurable).
     */
    public function popular(): JsonResponse
    {
        $limit = config('recommendations.popular_limit', 8);

        $products = $this->productService->getPopularProducts($limit);

        return $this->successResponse(ProductResource::collection($products));
    }
}
