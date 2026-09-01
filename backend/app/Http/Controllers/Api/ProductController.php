<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdvancedSearchRequest;
use App\Http\Requests\PopularProductsRequest;
use App\Http\Requests\ProductSearchRequest;
use App\Http\Resources\ProductFiltersResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Traits\HttpResponses;
use Illuminate\Http\JsonResponse;

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

        return $this->paginatedResponse(ProductResource::collection($products));
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
    public function related(string $identifier): JsonResponse
    {
        $product = is_numeric($identifier)
            ? $this->productService->getProductById((int) $identifier)
            : $this->productService->getProductBySlug($identifier);

        $limit = config('recommendations.related_limit', 4);

        $related = $this->productService->getRelatedProducts($product, $limit);

        return $this->successResponse(ProductResource::collection($related));
    }

    /**
     * Obtenir les produits similaires de la même catégorie, triés aléatoirement.
     *
     * GET /api/products/{product}/similar
     */
    public function similar(string $identifier): JsonResponse
    {
        $product = is_numeric($identifier)
            ? $this->productService->getProductById((int) $identifier)
            : $this->productService->getProductBySlug($identifier);

        $products = $this->productService->getSimilarProducts($product, 8);

        return $this->successResponse(ProductResource::collection($products));
    }

    /**
     * Obtenir les produits les plus populaires.
     *
     * GET /api/products/popular
     *
     * Stratégie : produits les plus commandés,
     * pondéré par le nombre d'avis approuvés et la note moyenne.
     * Retourne 8 produits par défaut (max 50).
     */
    public function popular(PopularProductsRequest $request): JsonResponse
    {
        $limit = (int) ($request->validated()['limit'] ?? config('recommendations.popular_limit', 8));

        $products = $this->productService->getPopularProductsWithWeights($limit);

        return $this->successResponse(ProductResource::collection($products));
    }

    /**
     * Moteur de recherche avancé de produits.
     *
     * GET /api/products/search
     */
    public function search(AdvancedSearchRequest $request): JsonResponse
    {
        $params = $request->validated();
        $perPage = (int) ($params['per_page'] ?? 12);

        $products = $this->productService->searchProducts($params, $perPage);

        return $this->paginatedResponse(ProductResource::collection($products));
    }
}
